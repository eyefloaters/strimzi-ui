import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@/libs/patternfly/react-core";
import { SearchIcon } from "@/libs/patternfly/react-icons";
import { useTranslations } from "next-intl";

export function EmptyStateNoMatchFound({ onClear }: { onClear: () => void }) {
  const t = useTranslations();
  return (
    <EmptyState
      titleText="No results found"
      headingLevel="h4"
      icon={SearchIcon}
    >
      <EmptyStateBody>
        {t(
          "Table.EmptyStateNoMatchFound.no_results_match_the_filter_criteria_clear_all_fil",
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={onClear}>
            {t("Table.EmptyStateNoMatchFound.clear_all_filters")}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
