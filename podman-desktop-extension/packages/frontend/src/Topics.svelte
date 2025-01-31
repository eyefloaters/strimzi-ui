<script lang="ts">
  import './app.css';
  import {filterUndefinedFromObj} from '/@/api/api-common';
  import {type ClusterList} from '/@/api/api-kafka';
  import {type TopicList, type TopicsResponse, TopicsResponseSchema, type TopicStatus} from '/@/api/api-topics';
  import {streamshubClient} from '/@/api/client';
  import TopicsConsumerGroupsColumn from '/@/lib/TopicsConsumerGroupsColumn.svelte';
  import TopicsNameColumn from '/@/lib/TopicsNameColumn.svelte';
  import TopicsPartitionsColumn from '/@/lib/TopicsPartitionsColumn.svelte';
  import NavPage from '/@/lib/upstream/NavPage.svelte';
  import type {StreamshubConsoleInfo} from '/@shared/src/models/streamshub';
  import {Table, TableColumn, TableRow} from '@podman-desktop/ui-svelte';
  import {onMount} from 'svelte';

  export let project: string;
  export let cluster: string;
  export let clusterName: string;
  let consoleObj: StreamshubConsoleInfo | undefined = undefined;
  let topicsTableData: TopicListColumn[] | undefined;

  type TopicListColumn = TopicList & { selected: boolean, cluster: string, project: string }

  onMount(async () => {
    const consoles = await streamshubClient.listConsoles();
    consoleObj = consoles.find(c => c.project === project);

    const topics = await getTopics(cluster, {});
    topicsTableData = topics.data.map(t => ({ ...t, selected: false, cluster, project }));
  });


  async function getTopics(
    kafkaId: string,
    params: {
      name?: string;
      id?: string;
      status?: TopicStatus[];
      pageSize?: number;
      pageCursor?: string;
      sort?: string;
      sortDir?: string;
      includeHidden?: boolean;
    },
  ): Promise<TopicsResponse> {
    const sp = new URLSearchParams(
      filterUndefinedFromObj({
        'fields[topics]':
          'name,status,visibility,numPartitions,totalLeaderLogBytes,consumerGroups',
        'filter[id]': params.id ? `eq,${params.id}` : undefined,
        'filter[name]': params.name ? `like,*${params.name}*` : undefined,
        'filter[status]':
          params.status && params.status.length > 0
            ? `in,${params.status.join(',')}`
            : undefined,
        'filter[visibility]': params.includeHidden
          ? 'in,external,internal'
          : 'eq,external',
        'page[size]': params.pageSize,
        'page[after]': params.pageCursor,
        sort: params.sort
          ? (params.sortDir !== 'asc' ? '-' : '') + params.sort
          : undefined,
      }),
    );
    const topicsQuery = sp.toString();
    const url = `${consoleObj!.api.baseUrl}/api/kafkas/${kafkaId}/topics?${topicsQuery}&`;
    const res = await fetch(url);
    console.log({ url }, 'getTopics');
    const rawData = await res.json();
    console.log({ url, rawData }, 'getTopics response');
    return TopicsResponseSchema.parse(rawData);
  }

  let selectedItemsNumber: number;
  let table: Table;

  let nameColumn = new TableColumn<TopicList>('Name', {
    renderer: TopicsNameColumn,
    comparator: (a, b) => a.attributes.name.localeCompare(b.attributes.name),
  });

  let partitionsColumn = new TableColumn<TopicList>('Partitions', {
    renderer: TopicsPartitionsColumn,
    comparator: (a, b) => (a.attributes.numPartitions ?? 0) - (b.attributes.numPartitions ?? 0),
  });

  let consumerGroupsColumn = new TableColumn<TopicList>('Consumer groups', {
    renderer: TopicsConsumerGroupsColumn,
    comparator: (a, b) => (a.relationships.consumerGroups.data.length - b.relationships.consumerGroups.data.length),
  });


  const columns: TableColumn<TopicList, TopicList | string>[] = [
    nameColumn,
    partitionsColumn,
    consumerGroupsColumn,
  ];

  const row = new TableRow<ClusterList>({});
</script>

<NavPage
  lastPage="{{ name: 'Clusters', path: `/console/${project}` }}"
  loading={topicsTableData === undefined}
  searchEnabled="{false}"
  title={clusterName}
>
  <div class="flex min-w-full h-full py-5" slot="content">
    {#if topicsTableData}
      <Table
        bind:this="{table}"
        columns="{columns}"
        data="{topicsTableData}"
        defaultSortColumn="Name"
        kind="Running clusters"
        on:update="{() => (topicsTableData = topicsTableData)}"
        row="{row}">
      </Table>

      {#if topicsTableData.length === 0}
        No topics.
      {/if}
    {/if}
  </div>

</NavPage>
