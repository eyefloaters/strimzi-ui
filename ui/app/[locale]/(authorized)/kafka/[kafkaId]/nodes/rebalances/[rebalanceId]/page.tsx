import { KafkaParams } from "@/app/[locale]/(authorized)/kafka/[kafkaId]/kafka.params";
import { PageSection } from "@/libs/patternfly/react-core";
import { Suspense } from "react";
import { KafkaRebalanceParams } from "./KafkaRebalance.params";
import { OptimizationProposal } from "./OptimizationProposal";
import { getRebalanceDetails } from "@/api/rebalance/actions";

export default function OptimizationProposalPage({
  params,
}: {
  params: KafkaRebalanceParams;
}) {
  return (
    <PageSection>
      <Suspense
        fallback={
          <OptimizationProposal
            numIntraBrokerReplicaMovements={0}
            numReplicaMovements={0}
            onDemandBalancednessScoreAfter={0}
            intraBrokerDataToMoveMB={0}
            monitoredPartitionsPercentage={0}
            excludedBrokersForReplicaMove={[]}
            excludedBrokersForLeadership={[]}
            onDemandBalancednessScoreBefore={0}
            recentWindows={0}
            dataToMoveMB={0}
            excludedTopics={[]}
            numLeaderMovements={0}
            isModalOpen={false}
            sessionId={""}
            baseurl={`/kafka/${params.kafkaId}/nodes/rebalances`}
          />
        }
      >
        <ConnectedOptimizationProposal params={params} />
      </Suspense>
    </PageSection>
  );
}

async function ConnectedOptimizationProposal({
  params: { kafkaId, rebalanceId },
}: {
  params: KafkaParams & { rebalanceId: string };
}) {
  const rebalanceDetails = await getRebalanceDetails(kafkaId, rebalanceId);

  if (rebalanceDetails && typeof rebalanceDetails !== "boolean") {
    const { optimizationResult, sessionId } = rebalanceDetails.attributes;

    return (
      <OptimizationProposal
        numIntraBrokerReplicaMovements={
          optimizationResult.numIntraBrokerReplicaMovements
        }
        numReplicaMovements={optimizationResult.numReplicaMovements}
        onDemandBalancednessScoreAfter={
          optimizationResult.onDemandBalancednessScoreAfter
        }
        intraBrokerDataToMoveMB={optimizationResult.intraBrokerDataToMoveMB}
        monitoredPartitionsPercentage={
          optimizationResult.monitoredPartitionsPercentage
        }
        excludedBrokersForReplicaMove={
          optimizationResult.excludedBrokersForReplicaMove
        }
        excludedBrokersForLeadership={
          optimizationResult.excludedBrokersForLeadership
        }
        onDemandBalancednessScoreBefore={
          optimizationResult.onDemandBalancednessScoreBefore
        }
        recentWindows={optimizationResult.recentWindows}
        dataToMoveMB={optimizationResult.dataToMoveMB}
        excludedTopics={optimizationResult.excludedTopics}
        numLeaderMovements={optimizationResult.numLeaderMovements}
        isModalOpen={true}
        sessionId={sessionId}
        baseurl={`/kafka/${kafkaId}/nodes/rebalances`}
      />
    );
  } else {
    return <div>No rebalance details available.</div>;
  }
}
