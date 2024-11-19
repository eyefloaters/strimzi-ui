import { getKafkaCluster } from "@/api/kafka/actions";
import { KafkaParams } from "@/app/[locale]/(authorized)/kafka/[kafkaId]/kafka.params";
import { AppHeader } from "@/components/AppHeader";
import { Number } from "@/components/Format/Number";
import { NavTabLink } from "@/components/Navigation/NavTabLink";
import {
  Label,
  PageSection,
  Spinner,
  Split,
  SplitItem,
} from "@/libs/patternfly/react-core";
import { CheckCircleIcon } from "@/libs/patternfly/react-icons";
import { Suspense } from "react";

export default function NodesHeader({ params }: { params: KafkaParams }) {
  return (
    <Suspense
      fallback={<Header kafkaId={undefined} cruiseControlEnable={false} />}
    >
      <ConnectedHeader params={params} />
    </Suspense>
  );
}

async function ConnectedHeader({ params }: { params: KafkaParams }) {
  const cluster = await getKafkaCluster(params.kafkaId);
  return (
    <Header
      total={cluster?.attributes.nodes.length || 0}
      kafkaId={cluster?.id}
      cruiseControlEnable={cluster?.attributes.cruiseControlEnabled || false}
    />
  );
}

function Header({
  total,
  kafkaId,
  cruiseControlEnable,
}: {
  total?: number;
  kafkaId: string | undefined;
  cruiseControlEnable: boolean;
}) {
  const tabs = [
    { key: 0, title: "Overview", url: `/kafka/${kafkaId}/nodes` },
    ...(cruiseControlEnable
      ? [
          {
            key: 1,
            title: "Rebalance",
            url: `/kafka/${kafkaId}/nodes/rebalances`,
          },
        ]
      : []),
  ];

  return (
    <AppHeader
      title={
        <Split hasGutter={true}>
          <SplitItem>Brokers</SplitItem>
          <SplitItem>
            <Label
              color={"green"}
              icon={
                total === undefined ? (
                  <Spinner size={"sm"} />
                ) : (
                  <CheckCircleIcon />
                )
              }
            >
              {total && <Number value={total} />}
            </Label>
          </SplitItem>
        </Split>
      }
      navigation={
        <PageSection className="pf-v6-u-px-sm" type="subnav">
          <NavTabLink tabs={tabs} />
        </PageSection>
      }
    />
  );
}
