"use client";

import { ApiResponse } from "@/api/api";
import { Message } from "@/api/messages/schema";
import { getTopicMessages } from "@/api/messages/actions";
import { useParseSearchParams } from "@/app/[locale]/(authorized)/kafka/[kafkaId]/topics/[topicId]/messages/useParseSearchParams";
import { AlertContinuousMode } from "@/components/MessagesTable/AlertContinuousMode";
import { MessagesTable } from "@/components/MessagesTable/MessagesTable";
import { MessagesTableSkeleton } from "@/components/MessagesTable/MessagesTableSkeleton";
import { NoDataEmptyState } from "@/components/MessagesTable/NoDataEmptyState";
import { NoDataErrorState } from "@/components/NoDataErrorState";
import { SearchParams } from "@/components/MessagesTable/types";
import { useFilterParams } from "@/utils/useFilterParams";
import {
  startTransition,
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";

const EMPTY_MESSAGES: ApiResponse<Message[]> = {
  payload: undefined,
  errors: undefined,
  timestamp: new Date(0),
};

export function ConnectedMessagesTable({
  kafkaId,
  topicId,
  topicName,
  selectedMessage: serverSelectedMessage,
  partitions,
}: {
  kafkaId: string;
  topicId: string;
  topicName: string;
  selectedMessage: Message | undefined;
  partitions: number;
}) {
  const [params, sp] = useParseSearchParams();
  const updateUrl = useFilterParams(sp);
  const { limit, partition, query, where, offset, timestamp, epoch, _ } =
    params;
  const [selectedMessage, setOptimisticSelectedMessage] = useOptimistic<
    Message | undefined
  >(serverSelectedMessage);

  const [messages, setMessages] = useState(EMPTY_MESSAGES);

  function onSearch({ query, from, limit, partition }: SearchParams) {
    setMessages(EMPTY_MESSAGES);

    const newQuery = {
      query: query?.value,
      where: query?.where,
      partition,
      offset: from.type === "offset" ? from.value : "",
      timestamp: from.type === "timestamp" ? from.value : "",
      epoch: from.type === "epoch" ? from.value : "",
      retrieve: limit,
      _: Date.now(),
    };
    updateUrl(newQuery);
  }

  function setSelected(message: Message) {
    startTransition(() => setOptimisticSelectedMessage(message));
    updateUrl({
      ...params,
      selected: `${message.attributes.partition}:${message.attributes.offset}`,
    });
  }

  function deselectMessage() {
    startTransition(() => setOptimisticSelectedMessage(undefined));
    updateUrl({
      ...params,
      selected: undefined,
    });
  }

  function onReset() {
    onSearch({
      query: undefined,
      from: {
        type: "latest",
      },
      limit: 50,
      partition: undefined,
    });
  }

  const fetchMessages = useCallback(
    async function fetchMessages() {
      const filter = (() => {
        if (offset) return { type: "offset" as const, value: offset };
        if (timestamp) return { type: "timestamp" as const, value: timestamp };
        if (epoch) return { type: "epoch" as const, value: epoch };
        return undefined;
      })();

      const response = await getTopicMessages(kafkaId, topicId, {
        pageSize: limit === "continuously" ? 50 : (limit ?? 50),
        query,
        where,
        partition,
        filter,
      });

      if (response.errors) {
        setMessages({
          errors: response.errors,
          timestamp: response.timestamp,
        });
      } else {
        setMessages({
          payload: response.payload ?? undefined,
          timestamp: response.timestamp,
        });
      }
    },
    [
      epoch,
      kafkaId,
      limit,
      offset,
      partition,
      query,
      timestamp,
      topicId,
      where,
    ],
  );

  useEffect(() => {
    void fetchMessages();
  }, [
    fetchMessages,
    _, // when clicking search multiple times, the search parameters remain the same but a timestamp is added to _. We listen for changes to _ to know we have to trigger a new fetch
  ]);

  const onUpdates = useCallback((newMessages: ApiResponse<Message[]>) => {
    startTransition(() =>
      setMessages((prevMessages) => {
        const messagesToAdd =
          newMessages.payload?.filter(
            (m) =>
              !prevMessages.payload?.find(
                (m2) =>
                  m2.attributes.offset === m.attributes.offset &&
                  m2.attributes.partition === m.attributes.partition,
              ),
          ) ?? [];
        return {
          payload: Array.from(
            new Set([...messagesToAdd, ...(prevMessages.payload ?? [])]),
          ).slice(0, 100),
          errors: newMessages.errors,
          timestamp: newMessages.timestamp,
        };
      }),
    );
  }, []);

  const isFiltered = partition || epoch || offset || timestamp || query;

  switch (true) {
    case messages.errors !== undefined:
      return <NoDataErrorState errors={messages.errors} />;
    case messages.payload === undefined:
      return (
        <MessagesTableSkeleton
          filterLimit={limit}
          filterTimestamp={timestamp}
          filterPartition={partition}
          filterOffset={offset}
          filterEpoch={epoch}
          filterQuery={query}
          filterWhere={where}
        />
      );
    case !isFiltered && messages.payload && messages.payload?.length === 0:
      return <NoDataEmptyState />;
    default:
      return (
        <>
          <MessagesTable
            topicName={topicName}
            selectedMessage={selectedMessage}
            lastUpdated={messages.timestamp}
            messages={messages.payload!}
            partitions={partitions}
            filterLimit={limit}
            filterQuery={query}
            filterWhere={where}
            filterOffset={offset}
            filterEpoch={epoch}
            filterTimestamp={timestamp}
            filterPartition={partition}
            onSearch={onSearch}
            onSelectMessage={setSelected}
            onDeselectMessage={deselectMessage}
            onReset={onReset}
          >
            {limit === "continuously" && (
              <Refresher
                topicId={topicId}
                kafkaId={kafkaId}
                query={query}
                where={where}
                partition={partition}
                onUpdates={onUpdates}
              />
            )}
          </MessagesTable>
        </>
      );
  }
}

function Refresher({
  kafkaId,
  topicId,
  query,
  where,
  partition,
  onUpdates,
}: {
  kafkaId: string;
  topicId: string;
  query?: string;
  where: any;
  partition?: number;
  onUpdates: (response: ApiResponse<Message[]>) => void;
}) {
  const previousTs = useRef<string>(new Date().toISOString());
  const isFetching = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;

    async function appendMessages() {
      const response = await getTopicMessages(kafkaId, topicId, {
        pageSize: 50,
        query,
        where,
        partition,
        filter: {
          type: "timestamp",
          value: previousTs.current,
        },
      });
      if (!response.errors) {
        const sortedMessages =
          response.payload
            ?.sort(
              (a, b) =>
                new Date(b.attributes.timestamp).getTime() -
                new Date(a.attributes.timestamp).getTime(),
            )
            .sort((a, b) => b.attributes.offset - a.attributes.offset) ?? [];
        return {
          payload: sortedMessages,
          timestamp: response.timestamp,
        };
      }
    }

    async function tick() {
      if (!isFetching.current && !isPaused) {
        isFetching.current = true;
        const res = await appendMessages();
        if (!isPaused && res) {
          previousTs.current = res.timestamp.toISOString();
          onUpdates(res);
        }
        isFetching.current = false;
      }
    }

    t = setInterval(tick, 1000);
    void tick();

    return () => {
      clearInterval(t);
      t = undefined;
    };
  }, [isPaused, kafkaId, onUpdates, partition, query, topicId, where]);

  return (
    <AlertContinuousMode
      isPaused={isPaused}
      onToggle={() => setIsPaused((p) => !p)}
    />
  );
}
