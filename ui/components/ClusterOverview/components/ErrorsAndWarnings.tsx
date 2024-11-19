"use client";
import {
  ExpandableSection,
  Label,
  LabelGroup,
  Title,
  Tooltip,
} from "@/libs/patternfly/react-core";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HelpIcon,
} from "@/libs/patternfly/react-icons";
import { useTranslations } from "next-intl";
import { PropsWithChildren, useState } from "react";

export function ErrorsAndWarnings({
  warnings,
  dangers,
  children,
}: PropsWithChildren<{
  warnings: number;
  dangers: number;
}>) {
  const t = useTranslations();
  const [showMessages, setShowMessages] = useState(warnings + dangers > 0);
  return (
    <ExpandableSection
      isExpanded={showMessages}
      onToggle={(_, isOpen) => setShowMessages(isOpen)}
      toggleContent={
        <Title headingLevel={"h3"} className={"pf-v6-u-font-size-sm"}>
          {t("ClusterOverview.ErrorsAndWarnings.cluster_errors_and_warnings")}{" "}
          <Tooltip content={t("ClusterOverview.ErrorsAndWarnings.tooltip")}>
            <HelpIcon />
          </Tooltip>{" "}
          <LabelGroup>
            <Label color={"red"} isCompact={true}>
              <ExclamationCircleIcon /> {dangers}
            </Label>
            <Label color={"yellow"} isCompact={true}>
              <ExclamationTriangleIcon /> {warnings}
            </Label>
          </LabelGroup>
        </Title>
      }
    >
      {children}
    </ExpandableSection>
  );
}
