import { DateTime } from "@/components/Format/DateTime";
import { RefreshButton } from "@/components/RefreshButton";
import {
  Divider,
  Flex,
  FlexItem,
  PageSection,
  Title,
} from "@/libs/patternfly/react-core";
import { ReactNode } from "react";
import { useNow } from "next-intl";

export function AppHeader({
  title,
  subTitle,
  actions,
  navigation,
  showRefresh = true,
  staticRefresh,
}: {
  title: ReactNode;
  subTitle?: ReactNode;
  actions?: ReactNode[];
  navigation?: ReactNode;
  showRefresh?: boolean;
  staticRefresh?: Date; // allows fixed value to be provided for storybook testing
}) {
  const now = useNow();
  const lastRefresh = staticRefresh ?? now;
  return (
    <>
      <PageSection
        padding={{ default: navigation ? "noPadding" : "padding" }}
        className={navigation ? "pf-v6-u-px-md pf-v6-u-pt-sm" : undefined}
        hasShadowBottom={!navigation}
      >
        <Flex direction={{ default: "column" }}>
          <Flex>
            <FlexItem flex={{ default: "flex_1" }}>
              <Title headingLevel={"h1"}>{title}</Title>
            </FlexItem>

            {showRefresh && (
              <FlexItem
                alignSelf={{ default: "alignSelfFlexEnd" }}
                className={"pf-v6-u-font-size-sm"}
              >
                Last updated{" "}
                <DateTime
                  value={lastRefresh}
                  dateStyle={"short"}
                  timeStyle={"medium"}
                  tz={"local"}
                />
                <RefreshButton lastRefresh={lastRefresh} />
              </FlexItem>
            )}
          </Flex>
          <Flex>
            {subTitle && <FlexItem>{subTitle}</FlexItem>}
            {actions && (
              <Flex
                direction={{ default: "column" }}
                align={{ default: "alignRight" }}
              >
                <Flex alignSelf={{ default: "alignSelfFlexEnd" }}>
                  {actions.map((a, idx) => (
                    <FlexItem key={idx}>{a}</FlexItem>
                  ))}
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
      </PageSection>
      {navigation}
      {navigation && <Divider />}
    </>
  );
}
