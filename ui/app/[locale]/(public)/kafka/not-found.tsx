"use client";
import { BreadcrumbLink } from "@/components/Navigation/BreadcrumbLink";
import { ButtonLink } from "@/components/Navigation/ButtonLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageBreadcrumb,
  PageGroup,
  PageSection,
  Title,
} from "@/libs/patternfly/react-core";
import { PathMissingIcon } from "@/libs/patternfly/react-icons";

export default function NotFound() {
  return (
    <>
      <PageGroup>
        <PageBreadcrumb>
          <Breadcrumb>
            <BreadcrumbLink href="/kafka">Kafka</BreadcrumbLink>
            <BreadcrumbItem isActive>Cluster</BreadcrumbItem>
          </Breadcrumb>
        </PageBreadcrumb>
      </PageGroup>
      <PageSection variant={"default"}>
        <Title headingLevel={"h1"}>Cluster</Title>
      </PageSection>
      <PageSection padding={{ default: "noPadding" }} isFilled>
        <EmptyState
          variant={"full"}
          titleText={"Kafka Cluster not found"}
          headingLevel={"h1"}
          icon={PathMissingIcon}
        >
          <EmptyStateBody>The selected cluster is unavailable.</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <ButtonLink href={"/"}>Back to the homepage</ButtonLink>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    </>
  );
}
