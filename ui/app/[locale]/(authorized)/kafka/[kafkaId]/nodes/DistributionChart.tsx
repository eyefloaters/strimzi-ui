"use client";

import { useChartWidth } from "@/components/ClusterOverview/components/useChartWidth";
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegend,
  ChartStack,
  ChartVoronoiContainer,
} from "@/libs/patternfly/react-charts";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from "@/libs/patternfly/react-core";
import { HelpIcon } from "@/libs/patternfly/react-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DistributionChart({
  data,
}: {
  data: Record<string, { leaders?: number; followers?: number }>;
}) {
  const t = useTranslations();
  const [containerRef, width] = useChartWidth();
  const [filter, setFilter] = useState<"all" | "leaders" | "followers">("all");

  const allCount = Object.values(data).reduce(
    (acc, v) => (v.followers ?? 0) + (v.leaders ?? 0) + acc,
    0,
  );
  const leadersCount = Object.values(data).reduce(
    (acc, v) => (v.leaders ?? 0) + acc,
    0,
  );
  const followersCount = Object.values(data).reduce(
    (acc, v) => (v.followers ?? 0) + acc,
    0,
  );

  const getCount = (nodeData: { leaders?: number; followers?: number }) => {
    switch (filter) {
      case "leaders":
        return nodeData.leaders ?? 0;
      case "followers":
        return nodeData.followers ?? 0;
      default:
        return (nodeData.leaders ?? 0) + (nodeData.followers ?? 0);
    }
  };

  const getPercentage = (count: number) => {
    switch (filter) {
      case "leaders":
        return ((count / leadersCount) * 100).toFixed(2);
      case "followers":
        return ((count / followersCount) * 100).toFixed(2);
      default:
        return ((count / allCount) * 100).toFixed(2);
    }
  };

  return allCount > 0 ? (
    <Card className={"pf-v6-u-mb-lg"}>
      <CardHeader>
        <CardTitle>
          {t("DistributionChart.partitions_distribution_of_total")}{" "}
          <Tooltip
            content={t(
              "DistributionChart.partitions_distribution_of_total_tooltip",
            )}
          >
            <HelpIcon />
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <ToggleGroup
          isCompact
          aria-label={t("DistributionChart.distribution_toggles")}
        >
          <ToggleGroupItem
            text={t("DistributionChart.all_label", {
              count: allCount,
            })}
            buttonId="toggle-group-compact-0"
            isSelected={filter == "all"}
            onChange={() => setFilter("all")}
          />
          <ToggleGroupItem
            text={t("DistributionChart.leaders_label", { count: leadersCount })}
            buttonId="toggle-group-compact-1"
            isSelected={filter == "leaders"}
            onChange={() => setFilter("leaders")}
          />
          <ToggleGroupItem
            text={t("DistributionChart.followers_label", {
              count: followersCount,
            })}
            buttonId="toggle-group-compact-2"
            isSelected={filter === "followers"}
            onChange={() => setFilter("followers")}
          />
        </ToggleGroup>
        <div ref={containerRef}>
          <Chart
            ariaDesc={t("DistributionChart.distribution_chart_description")}
            ariaTitle={t("DistributionChart.distribution_chart_title")}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  switch (filter) {
                    case "followers":
                      return t(
                        "DistributionChart.broker_node_voronoi_followers",
                        { name: datum.name, value: datum.y },
                      );
                    case "leaders":
                      return t(
                        "DistributionChart.broker_node_voronoi_leaders",
                        { name: datum.name, value: datum.y },
                      );
                    default:
                      return t("DistributionChart.broker_node_voronoi_all", {
                        name: datum.name,
                        value: datum.y,
                      });
                  }
                }}
                constrainToVisibleArea
              />
            }
            legendOrientation="horizontal"
            legendPosition="bottom"
            legendComponent={
              <ChartLegend
                orientation={"horizontal"}
                data={Object.keys(data).map((node) => {
                  const count = getCount(data[node]);
                  const percentage = getPercentage(count);
                  return {
                    name: t("DistributionChart.broker_node_count", {
                      node,
                      count,
                      percentage,
                    }),
                  };
                })}
                itemsPerRow={width > 600 ? 3 : 1}
              />
            }
            height={100}
            padding={{
              bottom: 70,
              left: 0,
              right: 0, // Adjusted to accommodate legend
              top: 30,
            }}
            width={width}
          >
            <ChartAxis
              style={{
                axis: { stroke: "transparent" },
                ticks: { stroke: "transparent" },
                tickLabels: { fill: "transparent" },
              }}
            />
            <ChartStack>
              {Object.entries(data).map(([node, data], idx) => (
                <ChartBar
                  key={idx}
                  horizontal={true}
                  barWidth={15}
                  data={[
                    {
                      name: `Broker ${node}`,
                      x: "x",
                      y: getCount(data),
                    },
                  ]}
                />
              ))}
            </ChartStack>
          </Chart>
        </div>
      </CardBody>
    </Card>
  ) : null;
}
