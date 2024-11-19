import { ExpandableSection } from "@/components/ExpandableSection";
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Content,
  Title,
} from "@/libs/patternfly/react-core";
import { ExclamationCircleIcon } from "@/libs/patternfly/react-icons";

export function ApplicationError({
  error,
  onReset,
}: {
  error: Error & { digest?: string };
  onReset: () => void;
}) {
  return (
    <EmptyState
      variant={"lg"}
      status={"danger"}
      titleText={"This page is temporarily unavailable"}
      headingLevel="h1"
      icon={ExclamationCircleIcon}
    >
      <EmptyStateBody>
        <Content>
          <Content>
            Try clicking the button below, or refreshing the page. If the
            problem persists, contact your organization administrator.
          </Content>
        </Content>
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="primary" onClick={onReset}>
            Retry
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
      <EmptyStateFooter>
        <ExpandableSection initialExpanded={false} toggleText={"Show more"}>
          {error.digest && (
            <Title headingLevel={"h2"} className={"pf-v6-u-mb-lg"}>
              {error.digest}
            </Title>
          )}
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Error</DescriptionListTerm>
              <DescriptionListDescription>
                {error.name}
              </DescriptionListDescription>
              <DescriptionListTerm>Message</DescriptionListTerm>
              <DescriptionListDescription>
                {error.message}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </ExpandableSection>
      </EmptyStateFooter>
    </EmptyState>
  );
}
