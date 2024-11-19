import { ButtonLink } from "@/components/Navigation/ButtonLink";
import { ExternalLink } from "@/components/Navigation/ExternalLink";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@/libs/patternfly/react-core";
import { PlusCircleIcon } from "@/libs/patternfly/react-icons";
import { useTranslations } from "next-intl";
import { isProductizedBuild } from "@/utils/env"

export function EmptyStateNoTopics({
  canCreate,
  createHref,
  onShowHiddenTopics,
}: {
  canCreate: boolean;
  createHref: string;
  onShowHiddenTopics: () => void;
}) {
  const t = useTranslations();
  return (
    <EmptyState
        titleText="No topics"
        headingLevel="h4"
        icon={PlusCircleIcon} >
      <EmptyStateBody>
        {t("EmptyStateNoTopics.to_get_started_create_your_first_topic")}{" "}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          {canCreate && (
            <ButtonLink variant="primary" href={createHref}>
              {t("EmptyStateNoTopics.create_a_topic")}
            </ButtonLink>
          )}
          <Button variant="secondary" onClick={onShowHiddenTopics}>
            {t("EmptyStateNoTopics.show_internal_topics")}
          </Button>
        </EmptyStateActions>
        {isProductizedBuild && (
          <EmptyStateActions>
            <ExternalLink
              testId={"create-topic"}
              href={t("learning.links.topicOperatorUse")}
            >
              {t("EmptyStateNoTopics.view_documentation")}
            </ExternalLink>
          </EmptyStateActions>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
}
