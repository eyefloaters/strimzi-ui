package com.github.streamshub.console.api.support;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Stream;

import jakarta.enterprise.inject.Instance;
import jakarta.enterprise.inject.spi.CDI;

import org.eclipse.microprofile.openapi.OASFactory;
import org.eclipse.microprofile.openapi.OASFilter;
import org.eclipse.microprofile.openapi.models.Components;
import org.eclipse.microprofile.openapi.models.OpenAPI;
import org.eclipse.microprofile.openapi.models.PathItem;
import org.eclipse.microprofile.openapi.models.media.Content;
import org.eclipse.microprofile.openapi.models.media.MediaType;
import org.eclipse.microprofile.openapi.models.media.Schema;
import org.eclipse.microprofile.openapi.models.media.Schema.SchemaType;
import org.eclipse.microprofile.openapi.models.parameters.RequestBody;
import org.jboss.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.streamshub.console.api.support.StringListParamConverterProvider.StringListParamConverter;
import com.github.streamshub.console.config.ConsoleConfig;
import com.github.streamshub.console.config.security.GlobalSecurityConfig;

import io.smallrye.openapi.api.util.FilterUtil;
import io.smallrye.openapi.api.util.UnusedSchemaFilter;

public class OASModelFilter extends AbstractOperationFilter implements OASFilter {

    private static final Logger LOGGER = Logger.getLogger(OASModelFilter.class);
    private Map<Schema, Schema> dereferencedSchemas = new IdentityHashMap<>();

    @Override
    public RequestBody filterRequestBody(RequestBody requestBody) {
        Instance<ObjectMapper> objectMapper = CDI.current().select(ObjectMapper.class);

        // In-line external example (https://github.com/swagger-api/swagger-ui/issues/5433)
        Optional.ofNullable(requestBody.getContent())
            .map(Content::getMediaTypes)
            .map(Map::values)
            .map(Collection::stream)
            .orElseGet(Stream::empty)
            .map(MediaType::getExamples)
            .filter(Objects::nonNull)
            .map(Map::values)
            .flatMap(Collection::stream)
            .filter(example -> Objects.nonNull(example.getExternalValue()))
            .forEach(example -> {
                try (InputStream stream = getClass().getResourceAsStream(example.getExternalValue())) {
                    LOGGER.debugf("Loading Example externalValue: %s", example.getExternalValue());
                    example.setValue(objectMapper.get().readTree(stream));
                    example.setExternalValue(null);
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });

        return requestBody;
    }

    @Override
    public Schema filterSchema(Schema schema) {
        if (schema.getType() == SchemaType.ARRAY && schema.getDefaultValue() instanceof String dflt) {
            schema.setDefaultValue(new StringListParamConverter().fromString(dflt));
        }

        if (schema.getType() == SchemaType.ARRAY && schema.getEnumeration() != null) {
            schema.getItems().setEnumeration(schema.getEnumeration());
            schema.setEnumeration(null);
        }

        maybeSaveReference(schema, "meta");
        maybeSaveReference(schema, "attributes");
        maybeSaveReference(schema, "relationships");

        return OASFilter.super.filterSchema(schema);
    }

    /**
     * Remove disabled operations from the OpenAPI model
     */
    @Override
    public PathItem filterPathItem(PathItem pathItem) {
        pathItem.getOperations().forEach((method, operation) -> {
            if (disabled(method.name(), operation.getOperationId())) {
                pathItem.setOperation(method, null);
            }
        });

        // Remove the entire path if no operations remain enabled
        return pathItem.getOperations().isEmpty() ? null : pathItem;
    }

    @Override
    public void filterOpenAPI(OpenAPI openAPI) {
        openAPI.getComponents().addSchema("OffsetSpec", OASFactory.createSchema()
                .type(SchemaType.STRING)
                .defaultValue(KafkaOffsetSpec.LATEST)
                .addOneOf(OASFactory.createSchema()
                        .type(SchemaType.STRING)
                        .addEnumeration(KafkaOffsetSpec.EARLIEST)
                        .addEnumeration(KafkaOffsetSpec.LATEST)
                        .addEnumeration(KafkaOffsetSpec.MAX_TIMESTAMP))
                .addOneOf(OASFactory.createSchema()
                        .ref("Instant")));

        dereferenceSchemas(openAPI);

        // Sort global schemas
        openAPI.getComponents().setSchemas(new TreeMap<>(openAPI.getComponents().getSchemas()));
        // Prune any schemas no longer referenced
        FilterUtil.applyFilter(new UnusedSchemaFilter(), openAPI);
        Optional<ConsoleConfig> consoleConfig = Optional.empty();

        try {
            Instance<ConsoleConfig> configInstance = CDI.current().select(ConsoleConfig.class);

            if (configInstance.isResolvable()) {
                consoleConfig = Optional.of(configInstance.get());
            }
        } catch (Exception e) {
            // Ignore, expected at build time where CDI may not be available
        }

        try {
            consoleConfig.map(ConsoleConfig::getSecurity)
                .map(GlobalSecurityConfig::getOidc)
                .filter(oidc -> Objects.nonNull(oidc.getAuthServerUrl()))
                .ifPresent(oidc -> Optional.of(openAPI.getComponents())
                        .map(Components::getSecuritySchemes)
                        .map(schemes -> schemes.get("ConsoleSecurity"))
                        .ifPresent(scheme -> {
                            scheme.setOpenIdConnectUrl(oidc.getAuthServerUrl() + "/.well-known/openid-configuration");
                        }));
        } catch (Exception e) {
            LOGGER.warnf("Error retrieving OIDC URL", e.getMessage());
        }
    }

    void maybeSaveReference(Schema schema, String propertyName) {
        Optional.ofNullable(schema.getProperties())
            .map(properties -> properties.get(propertyName))
            .ifPresent(propertySchema -> {
                if (propertySchema.getRef() != null) {
                    dereferencedSchemas.put(propertySchema, schema);
                }
            });
    }

    void dereferenceSchemas(OpenAPI openAPI) {
        dereferencedSchemas.forEach((propertySchema, schema) -> {
            String propertyName = schema.getProperties()
                    .entrySet()
                    .stream()
                    .filter(entry -> entry.getValue() == propertySchema)
                    .map(Map.Entry::getKey)
                    .findFirst()
                    .orElseThrow();
            String reference = propertySchema.getRef();
            String schemaName = reference.replace("#/components/schemas/", "");
            Schema target = openAPI.getComponents().getSchemas().get(schemaName);
            schema.addProperty(propertyName, target);
        });
    }
}
