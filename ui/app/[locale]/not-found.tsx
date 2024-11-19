import { AppLayout } from "@/components/AppLayout";
import { ButtonLink } from "@/components/Navigation/ButtonLink";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
} from "@/libs/patternfly/react-core";
import { PathMissingIcon } from "@/libs/patternfly/react-icons";

export default function NotFound() {
  return (
    <html>
      <body>
        <AppLayout>
          <PageSection padding={{ default: "noPadding" }} isFilled>
            <EmptyState
              variant={"full"}
              titleText={"Page not found"}
              headingLevel={"h1"}
              icon={PathMissingIcon}
            >
              <EmptyStateBody>This page could not be found.</EmptyStateBody>
              <EmptyStateFooter>
                <EmptyStateActions>
                  <ButtonLink href={"/"}>Return to the home page</ButtonLink>
                </EmptyStateActions>
              </EmptyStateFooter>
            </EmptyState>
          </PageSection>
        </AppLayout>
      </body>
    </html>
  );
}
