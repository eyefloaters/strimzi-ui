import { useTranslations } from "next-intl";
import { ExternalLink } from "@/components/Navigation/ExternalLink";
import { Popover } from "@/libs/patternfly/react-core";
import { PopoverProps } from "@patternfly/react-core";

export function TechPreviewPopover({
  children,
}: {
  children: PopoverProps["children"];
}) {
  const t = useTranslations();
  return (
    <Popover
      triggerAction={"hover"}
      headerContent={t("AppLayout.tech_preview_label")}
      bodyContent={<div>{t("AppLayout.tech_preview_tooltip_description")}</div>}
      footerContent={
        <ExternalLink
          href={"https://redhat.com"}
          testId={"tech-preview-learn-more"}
        >
          {t("AppLayout.external_link")}
        </ExternalLink>
      }
    >
      {children}
    </Popover>
  );
}
