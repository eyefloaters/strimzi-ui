"use client";

import {
  Alert,
  Button,
  Card,
  CardBody,
  ClipboardCopy,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  JumpLinks,
  JumpLinksItem,
  List,
  ListItem,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Stack,
  StackItem,
} from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";
import { DownloadIcon } from "@/libs/patternfly/react-icons";

export type NewOffset = {
  topicName: string;
  partition: number;
  offset: number | string;
  topicId: string;
  metadata?: string;
};

export function Dryrun({
  consumerGroupName,
  newOffset,
  onClickCloseDryrun,
  cliCommand,
}: {
  consumerGroupName: string;
  newOffset: NewOffset[];
  onClickCloseDryrun: () => void;
  cliCommand: string;
}) {
  const t = useTranslations("ConsumerGroupsTable");

  const onClickDownload = () => {
    const data = {
      consumerGroupName,
      newOffset,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dryrun-result.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group offsets by topic
  const groupedTopics = newOffset.reduce<Record<string, NewOffset[]>>(
    (acc, offset) => {
      if (!acc[offset.topicName]) {
        acc[offset.topicName] = [];
      }
      acc[offset.topicName].push(offset);
      return acc;
    },
    {},
  );

  return (
    <Panel>
      <PanelHeader>
        <Flex>
          <FlexItem>
            <Content>
              <Content>{t.rich("dry_run_result")}</Content>
            </Content>
          </FlexItem>
          <FlexItem>
            <Button variant="link" onClick={onClickDownload}>
              {
                <>
                  {t("download_dryrun_result")} <DownloadIcon />
                </>
              }
            </Button>
          </FlexItem>
        </Flex>
        <Content>
          <Content>{t.rich("consumer_name", { consumerGroupName })}</Content>
        </Content>
      </PanelHeader>
      <Divider />
      <PanelMain>
        <PanelMainBody>
          <Stack hasGutter>
            <StackItem>
              <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
                {cliCommand}
              </ClipboardCopy>
            </StackItem>
            <StackItem>
              <Sidebar>
                <SidebarPanel>
                  <JumpLinks isVertical label={t.rich("jump_to_topic")}>
                    {Object.keys(groupedTopics).map((topicName) => (
                      <JumpLinksItem
                        key={topicName}
                        href={`#topic-${topicName}`}
                      >
                        {topicName}
                      </JumpLinksItem>
                    ))}
                  </JumpLinks>
                </SidebarPanel>
                <SidebarContent>
                  <Stack hasGutter>
                    {Object.entries(groupedTopics).map(
                      ([topicName, offsets]) => (
                        <StackItem key={topicName}>
                          <Card component="div">
                            <CardBody>
                            <DescriptionList id={`topic-${topicName}`}>
                              <DescriptionListGroup>
                                <DescriptionListTerm>
                                  {t("topic")}
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                  {topicName}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                              <Flex>
                                <FlexItem>
                                  <DescriptionListGroup>
                                    <DescriptionListTerm>
                                      {t("partition")}
                                    </DescriptionListTerm>
                                    <DescriptionListDescription>
                                      <List isPlain>
                                        {offsets
                                          .sort(
                                            (a, b) => a.partition - b.partition,
                                          )
                                          .map(({ partition }) => (
                                            <ListItem key={partition}>
                                              {partition}
                                            </ListItem>
                                          ))}
                                      </List>
                                    </DescriptionListDescription>
                                  </DescriptionListGroup>
                                </FlexItem>
                                <FlexItem>
                                  <DescriptionListGroup>
                                    <DescriptionListTerm>
                                      {t("new_offset")}
                                    </DescriptionListTerm>
                                    <DescriptionListDescription>
                                      <List isPlain>
                                        {offsets.map(
                                          ({ partition, offset }) => (
                                            <ListItem key={partition}>
                                              {offset}
                                            </ListItem>
                                          ),
                                        )}
                                      </List>
                                    </DescriptionListDescription>
                                  </DescriptionListGroup>
                                </FlexItem>
                              </Flex>
                            </DescriptionList>
                            </CardBody>
                          </Card>
                        </StackItem>
                      ),
                    )}
                  </Stack>
                </SidebarContent>
              </Sidebar>
            </StackItem>
            <StackItem>
              <Alert
                variant="info"
                isInline
                title={t("dry_run_execution_alert")}
              />
            </StackItem>
            <StackItem>
              <Button variant="secondary" onClick={onClickCloseDryrun}>
                {t("back_to_edit_offset")}
              </Button>
            </StackItem>
          </Stack>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
}
