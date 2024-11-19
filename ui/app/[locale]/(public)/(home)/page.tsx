import { getKafkaClusters } from "@/api/kafka/actions";
import { AppLayout } from "@/components/AppLayout";
import { ClustersTable } from "@/components/ClustersTable";
import { ExpandableCard } from "@/components/ExpandableCard";
import { Number } from "@/components/Format/Number";
import { ExternalLink } from "@/components/Navigation/ExternalLink";
import { RedirectOnLoad } from "@/components/Navigation/RedirectOnLoad";
import {
  Card,
  CardBody,
  CardTitle,
  Content,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Label,
  LabelGroup,
  Level,
  LevelItem,
  PageSection,
  Skeleton,
  Stack,
  StackItem,
  Title,
} from "@/libs/patternfly/react-core";
import { isProductizedBuild } from "@/utils/env";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import styles from "./home.module.css";

export default async function Home() {
  const t = await getTranslations();
  const allClusters = await getKafkaClusters();
  const productName = t("common.product");
  const brand = t("common.brand");

  if (allClusters.length === 1) {
    return <RedirectOnLoad url={`/kafka/${allClusters[0].id}/login`} />;
  }

  return (
    <AppLayout>
      <PageSection padding={{ default: "noPadding" }} variant={"default"}>
        <div className={styles.hero}>
          <div>
            <Content>
              <Title headingLevel={"h1"} size={"2xl"}>
                {t.rich("homepage.page_header", { product: productName })}
              </Title>
              <Content className={"pf-v6-u-color-200"}>
                {t("homepage.page_subtitle", {
                  brand: brand,
                  product: productName,
                })}
              </Content>
            </Content>
          </div>
        </div>
      </PageSection>
      <PageSection>
        <Stack hasGutter={true}>
          <StackItem>
            <Card isCompact={true}>
              <CardTitle>
                <Content>
                  {t.rich("homepage.platform_openshift_cluster")}
                  <Content component={"small"}>
                    <Suspense fallback={<Skeleton width={"200px"} />}>
                      <Number value={allClusters.length} />
                      &nbsp;{t("homepage.connected_kafka_clusters")}
                    </Suspense>
                  </Content>
                </Content>
              </CardTitle>
              <CardBody>
                <Suspense fallback={<ClustersTable clusters={undefined} />}>
                  <ClustersTable clusters={allClusters} />
                </Suspense>
              </CardBody>
            </Card>
          </StackItem>
          <StackItem></StackItem>
          {isProductizedBuild && (
            <StackItem>
              <ExpandableCard
                title={
                  <Level>
                    <LevelItem>
                      <Content>
                        {t.rich("homepage.recommended_learning_resources")}
                      </Content>
                    </LevelItem>
                  </Level>
                }
                collapsedTitle={
                  <Level>
                    <LevelItem>
                      <Stack>
                        <StackItem>
                          <Content>
                            {t.rich("homepage.recommended_learning_resources")}
                          </Content>
                        </StackItem>
                        <StackItem>
                          <LabelGroup isCompact>
                            <Label isCompact color="orange">
                              {t("homepage.documentation")}
                            </Label>
                          </LabelGroup>
                        </StackItem>
                      </Stack>
                    </LevelItem>
                  </Level>
                }
                isCompact={true}
              >
                <CardBody>
                  <DataList aria-label="Recommended learning resources">
                    <DataListItem aria-labelledby="gs-1-1">
                      <DataListItemRow>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key="gs-1-1" width={2}>
                              <span id="gs-1-1">
                                {t("learning.labels.overview")}
                              </span>
                            </DataListCell>,
                            <DataListCell key="gs-1-2">
                              <Label isCompact={true} color={"orange"}>
                                {t("homepage.documentation")}
                              </Label>
                            </DataListCell>,
                            <DataListCell key="gs-1-3">
                              <ExternalLink
                                testId={"gs-1-3"}
                                href={t("learning.links.overview")}
                              >
                                {t("homepage.view_documentation")}
                              </ExternalLink>
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                    {t("learning.links.gettingStarted") && (
                      <DataListItem aria-labelledby="gs-2-1">
                        <DataListItemRow>
                          <DataListItemCells
                            dataListCells={[
                              <DataListCell key="gs-2-1" width={2}>
                                <span id="gs-2-1">
                                  {t("learning.labels.gettingStarted")}
                                </span>
                              </DataListCell>,
                              <DataListCell key="gs-2-2">
                                <Label isCompact={true} color={"orange"}>
                                  {t("homepage.documentation")}
                                </Label>
                              </DataListCell>,
                              <DataListCell key="gs-2-3">
                                <ExternalLink
                                  testId={"gs-2-3"}
                                  href={t("learning.links.gettingStarted")}
                                >
                                  {t("homepage.view_documentation")}
                                </ExternalLink>
                              </DataListCell>,
                            ]}
                          />
                        </DataListItemRow>
                      </DataListItem>
                    )}
                    {t("learning.links.connecting") && (
                      <DataListItem aria-labelledby="gs-3-1">
                        <DataListItemRow>
                          <DataListItemCells
                            dataListCells={[
                              <DataListCell key="gs-3-1" width={2}>
                                <span id="gs-3-1">
                                  {t("learning.labels.connecting")}
                                </span>
                              </DataListCell>,
                              <DataListCell key="gs-3-2">
                                <Label isCompact={true} color={"orange"}>
                                  {t("homepage.documentation")}
                                </Label>
                              </DataListCell>,
                              <DataListCell key="gs-3-3">
                                <ExternalLink
                                  testId={"gs-3-3"}
                                  href={t("learning.links.connecting")}
                                >
                                  {t("homepage.view_documentation")}
                                </ExternalLink>
                              </DataListCell>,
                            ]}
                          />
                        </DataListItemRow>
                      </DataListItem>
                    )}
                    <DataListItem aria-labelledby="gs-4-1">
                      <DataListItemRow>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key="gs-4-1" width={2}>
                              <span id="gs-4-1">
                                {t("learning.labels.topicOperatorUse")}
                              </span>
                            </DataListCell>,
                            <DataListCell key="gs-4-2">
                              <Label isCompact={true} color={"orange"}>
                                {t("homepage.documentation")}
                              </Label>
                            </DataListCell>,
                            <DataListCell key="gs-4-3">
                              <ExternalLink
                                testId={"gs-4-3"}
                                href={t("learning.links.topicOperatorUse")}
                              >
                                {t("homepage.view_documentation")}
                              </ExternalLink>
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  </DataList>
                </CardBody>
              </ExpandableCard>
            </StackItem>
          )}
        </Stack>
      </PageSection>
    </AppLayout>
  );
}
