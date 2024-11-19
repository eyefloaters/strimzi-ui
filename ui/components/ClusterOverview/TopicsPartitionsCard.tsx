import { Number } from "@/components/Format/Number";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Divider,
  Flex,
  FlexItem,
  Icon,
  Skeleton,
  Content,
  Tooltip,
} from "@/libs/patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HelpIcon,
} from "@/libs/patternfly/react-icons";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type TopicsPartitionsCardProps = {
  topicsReplicated: number;
  topicsUnderReplicated: number;
  topicsOffline: number;
  partitions: number;
};

export function TopicsPartitionsCard({
  isLoading,
  topicsReplicated,
  topicsUnderReplicated,
  topicsOffline,
  partitions,
}:
  | ({ isLoading: false } & TopicsPartitionsCardProps)
  | ({
      isLoading: true;
    } & Partial<{ [key in keyof TopicsPartitionsCardProps]?: undefined }>)) {
  const t = useTranslations();
  return (
    <Card component={"div"}>
      <CardHeader
        actions={{
          actions: (
            <Link href={"./topics"}>
              {t("ClusterOverview.view_all_topics")}
            </Link>
          ),
        }}
      >
        <CardTitle>{t("ClusterOverview.topic_header")}</CardTitle>
      </CardHeader>
      <CardBody>
        <Flex gap={{ default: "gapLg" }}>
          <Flex
            flex={{ default: "flex_1" }}
            direction={{ default: "column" }}
            alignSelf={{ default: "alignSelfCenter" }}
          >
            <FlexItem>
              {isLoading ? (
                <Skeleton />
              ) : (
                <Flex gap={{ default: "gapMd" }}>
                  <FlexItem>
                    <Content>
                      <Content component={"small"}>
                        <Link href={"./topics"}>
                          <Number
                            value={
                              topicsReplicated +
                              topicsUnderReplicated +
                              topicsOffline
                            }
                          />{" "}
                          {t("ClusterOverview.total_topics")}
                        </Link>
                      </Content>
                    </Content>
                  </FlexItem>
                  <Divider orientation={{ default: "vertical" }} />
                  <FlexItem>
                    <Content>
                      <Content component={"small"}>
                        <Number value={partitions} />
                        &nbsp; {t("ClusterOverview.total_partitions")}
                      </Content>
                    </Content>
                  </FlexItem>
                </Flex>
              )}
            </FlexItem>
          </Flex>
          <Divider />
          <Flex
            flex={{ default: "flex_1" }}
            style={{ textAlign: "center" }}
            justifyContent={{ default: "justifyContentSpaceAround" }}
            direction={{ default: "column", "2xl": "row" }}
            flexWrap={{ default: "nowrap" }}
          >
            <FlexItem>
              <Link href={"./topics?status=FullyReplicated"}>
                {isLoading ? (
                  <Skeleton
                    shape={"circle"}
                    width={"1rem"}
                    style={{ display: "inline-block" }}
                  />
                ) : (
                  <Number value={topicsReplicated} />
                )}
              </Link>
              <Content className={"pf-v6-u-text-nowrap"}>
                <Content component={"small"}>
                  <Icon status={"success"}>
                    <CheckCircleIcon />
                  </Icon>
                  &nbsp;{t("ClusterOverview.fully_replicated_partition")}&nbsp;
                  <Tooltip
                    content={t(
                      "ClusterOverview.fully_replicated_partition_tooltip",
                    )}
                  >
                    <HelpIcon />
                  </Tooltip>
                </Content>
              </Content>
            </FlexItem>
            <FlexItem>
              <Link href={"./topics?status=UnderReplicated"}>
                {isLoading ? (
                  <Skeleton
                    shape={"circle"}
                    width={"1rem"}
                    style={{ display: "inline-block" }}
                  />
                ) : (
                  <Number value={topicsUnderReplicated} />
                )}
              </Link>
              <Content className={"pf-v6-u-text-nowrap"}>
                <Content component={"small"}>
                  <Icon status={"warning"}>
                    <ExclamationTriangleIcon />
                  </Icon>
                  &nbsp;{t("ClusterOverview.under_replicated_partition")}&nbsp;
                  <Tooltip
                    content={t(
                      "ClusterOverview.under_replicated_partition_tooltip",
                    )}
                  >
                    <HelpIcon />
                  </Tooltip>
                </Content>
              </Content>
            </FlexItem>
            <FlexItem>
              <Link href={"./topics?status=Offline"}>
                {isLoading ? (
                  <Skeleton
                    shape={"circle"}
                    width={"1rem"}
                    style={{ display: "inline-block" }}
                  />
                ) : (
                  <Number value={topicsOffline} />
                )}
              </Link>
              <Content className={"pf-v6-u-text-nowrap"}>
                <Content component={"small"}>
                  <Icon status={"danger"}>
                    <ExclamationCircleIcon />
                  </Icon>
                  &nbsp;{t("ClusterOverview.unavailable_partition")}&nbsp;
                  <Tooltip
                    content={t("ClusterOverview.unavailable_partition_tooltip")}
                  >
                    <HelpIcon />
                  </Tooltip>
                </Content>
              </Content>
            </FlexItem>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
}
