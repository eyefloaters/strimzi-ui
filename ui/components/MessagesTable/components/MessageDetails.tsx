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
  Text,
  TextContent,
  TextVariants,
  Tooltip,
} from "@/libs/patternfly/react-core";
import { HelpIcon } from "@/libs/patternfly/react-icons";
import {
  ClipboardCopy,
  Stack,
  StackItem,
  TabContent,
  Title,
} from "@patternfly/react-core";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { allExpanded, defaultStyles, JsonView } from "react-json-view-lite";
import { NoData } from "./NoData";
import { maybeJson } from "./utils";
import { getSchema } from "@/api/schema/action";
import { SchemaValue } from "./SchemaValue";
import { ExternalLink } from "@/components/Navigation/ExternalLink";

export type MessageDetailsProps = {
  onClose: () => void;
  defaultTab: MessageDetailsBodyProps["defaultTab"];
  message: Message | undefined;
  baseurl: string;
};

export function MessageDetails({
  onClose,
  defaultTab,
  message,
  baseurl,
}: MessageDetailsProps) {
  const t = useTranslations("message-browser");
  const body = useMemo(() => {
    return (
      message && (
        <MessageDetailsBody
          defaultTab={defaultTab}
          messageKey={message.attributes.key}
          baseurl={baseurl}
          {...message}
        />
      )
    );
  }, [message, defaultTab]);

  return (
    <DrawerPanelContent isResizable={true} minSize={"400px"}>
      <DrawerHead>
        <TextContent>
          <Text component={TextVariants.h2}>{t("message")}</Text>
        </TextContent>
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
  baseurl: string;
} & Omit<Message, "key">;

export function MessageDetailsBody({
  defaultTab,
  baseurl,
  ...message
}: MessageDetailsBodyProps) {
  const t = useTranslations("message-browser");
  const [key, isKeyJson] = maybeJson(message.attributes.key || "{}");
  const [value, isValueJson] = maybeJson(message.attributes.value || "{}");

  const [keySchemaContent, setKeySchemaContent] = useState<string>();
  const [valueSchemaContent, setValueSchemaContent] = useState<string>();

  useEffect(() => {
    async function fetchSchemas() {
      try {
        // Fetch Key Schema
        if (message?.relationships.keySchema?.links?.content) {
          const keySchemaLink = message.relationships.keySchema.links.content;
          const keySchema = await getSchema(keySchemaLink);
          setKeySchemaContent(keySchema);
        } else {
          console.log("No URL found for key schema.");
        }

        // Fetch Value Schema
        if (message?.relationships.valueSchema?.links?.content) {
          const valueSchemaLink =
            message.relationships.valueSchema.links.content;
          const valueSchema = await getSchema(valueSchemaLink);
          setValueSchemaContent(valueSchema);
        } else {
          console.log("No URL found for value schema.");
        }
      } catch (error) {
        console.error("Error fetching schemas:", error);
      }
    }
    fetchSchemas();
  }, [message]);

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
          <DescriptionListGroup>
            <DescriptionListTerm>{t("field.key-format")}</DescriptionListTerm>
            <DescriptionListDescription>
              {message.relationships.keySchema?.meta?.artifactType ?? "Plain"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("field.value-format")}</DescriptionListTerm>
            <DescriptionListDescription>
              {message.relationships.valueSchema?.meta?.artifactType ?? "Plain"}
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
            <Stack hasGutter>
              <StackItem>
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
              </StackItem>
              {valueSchemaContent && (
                <StackItem>
                  <Title headingLevel={"h4"}>
                    {message.relationships.valueSchema?.meta?.name &&
                    message.relationships.valueSchema?.links?.content ? (
                      <ExternalLink
                        testId="schema-value"
                        href={`/schema?content=${encodeURIComponent(message.relationships.valueSchema.links.content)}&schemaname=${encodeURIComponent(message.relationships.valueSchema.meta.name)}`}
                      >
                        {message.relationships.valueSchema.meta.name}
                      </ExternalLink>
                    ) : (
                      message.relationships.valueSchema?.meta?.name
                    )}
                  </Title>
                  <SchemaValue
                    schema={valueSchemaContent}
                    name={message.relationships.valueSchema?.meta?.name ?? ""}
                  />
                </StackItem>
              )}
            </Stack>
          </Tab>
          <Tab
            eventKey={"key"}
            title={<TabTitleText>{t("field.key")}</TabTitleText>}
          >
            <Stack hasGutter>
              <StackItem>
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
              </StackItem>
              {keySchemaContent && (
                <StackItem>
                  <Title headingLevel={"h4"}>
                    {message.relationships.keySchema?.meta?.name &&
                    message.relationships.keySchema?.links?.content ? (
                      <ExternalLink
                        testId={"key-schema"}
                        href={`/schema?content=${encodeURIComponent(message.relationships.keySchema?.links?.content)}&schemaname=${encodeURIComponent(
                          message.relationships.keySchema?.meta?.name,
                        )}`}
                      >
                        {message.relationships.keySchema?.meta?.name}
                      </ExternalLink>
                    ) : (
                      message.relationships.keySchema?.meta?.name
                    )}
                  </Title>
                  <SchemaValue
                    schema={keySchemaContent}
                    name={message.relationships.keySchema?.meta?.name ?? ""}
                  />
                </StackItem>
              )}
            </Stack>
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
