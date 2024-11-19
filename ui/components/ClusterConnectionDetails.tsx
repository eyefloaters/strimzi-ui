import { getKafkaCluster } from "@/api/kafka/actions";
import { ExpandableSection } from "@/components/ExpandableSection";
import { ExternalLink } from "@/components/Navigation/ExternalLink";
import {
  Badge,
  ClipboardCopy,
  List,
  ListItem,
  Content,
} from "@/libs/patternfly/react-core";
import { Divider, Stack, StackItem } from "@patternfly/react-core";
import { useTranslations } from "next-intl";
import { isProductizedBuild } from "@/utils/env";


export async function ClusterConnectionDetails({
  clusterId,
}: {
  clusterId: string;
}) {
  const t = useTranslations();
  const data = await getKafkaCluster(clusterId);
  if (!data) {
    return null;
  }
  const listeners = data.attributes.listeners || [];
  const external = listeners.filter((l) => l.type !== "internal");
  const internal = listeners.filter((l) => l.type === "internal");
  return (
    <Stack>
      <StackItem isFilled={true}>
        <Content className={"pf-v6-u-p-lg"}>
          <Content>{t("ClusterConnectionDetails.description")}</Content>

          <ExpandableSection
            displaySize={"lg"}
            initialExpanded={true}
            toggleContent={
              <div>
                {t("ClusterConnectionDetails.external_servers_bootstraps")}{" "}
                <Badge isRead={true}>{external.length}</Badge>
              </div>
            }
          >
            <Content>
              {t(
                "ClusterConnectionDetails.external_servers_bootstraps_description",
              )}
            </Content>
            <List isPlain={true}>
              {external.map((l, idx) => (
                <ListItem key={idx} className={"pf-v6-u-py-sm"}>
                  <ClipboardCopy isReadOnly={true}>
                    {l.bootstrapServers ?? ""}
                  </ClipboardCopy>
                  <Content component={"small"}>
                    {/*Listener type: {l.type}*/}
                    {/*<br />*/}
                    {t("ClusterConnectionDetails.authentication_type")}{" "}
                    {l.authType || "none"}
                  </Content>
                </ListItem>
              ))}
            </List>
          </ExpandableSection>

          <ExpandableSection
            displaySize={"lg"}
            initialExpanded={true}
            toggleContent={
              <div>
                {t("ClusterConnectionDetails.internal_servers_bootstraps")}{" "}
                <Badge isRead={true}>{internal.length}</Badge>
              </div>
            }
            className={"pf-v6-u-mt-lg"}
          >
            <Content>
              {t(
                "ClusterConnectionDetails.internal_Servers_bootstraps_description",
              )}
            </Content>
            <List isPlain={true}>
              {internal.map((l, idx) => (
                <ListItem key={idx} className={"pf-v6-u-py-sm"}>
                  <ClipboardCopy isReadOnly={true}>
                    {l.bootstrapServers ?? ""}
                  </ClipboardCopy>
                  <Content component={"small"}>
                    {t("ClusterConnectionDetails.authentication_type")}{" "}
                    {l.authType || "none"}
                  </Content>
                </ListItem>
              ))}
            </List>

            <Content>
              {t(
                "ClusterConnectionDetails.when_you_have_established_a_connection",
              )}
            </Content>
          </ExpandableSection>
        </Content>
      </StackItem>
      {isProductizedBuild && (
        <StackItem>
          <Divider />
          <Stack hasGutter={true} className={"pf-v6-u-p-lg"}>
            {t("learning.links.connecting") && (
              <StackItem>
                <ExternalLink
                  testId={"drawer-footer-help-1"}
                  href={t("learning.links.connecting")}
                >
                  {t(
                    "ClusterConnectionDetails.developing_kafka_client_applications",
                  )}
                </ExternalLink>
              </StackItem>
            )}
            <StackItem>
              <ExternalLink
                testId={"drawer-footer-help-1"}
                href={t("learning.links.overview")}
              >
                {t("learning.labels.overview")}
              </ExternalLink>
            </StackItem>
          </Stack>
        </StackItem>
      )}
    </Stack>
  );
}
