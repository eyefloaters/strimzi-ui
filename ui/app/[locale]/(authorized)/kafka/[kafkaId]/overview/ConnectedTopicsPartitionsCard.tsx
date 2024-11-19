import { TopicsResponse } from "@/api/topics/schema";
import { TopicsPartitionsCard } from "@/components/ClusterOverview/TopicsPartitionsCard";

export async function ConnectedTopicsPartitionsCard({
  data,
}: {
  data: Promise<TopicsResponse>;
}) {
  const summary = (await data).meta.summary;

  if (!summary) {
    return null;
  }

  const totalPartitions = summary.totalPartitions;
  const totalReplicated = summary.statuses.FullyReplicated ?? 0;
  const totalUnderReplicated =
    (summary.statuses.UnderReplicated ?? 0) +
    (summary.statuses.PartiallyOffline ?? 0);
  const totalOffline = summary.statuses.Offline ?? 0;

  return (
    <TopicsPartitionsCard
      isLoading={false}
      partitions={totalPartitions}
      topicsReplicated={totalReplicated}
      topicsUnderReplicated={totalUnderReplicated}
      topicsOffline={totalOffline}
    />
  );
}
