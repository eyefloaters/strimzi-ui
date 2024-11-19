"use client";

import { Number } from "@/components/Format/Number";
import { ResponsiveTable } from "@/components/Table";
import {
  ChartDonutThreshold,
  ChartDonutUtilization,
} from "@/libs/patternfly/react-charts";
import {
  ClipboardCopy,
  Flex,
  FlexItem,
  Tooltip,
} from "@/libs/patternfly/react-core";
import { HelpIcon } from "@/libs/patternfly/react-icons";
import { useFormatBytes } from "@/utils/useFormatBytes";
import { Content, Icon } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@patternfly/react-icons";
import { useFormatter } from "next-intl";
import Link from "next/link";
import { useTranslations } from "next-intl";

const columns = ["id", "status", "replicas", "rack"] as const;

export type Node = {
  id: number;
  isLeader: boolean;
  status: string;
  followers?: number;
  leaders?: number;
  rack?: string;
  hostname?: string;
  diskCapacity?: number;
  diskUsage?: number;
};

export function NodesTable({ nodes }: { nodes: Node[] }) {
  const t = useTranslations();
  const format = useFormatter();
  const formatBytes = useFormatBytes();
  return (
    <ResponsiveTable
      ariaLabel={"Kafka clusters"}
      columns={columns}
      data={nodes}
      renderHeader={({ column, key, Th }) => {
        switch (column) {
          case "id":
            return <Th key={key}>{t("nodes.broker_id")}</Th>;
          case "status":
            return <Th key={key}>{t("nodes.status")}</Th>;
          case "replicas":
            return (
              <Th key={key}>
                {t("nodes.replicas")}{" "}
                <Tooltip content={t("nodes.replicas_tooltip")}>
                  <HelpIcon />
                </Tooltip>
              </Th>
            );
          case "rack":
            return (
              <Th key={key}>
                {t("nodes.rack")}{" "}
                <Tooltip content={t("nodes.rack_tooltip")}>
                  <HelpIcon />
                </Tooltip>
              </Th>
            );
        }
      }}
      renderCell={({ column, key, row, Td }) => {
        switch (column) {
          case "id":
            return (
              <Td key={key} dataLabel={"Broker ID"}>
                <Link href={`nodes/${row.id}`}>{row.id}</Link>
                {/*{row.isLeader && (*/}
                {/*  <>*/}
                {/*    &nbsp;*/}
                {/*    <Label color={"purple"} isCompact={true}>*/}
                {/*      Controller*/}
                {/*    </Label>*/}
                {/*  </>*/}
                {/*)}*/}
              </Td>
            );
          case "status":
            const isStable = row.status == "Running";
            return (
              <Td key={key} dataLabel={"Status"}>
                <Icon status={isStable ? "success" : "warning"}>
                  {isStable ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                </Icon>
                &nbsp;
                {row.status}
              </Td>
            );
          case "replicas":
            return (
              <Td key={key} dataLabel={"Total replicas"}>
                <Number
                  value={
                    row.followers && row.leaders
                      ? row.followers + row.leaders
                      : undefined
                  }
                />
              </Td>
            );
          case "rack":
            return (
              <Td key={key} dataLabel={"Rack"}>
                {row.rack || "n/a"}
              </Td>
            );
        }
      }}
      isRowExpandable={() => true}
      getExpandedRow={({ row }) => {
        return (
          <Flex gap={{ default: "gap4xl" }} className={"pf-v6-u-p-xl"}>
            <FlexItem flex={{ default: "flex_1" }} style={{ maxWidth: "50%" }}>
              <Content>
                <Content>{t.rich("nodes.broker_host_name")}</Content>
                <Content>
                  <ClipboardCopy
                    isReadOnly={true}
                    variant={"expansion"}
                    isExpanded={true}
                  >
                    {row.hostname || "n/a"}
                  </ClipboardCopy>
                </Content>
              </Content>
            </FlexItem>
            <FlexItem>
              <Content>
                <Content>{t.rich("nodes.broker_disk_usage")}</Content>
              </Content>
              <div style={{ width: 350, height: 200 }}>
                {row.diskUsage !== undefined &&
                  row.diskCapacity !== undefined && (
                    <ChartDonutThreshold
                      ariaDesc="Storage capacity"
                      ariaTitle={`Broker ${row.id} disk usage`}
                      constrainToVisibleArea={true}
                      data={[
                        { x: "Warning at 60%", y: 60 },
                        { x: "Danger at 90%", y: 90 },
                      ]}
                      height={200}
                      labels={({ datum }) => (datum.x ? datum.x : null)}
                      padding={{
                        bottom: 0,
                        left: 10,
                        right: 150,
                        top: 0,
                      }}
                      width={350}
                    >
                      <ChartDonutUtilization
                        data={{
                          x: "Storage capacity",
                          y: (row.diskUsage / row.diskCapacity) * 100,
                        }}
                        labels={({ datum }) =>
                          datum.x
                            ? `${datum.x}: ${format.number(datum.y / 100, {
                                style: "percent",
                              })}`
                            : null
                        }
                        legendData={[
                          { name: `Capacity: 80%` },
                          { name: "Warning at 60%" },
                          { name: "Danger at 90%" },
                        ]}
                        legendOrientation="vertical"
                        title={`${format.number(
                          row.diskUsage / row.diskCapacity,
                          {
                            style: "percent",
                          },
                        )}`}
                        subTitle={`of ${formatBytes(row.diskCapacity)}`}
                        thresholds={[{ value: 60 }, { value: 90 }]}
                      />
                    </ChartDonutThreshold>
                  )}
              </div>
            </FlexItem>
          </Flex>
        );
      }}
    />
  );
}
