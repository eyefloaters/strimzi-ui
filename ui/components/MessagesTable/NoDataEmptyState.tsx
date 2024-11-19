"use client";
import { useFilterParams } from "@/utils/useFilterParams";
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  Title,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import { useTranslations } from "next-intl";
import { startTransition } from "react";

export function NoDataEmptyState() {
  const t = useTranslations("message-browser");
  const updateUrl = useFilterParams({});

  function onRefresh() {
    startTransition(() =>
      updateUrl({
        _ts: Date.now(),
        "filter[offset]": undefined,
        "filter[timestamp]": undefined,
        "filter[epoch]": undefined,
      }),
    );
  }

  return (
    <EmptyState
      titleText={
        <Title headingLevel="h4" size="lg">
          {t("no_data_title")}
        </Title>
      }
      icon={CubesIcon}
      variant={"lg"}
    >
      <EmptyStateBody>{t("no_data_body")}</EmptyStateBody>
      <EmptyStateFooter>
        <Button onClick={onRefresh}>{t("no_data_refresh")}</Button>
      </EmptyStateFooter>
    </EmptyState>
  );
}
