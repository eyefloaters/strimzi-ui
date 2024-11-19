"use client";

import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function OptimizationProposal({
  numIntraBrokerReplicaMovements,
  numReplicaMovements,
  onDemandBalancednessScoreAfter,
  intraBrokerDataToMoveMB,
  monitoredPartitionsPercentage,
  excludedBrokersForReplicaMove,
  excludedBrokersForLeadership,
  onDemandBalancednessScoreBefore,
  recentWindows,
  dataToMoveMB,
  excludedTopics,
  numLeaderMovements,
  sessionId,
  baseurl,
}: {
  numIntraBrokerReplicaMovements: number | undefined;
  numReplicaMovements: number | undefined;
  onDemandBalancednessScoreAfter: number | undefined;
  intraBrokerDataToMoveMB: number | undefined;
  monitoredPartitionsPercentage: number | undefined;
  excludedBrokersForReplicaMove: string[] | null | undefined;
  excludedBrokersForLeadership: string[] | null | undefined;
  onDemandBalancednessScoreBefore: number | undefined;
  recentWindows: number | undefined;
  dataToMoveMB: number | undefined;
  excludedTopics: string[] | null | undefined;
  numLeaderMovements: number | undefined;
  isModalOpen: boolean;
  sessionId: string | null | undefined;
  baseurl: string;
}) {
  const t = useTranslations("Rebalancing");
  const router = useRouter();

  const onClickClose = () => {
    router.push(`${baseurl}`);
  };
  return (
    <Modal
      title={t("optimization_proposal_of_kafka_rebalance")}
      variant={ModalVariant.medium}
      isOpen={true}
      onClose={onClickClose}
    >
      <ModalHeader title={t("optimization_proposal_of_kafka_rebalance")} />
      <ModalBody>
        <DescriptionList
          isHorizontal
          horizontalTermWidthModifier={{
            default: "12ch",
            sm: "15ch",
            md: "20ch",
            lg: "28ch",
            xl: "30ch",
            "2xl": "35ch",
          }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t("data_to_move")}</DescriptionListTerm>
            <DescriptionListDescription>
              {dataToMoveMB || 0}
              {" MB"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("excluded_brokers_for_leadership")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {excludedBrokersForLeadership &&
              excludedBrokersForLeadership.length > 0
                ? excludedBrokersForLeadership.join(", ")
                : "-"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("excluded_brokers_for_replica_move")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {excludedBrokersForReplicaMove &&
              excludedBrokersForReplicaMove.length > 0
                ? excludedBrokersForReplicaMove.join(", ")
                : "-"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("excluded_topics")}</DescriptionListTerm>
            <DescriptionListDescription>
              {excludedTopics && excludedTopics.length > 0
                ? excludedTopics.join(", ")
                : "-"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("intra_broker_data_to_move")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {intraBrokerDataToMoveMB || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("monitored_partitions_percentage")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {monitoredPartitionsPercentage || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("num_intra_broker_replica_movements")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {numIntraBrokerReplicaMovements || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("num_leader_movements")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {numLeaderMovements || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("num_replica_movements")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {numReplicaMovements || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("on_demand_balancedness_score_after")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {onDemandBalancednessScoreAfter || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {t("on_demand_balancedness_Score_before")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {onDemandBalancednessScoreBefore || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("recent_windows")}</DescriptionListTerm>
            <DescriptionListDescription>
              {recentWindows || 0}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t("session_id")}</DescriptionListTerm>
            <DescriptionListDescription>
              {sessionId ?? "-"}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </ModalBody>
      <ModalFooter>
        <Button key="done" variant="primary" onClick={onClickClose}>
          {t("done")}
        </Button>
        <Button key="cancel" variant="link" onClick={onClickClose}>
          {t("cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
