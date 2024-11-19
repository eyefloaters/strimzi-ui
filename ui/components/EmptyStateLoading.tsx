import { EmptyState, Spinner } from "@/libs/patternfly/react-core";

export function EmptyStateLoading() {
  return (
    <EmptyState
      titleText={"Loading"}
      headingLevel="h4"
      icon={Spinner}
    ></EmptyState>
  );
}
