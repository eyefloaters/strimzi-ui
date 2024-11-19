import { TopicMutateError } from "@/api/topics/schema";
import { Alert, Content } from "@patternfly/react-core";

export function Error({ error }: { error: TopicMutateError | "unknown" }) {
  return error !== "unknown" ? (
    error.errors.map((e, idx) => (
      <Alert key={idx} title={e.title} variant={"danger"}>
        <Content>
          <Content component="p">{e.detail}</Content>
          {e.source?.pointer && (
            <Content component={"small"}>
              <strong>Pointer</strong>&nbsp;
              {e.source.pointer}
            </Content>
          )}

          <Content component={"small"}>
            <strong>Error</strong>&nbsp;
            {e.id}
          </Content>
        </Content>
      </Alert>
    ))
  ) : (
    <Alert title={"Unexpected error"} variant={"danger"}>
      Sorry, something went wrong. Please try again later.
    </Alert>
  );
}
