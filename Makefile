
.PHONY: container-image-api container-image-ui container-images

include *compose.env

IMAGE_REGISTRY ?= quay.io
IMAGE_GROUP ?= streamshub
VERSION ?= $(shell mvn help:evaluate -Dexpression=project.version -q -DforceStdout | tr '[:upper:]' '[:lower:]')
CSV_VERSION ?= $(VERSION)

CONSOLE_API_IMAGE ?= $(IMAGE_REGISTRY)/$(IMAGE_GROUP)/console-api:$(VERSION)
CONSOLE_UI_IMAGE ?= $(IMAGE_REGISTRY)/$(IMAGE_GROUP)/console-ui:$(VERSION)

CONSOLE_OPERATOR_IMAGE ?= $(IMAGE_REGISTRY)/$(IMAGE_GROUP)/console-operator:$(VERSION)
CONSOLE_OPERATOR_BUNDLE_IMAGE ?= $(IMAGE_REGISTRY)/$(IMAGE_GROUP)/console-operator-bundle:$(VERSION)
CONSOLE_OPERATOR_CATALOG_IMAGE ?= $(IMAGE_REGISTRY)/$(IMAGE_GROUP)/console-operator-catalog:$(VERSION)

CONTAINER_RUNTIME ?= $(shell which podman || which docker)
SKOPEO_TRANSPORT ?= $(shell which podman >/dev/null && echo "containers-storage:" || echo "docker-daemon:")
PLATFORMS ?= $(shell docker system info --format '{{.OSType}}/{{.Architecture}}' 2>/dev/null || podman info --format={{".Version.OsArch"}})
SKIP_RANGE ?= ""

CONSOLE_UI_NEXTAUTH_SECRET ?= $(shell openssl rand -base64 32)

# This helps to build CSV using Quarkus with correct image tags in lowercase "-snapshot" instead of "-SNAPSHOT" (default project pom value)
# Without this export, UI and API images could not be pulled from registry during the deployment of Console instance
export QUARKUS_CONTAINER_IMAGE_TAG=${VERSION}
export QUARKUS_KUBERNETES_VERSION=${VERSION}
export QUARKUS_DOCKER_ADDITIONAL_ARGS ?= --platform=${PLATFORMS}

container-image-api:
	mvn package -am -pl api -Pcontainer-image -DskipTests -Dquarkus.container-image.image=$(CONSOLE_API_IMAGE)

container-image-api-push: container-image-api
	skopeo copy --preserve-digests $(SKOPEO_TRANSPORT)$(CONSOLE_API_IMAGE) docker://$(CONSOLE_API_IMAGE)

container-image-operator:
	mvn package -am -pl operator -Pcontainer-image -DskipTests -Dquarkus.kubernetes.namespace='$${NAMESPACE}' -Dquarkus.container-image.image=$(CONSOLE_OPERATOR_IMAGE)
	operator/bin/modify-bundle-metadata.sh "VERSION=$(CSV_VERSION)" "SKIP_RANGE=$(SKIP_RANGE)" "SKOPEO_TRANSPORT=$(SKOPEO_TRANSPORT)" "PLATFORMS=$(PLATFORMS)"
	operator/bin/generate-catalog.sh operator/target/bundle/streamshub-console-operator
	$(CONTAINER_RUNTIME) build --platform=$(PLATFORMS) -t $(CONSOLE_OPERATOR_BUNDLE_IMAGE) -f operator/target/bundle/streamshub-console-operator/bundle.Dockerfile
	$(CONTAINER_RUNTIME) build --platform=$(PLATFORMS) -t $(CONSOLE_OPERATOR_CATALOG_IMAGE) -f operator/src/main/docker/catalog.Dockerfile operator

container-image-operator-push: container-image-operator
	skopeo copy --preserve-digests $(SKOPEO_TRANSPORT)$(CONSOLE_OPERATOR_IMAGE) docker://$(CONSOLE_OPERATOR_IMAGE)
	skopeo copy --preserve-digests $(SKOPEO_TRANSPORT)$(CONSOLE_OPERATOR_BUNDLE_IMAGE) docker://$(CONSOLE_OPERATOR_BUNDLE_IMAGE)
	skopeo copy --preserve-digests $(SKOPEO_TRANSPORT)$(CONSOLE_OPERATOR_CATALOG_IMAGE) docker://$(CONSOLE_OPERATOR_CATALOG_IMAGE)

container-image-ui:
	cd ui && \
	npm ci --omit=dev && \
	export BACKEND_URL=http://example && \
	export NEXTAUTH_SECRET=examplesecret && \
	export LOG_LEVEL=info && \
	export CONSOLE_MODE=read-only && \
	npm run build && \
	cd $(CURDIR) && \
	$(CONTAINER_RUNTIME) build --platform=$(PLATFORMS) -t $(CONSOLE_UI_IMAGE) ./ui -f ./ui/Dockerfile

container-image-ui-push: container-image-ui
	skopeo copy --preserve-digests $(SKOPEO_TRANSPORT)$(CONSOLE_UI_IMAGE) docker://$(CONSOLE_UI_IMAGE)

container-images: container-image-api container-image-ui container-image-operator

container-images-push: container-image-api-push container-image-ui-push container-image-operator-push

compose-up:
	> compose-runtime.env
	echo "CONSOLE_API_IMAGE=$(CONSOLE_API_IMAGE)" >> compose-runtime.env
	echo "CONSOLE_API_SERVICE_ACCOUNT_TOKEN=$(CONSOLE_API_SERVICE_ACCOUNT_TOKEN)" >> compose-runtime.env
	echo "CONSOLE_API_KUBERNETES_API_SERVER_URL=$(CONSOLE_API_KUBERNETES_API_SERVER_URL)" >> compose-runtime.env 
	echo "CONSOLE_UI_IMAGE=$(CONSOLE_UI_IMAGE)" >> compose-runtime.env
	echo "CONSOLE_UI_NEXTAUTH_SECRET=$(CONSOLE_UI_NEXTAUTH_SECRET)" >> compose-runtime.env
	$(CONTAINER_RUNTIME) compose --env-file compose-runtime.env up -d

compose-down:
	$(CONTAINER_RUNTIME) compose --env-file compose-runtime.env down
