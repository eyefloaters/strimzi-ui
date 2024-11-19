import { Message } from "@/api/messages/schema";
import { Bytes } from "@/components/Format/Bytes";
import { DateTime } from "@/components/Format/DateTime";
import { Number } from "@/components/Format/Number";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Tab,
  Tabs,
  TabTitleText,
  Tooltip,
} from "@/libs/patternfly/react-core";
import { HelpIcon } from "@/libs/patternfly/react-icons";
import { ClipboardCopy, Content } from "@patternfly/react-core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { allExpanded, defaultStyles, JsonView } from "react-json-view-lite";
import { NoData } from "./NoData";
import { maybeJson } from "./utils";

export type MessageDetailsProps = {
  onClose: () => void;
  defaultTab: MessageDetailsBodyProps["defaultTab"];
  message: Message | undefined;
};

export function MessageDetails({
  onClose,
  defaultTab,
  message,
}: MessageDetailsProps) {
  const t = useTranslations("message-browser");

  const body = useMemo(() => {
    return (
      message && (
        <MessageDetailsBody
          defaultTab={defaultTab}
          messageKey={message.attributes.key}
          {...message}
        />
      )
    );
  }, [message, defaultTab]);

  return (
    <DrawerPanelContent isResizable={true} minSize={"400px"}>
      <DrawerHead>
        <Content>
          <Content component={"h2"}>{t("message")}</Content>
        </Content>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody>{body}</DrawerContentBody>
    </DrawerPanelContent>
  );
}

export type MessageDetailsBodyProps = {
  defaultTab: "value" | "key" | "headers";
  messageKey: string | null;
} & Omit<Message, "key">;

export function MessageDetailsBody({
  defaultTab,
  ...message
}: MessageDetailsBodyProps) {
  const t = useTranslations("message-browser");
  const [key, isKeyJson] = maybeJson(message.attributes.key || "{}");
  const [value, isValueJson] = maybeJson(message.attributes.value || "{}");

  return (
    <Flex direction={{ default: "column" }} data-testid={"message-details"}>
      <FlexItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("field.partition")}</DescriptionListTerm>
            <DescriptionListDescription>
              <Number value={message.attributes.partition} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("field.offset")}</DescriptionListTerm>
            <DescriptionListDescription>
              <Number value={message.attributes.offset} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("field.size")}{" "}
              <Tooltip content={t("tooltip.size")}>
                <HelpIcon />
              </Tooltip>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Bytes value={message.attributes.size} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("field.timestamp")}</DescriptionListTerm>
            <DescriptionListDescription>
              <DateTime
                value={message.attributes.timestamp}
                empty={<NoData />}
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("field.timestamp--utc")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              <DateTime
                value={message.attributes.timestamp}
                empty={<NoData />}
                tz={"UTC"}
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("field.epoch")}</DescriptionListTerm>
            <DescriptionListDescription>
              {message.attributes.timestamp ? (
                Math.floor(
                  new Date(message.attributes.timestamp).getTime() / 1000,
                )
              ) : (
                <NoData />
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </FlexItem>
      <FlexItem>
        {/* set key to be a random number to force redraw the tabs in order to change the active tab from the outside */}
        <Tabs defaultActiveKey={defaultTab} key={Math.random()}>
          <Tab
            eventKey={"value"}
            title={<TabTitleText>{t("field.value")}</TabTitleText>}
          >
            <ClipboardCopy
              isCode
              isReadOnly
              hoverTip="Copy"
              clickTip="Copied"
              variant={isValueJson ? "inline" : "expansion"}
              isExpanded={!isValueJson}
            >
              {message.attributes.value ?? "-"}
            </ClipboardCopy>
            {isValueJson && (
              <JsonView
                data={value}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
              />
            )}
          </Tab>
          <Tab
            eventKey={"key"}
            title={<TabTitleText>{t("field.key")}</TabTitleText>}
          >
            <ClipboardCopy
              isCode
              isReadOnly
              hoverTip="Copy"
              clickTip="Copied"
              variant={isKeyJson ? "inline" : "expansion"}
              isExpanded={!isKeyJson}
            >
              {message.attributes.key ?? "-"}
            </ClipboardCopy>
            {isKeyJson && (
              <JsonView
                data={key}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
              />
            )}
          </Tab>
          <Tab
            eventKey={"headers"}
            title={<TabTitleText>{t("field.headers")}</TabTitleText>}
          >
            <ClipboardCopy isCode isReadOnly hoverTip="Copy" clickTip="Copied">
              {JSON.stringify(message.attributes.headers ?? {})}
            </ClipboardCopy>
            <JsonView
              data={message.attributes.headers || {}}
              shouldExpandNode={allExpanded}
              style={defaultStyles}
            />
          </Tab>
        </Tabs>
      </FlexItem>
    </Flex>
  );
}
