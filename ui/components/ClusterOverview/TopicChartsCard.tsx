"use client";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  Title,
  Tooltip,
} from "@/libs/patternfly/react-core";
import { HelpIcon } from "@/libs/patternfly/react-icons";
import { ChartIncomingOutgoing } from "./components/ChartIncomingOutgoing";
import { ChartSkeletonLoader } from "./components/ChartSkeletonLoader";
import { useTranslations } from "next-intl";

type TopicChartsCardProps = {
  incoming: TimeSeriesMetrics;
  outgoing: TimeSeriesMetrics;
};

export function TopicChartsCard({
  isLoading,
  incoming,
  outgoing,
}:
  | ({ isLoading: false } & TopicChartsCardProps)
  | ({
      isLoading: true;
    } & Partial<{ [key in keyof TopicChartsCardProps]?: undefined }>)) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Title headingLevel={"h2"} size={"lg"}>
            {t("topicMetricsCard.topic_metric")}
          </Title>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Flex direction={{ default: "column" }} gap={{ default: "gapLg" }}>
          <b>
            {t("topicMetricsCard.topics_bytes_incoming_and_outgoing")}{" "}
            <Tooltip
              content={t(
                "topicMetricsCard.topics_bytes_incoming_and_outgoing_tooltip",
              )}
            >
              <HelpIcon />
            </Tooltip>
          </b>
          {isLoading ? (
            <ChartSkeletonLoader />
          ) : (
            <ChartIncomingOutgoing incoming={incoming} outgoing={outgoing} />
          )}
        </Flex>
      </CardBody>
    </Card>
  );
}
