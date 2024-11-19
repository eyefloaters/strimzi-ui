"use client";
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Title,
} from "@/libs/patternfly/react-core";
import { SearchIcon } from "@/libs/patternfly/react-icons";
import { useTranslations } from "next-intl";

export function NoResultsEmptyState({ onReset }: { onReset: () => void }) {
  const t = useTranslations("topics");
  return (
    <EmptyState variant={"lg"} icon={SearchIcon}>
      <Title headingLevel="h4" size="lg">
        {t("partition_table.partition_empty_title")}
      </Title>
      <EmptyStateBody>
        {t("partition_table.partition_empty_state_body")}
      </EmptyStateBody>
      <Button variant={"link"} onClick={onReset}>
        {t("partition_table.reset_filter")}
      </Button>
    </EmptyState>
  );
}
