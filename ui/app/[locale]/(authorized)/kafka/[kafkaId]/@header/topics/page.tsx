import { getTopics } from "@/api/topics/actions";
import { KafkaParams } from "@/app/[locale]/(authorized)/kafka/[kafkaId]/kafka.params";
import { AppHeader } from "@/components/AppHeader";
import { Number } from "@/components/Format/Number";
import {
  Label,
  Spinner,
  Split,
  SplitItem,
  Tooltip,
} from "@/libs/patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@/libs/patternfly/react-icons";
import { Suspense } from "react";

export default function TopicsHeader({ params }: { params: KafkaParams }) {
  return (
    <Suspense fallback={<Header />}>
      <ConnectedHeader params={params} />
    </Suspense>
  );
}

async function ConnectedHeader({ params }: { params: KafkaParams }) {
  const topics = await getTopics(params.kafkaId, {});
  return (
    <Header
      total={topics.meta.page.total}
      ok={topics.meta.summary.statuses.FullyReplicated || 0}
      warning={topics.meta.summary.statuses.UnderReplicated || 0}
      error={
        (topics.meta.summary.statuses.PartiallyOffline || 0) +
        (topics.meta.summary.statuses.Offline || 0)
      }
    />
  );
}

function Header({
  total,
  ok,
  warning,
  error,
}: {
  total?: number;
  ok?: number;
  warning?: number;
  error?: number;
}) {
  return (
    <AppHeader
      title={
        <Split hasGutter={true}>
          <SplitItem>Topics</SplitItem>
          <SplitItem>
            <Label
              icon={total === undefined ? <Spinner size={"sm"} /> : undefined}
            >
              {total !== undefined && <Number value={total} />}&nbsp;total
            </Label>
          </SplitItem>
          <SplitItem>
            <Tooltip content={"Number of topics in sync"}>
              <Label
                icon={
                  ok === undefined ? (
                    <Spinner size={"sm"} />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                color={"teal"}
              >
                {ok !== undefined && <Number value={ok} />}
              </Label>
            </Tooltip>
          </SplitItem>
          <SplitItem>
            <Tooltip content={"Number of topics under replicated"}>
              <Label
                icon={
                  warning === undefined ? (
                    <Spinner size={"sm"} />
                  ) : (
                    <ExclamationTriangleIcon />
                  )
                }
                color={"orange"}
              >
                {warning !== undefined && <Number value={warning} />}
              </Label>
            </Tooltip>
          </SplitItem>
          <SplitItem>
            <Tooltip content={"Number of topics not available"}>
              <Label
                icon={
                  error === undefined ? (
                    <Spinner size={"sm"} />
                  ) : (
                    <ExclamationCircleIcon />
                  )
                }
                color={"red"}
              >
                {error !== undefined && <Number value={error} />}
              </Label>
            </Tooltip>
          </SplitItem>
        </Split>
      }
    />
  );
}
