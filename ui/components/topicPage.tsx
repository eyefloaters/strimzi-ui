"use client";
import { getTopic } from "@/api/topics";
import { Topic } from "@/api/types";
import { TableView } from "@/components/table";
import {
  Card,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Gallery,
  PageSection,
  Text,
  Title,
} from "@/libs/patternfly/react-core";
import { useFormatBytes } from "@/utils/format";
import classNames from "classnames";
import { useFormatter } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

export function TopicPage({
  topic,
  children,
}: PropsWithChildren<{
  topic: Topic;
}>) {
  const pathname = usePathname();
  return (
    <>
      <PageSection variant={"light"}>
        <Text>
          <Title headingLevel={"h1"}>{topic.attributes.name}</Title>
        </Text>
      </PageSection>
      <PageSection type={"tabs"} variant={"light"} isWidthLimited>
        <div className="pf-v5-c-tabs pf-m-page-insets">
          <ul className="pf-v5-c-tabs__list">
            <li
              className={classNames("pf-v5-c-tabs__item", {
                "pf-m-current": pathname.includes("overview"),
              })}
            >
              <Link href={`../${topic.id}`} className="pf-v5-c-tabs__link">
                <span className="pf-v5-c-tabs__item-text">Overview</span>
              </Link>
            </li>
            <li
              className={classNames("pf-v5-c-tabs__item", {
                "pf-m-current": pathname.includes("messages"),
              })}
            >
              <Link
                href={`../${topic.id}/messages`}
                className="pf-v5-c-tabs__link"
              >
                <span className="pf-v5-c-tabs__item-text">Messages</span>
              </Link>
            </li>
            <li
              className={classNames("pf-v5-c-tabs__item", {
                "pf-m-current": pathname.includes("schema"),
              })}
            >
              <Link
                href={`../${topic.id}/schema`}
                className="pf-v5-c-tabs__link"
              >
                <span className="pf-v5-c-tabs__item-text">Schema</span>
              </Link>
            </li>
            <li
              className={classNames("pf-v5-c-tabs__item", {
                "pf-m-current": pathname.includes("configuration"),
              })}
            >
              <Link
                href={`../${topic.id}/configuration`}
                className="pf-v5-c-tabs__link"
              >
                <span className="pf-v5-c-tabs__item-text">Configuration</span>
              </Link>
            </li>
          </ul>
        </div>
      </PageSection>
      {children}
    </>
  );
}

export function TopicDashboard({
  topic: initialData,
  kafkaId,
}: {
  kafkaId: string;
  topic: Topic;
}) {
  const format = useFormatter();
  const formatBytes = useFormatBytes();
  const [topic, setTopic] = useState(initialData);
  useEffect(() => {
    const interval = setInterval(async () => {
      const topic = await getTopic(kafkaId, initialData.id);
      setTopic(topic);
    }, 5000);
    return () => clearInterval(interval);
  }, [kafkaId, initialData.id]);
  return (
    <>
      <PageSection>
        <Gallery
          hasGutter
          style={
            { "--pf-v5-l-gallery--GridTemplateColumns--min": "49%" } as any
          }
        >
          <Card style={{ textAlign: "center" }} component={"div"} isLarge>
            <CardHeader>
              <CardTitle>Topic</CardTitle>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                justifyContent={{ default: "justifyContentCenter" }}
              >
                <FlexItem flex={{ default: "flexNone" }}>
                  <Flex
                    direction={{ default: "column" }}
                    spaceItems={{ default: "spaceItemsNone" }}
                  >
                    <FlexItem>
                      <Title headingLevel="h4" size="3xl">
                        {topic.attributes.partitions.length}
                      </Title>
                    </FlexItem>
                    <FlexItem>
                      <span className="pf-v5-u-color-200">Partitions</span>
                    </FlexItem>
                  </Flex>
                </FlexItem>

                <FlexItem flex={{ default: "flexNone" }}>
                  <Flex
                    direction={{ default: "column" }}
                    spaceItems={{ default: "spaceItemsNone" }}
                  >
                    <FlexItem>
                      <Title headingLevel="h4" size="3xl">
                        {format.number(topic.attributes.recordCount || 0)}
                      </Title>
                    </FlexItem>
                    <FlexItem>
                      <span className="pf-v5-u-color-200">Messages</span>
                    </FlexItem>
                  </Flex>
                </FlexItem>

                <FlexItem flex={{ default: "flexNone" }}>
                  <Flex
                    direction={{ default: "column" }}
                    spaceItems={{ default: "spaceItemsNone" }}
                  >
                    <FlexItem>
                      <Title headingLevel="h4" size="3xl">
                        {formatBytes(topic.attributes.totalLeaderLogBytes || 0)}
                      </Title>
                    </FlexItem>
                    <FlexItem>
                      <span className="pf-v5-u-color-200">Storage</span>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </CardHeader>
          </Card>
          <Card style={{ textAlign: "center" }} component={"div"} isLarge>
            <CardHeader>
              <CardTitle>Traffic</CardTitle>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                justifyContent={{ default: "justifyContentCenter" }}
              >
                <FlexItem flex={{ default: "flexNone" }}>
                  <Flex
                    direction={{ default: "column" }}
                    spaceItems={{ default: "spaceItemsNone" }}
                  >
                    <FlexItem>
                      <Title headingLevel="h4" size="3xl">
                        894,8 KB/s
                      </Title>
                    </FlexItem>
                    <FlexItem>
                      <span className="pf-v5-u-color-200">Egress</span>
                    </FlexItem>
                  </Flex>
                </FlexItem>

                <FlexItem flex={{ default: "flexNone" }}>
                  <Flex
                    direction={{ default: "column" }}
                    spaceItems={{ default: "spaceItemsNone" }}
                  >
                    <FlexItem>
                      <Title headingLevel="h4" size="3xl">
                        456,3 KB/s
                      </Title>
                    </FlexItem>
                    <FlexItem>
                      <span className="pf-v5-u-color-200">Ingress</span>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </CardHeader>
          </Card>
        </Gallery>
      </PageSection>
      <PageSection isFilled>
        <Title headingLevel={"h2"}>Partitions</Title>
        <TableView
          itemCount={topic.attributes.partitions.length}
          page={1}
          onPageChange={() => {}}
          data={topic.attributes.partitions}
          emptyStateNoData={<div>No partitions</div>}
          emptyStateNoResults={<div>todo</div>}
          ariaLabel={"Partitions"}
          columns={
            [
              "id",
              "leaderId",
              "replicas",
              "outOfSyncReplicas",
              "offsets",
              "recordCount",
              "leaderLocalStorage",
            ] as const
          }
          renderHeader={({ column, key, Th }) => {
            switch (column) {
              case "id":
                return (
                  <Th key={key} dataLabel={"Partition Id"}>
                    Partition Id
                  </Th>
                );
              case "leaderId":
                return (
                  <Th key={key} dataLabel={"Leader Id"}>
                    Leader Id
                  </Th>
                );
              case "replicas":
                return (
                  <Th key={key} dataLabel={"Replicas"}>
                    Replicas
                  </Th>
                );
              case "outOfSyncReplicas":
                return (
                  <Th key={key} dataLabel={"Out of Sync Replicas"}>
                    Out of Sync Replicas
                  </Th>
                );
              case "offsets":
                return (
                  <Th key={key} dataLabel={"Offsets"}>
                    Offsets (Earliest/Latest)
                  </Th>
                );
              case "recordCount":
                return (
                  <Th key={key} dataLabel={"Record Count"}>
                    Record Count
                  </Th>
                );
              case "leaderLocalStorage":
                return (
                  <Th key={key} dataLabel={"Storage"}>
                    Storage
                  </Th>
                );
            }
          }}
          renderCell={({ row, column, key, Td }) => {
            switch (column) {
              case "id":
                return (
                  <Td key={key} dataLabel={"Partition Id"}>
                    {row.partition}
                  </Td>
                );
              case "leaderId":
                return (
                  <Td key={key} dataLabel={"Leader Id"}>
                    {row.leaderId}
                  </Td>
                );
              case "replicas":
                return (
                  <Td key={key} dataLabel={"Replicas"}>
                    {row.replicas.map(r => r.nodeId).join(", ") }
                  </Td>
                );
              case "outOfSyncReplicas":
                return (
                  <Td key={key} dataLabel={"Out of Sync Replicas"}>
                    {row.replicas.filter(r => !r.inSync).map(r => r.nodeId).join(", ") }
                  </Td>
                );
              case "offsets":
                return (
                  <Td key={key} dataLabel={"Offset"}>
                    {row.offsets?.earliest?.offset ?? "-"}/
                    {row.offsets?.latest?.offset ?? "-"}
                  </Td>
                );
              case "recordCount":
                return (
                  <Td key={key} dataLabel={"Record Count"}>
                    {format.number(row.recordCount || 0)}
                  </Td>
                );
              case "leaderLocalStorage":
                return (
                  <Td key={key} dataLabel={"Storage"}>
                    {formatBytes(row.leaderLocalStorage || 0)}
                  </Td>
                );
            }
          }}
        />
      </PageSection>
    </>
  );
}
