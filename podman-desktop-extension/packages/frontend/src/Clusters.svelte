<script lang="ts">
  import './app.css';
  import {type ClusterList, ClustersResponseSchema} from '/@/api/api-kafka';
  import {streamshubClient} from '/@/api/client';
  import ClusterNameColumn from '/@/lib/ClusterNameColumn.svelte';
  import ClusterNamespaceColumn from '/@/lib/ClusterNamespaceColumn.svelte';
  import ClusterVersionColumn from '/@/lib/ClusterVersionColumn.svelte';
  import ConsoleActions from '/@/lib/ConsoleActions.svelte';
  import NavPage from '/@/lib/upstream/NavPage.svelte';
  import type {StreamshubConsoleInfo} from '/@shared/src/models/streamshub';
  import {Table, TableColumn, TableRow} from '@podman-desktop/ui-svelte';
  import {onMount} from 'svelte';

  export let project: string;
let consoleObj: StreamshubConsoleInfo | undefined = undefined;
let clusters: ClusterListColumn[] | undefined = undefined;

type ClusterListColumn = ClusterList & {
  selected: boolean;
  project: string;
};

onMount(async () => {
  const consoles = await streamshubClient.listConsoles();
  consoleObj = consoles.find(c => c.project === project);
  console.log({ project, consoles, object: consoleObj });
  clusters = (await getKafkaClusters()).map(c => ({ ...c, selected: false, project }));
});

async function getKafkaClusters(): Promise<ClusterList[]> {
  const sp = new URLSearchParams({
    'fields[kafkas]': 'name,namespace,kafkaVersion',
    sort: 'name',
  });
  const kafkaClustersQuery = sp.toString();
  const url = `${consoleObj!.api.baseUrl}/api/kafkas?${kafkaClustersQuery}`;
  try {
    const res = await fetch(url);
    const rawData = await res.json();
    console.log('getKafkaClusters', rawData);
    return ClustersResponseSchema.parse(rawData).data;
  } catch (err) {
    console.error('getKafkaClusters', err);
    return [];
  }
}

let selectedItemsNumber: number;
let table: Table;

let nameColumn = new TableColumn<ClusterList>('Cluster', {
  renderer: ClusterNameColumn,
  comparator: (a, b) => a.attributes.name.localeCompare(b.attributes.name),
});

let namespaceColumn = new TableColumn<ClusterList>('Kubernetes namespace', {
  renderer: ClusterNamespaceColumn,
  comparator: (a, b) => a.attributes.namespace.localeCompare(b.attributes.namespace),
});

let versionColumn = new TableColumn<ClusterList>('Kafka version', {
  renderer: ClusterVersionColumn,
  comparator: (a, b) => a.attributes.namespace.localeCompare(b.attributes.namespace),
});

const columns: TableColumn<ClusterList, ClusterList | string>[] = [nameColumn, namespaceColumn, versionColumn];

const row = new TableRow<ClusterList>({});
</script>

<NavPage
  lastPage="{{ name: 'Streamshub', path: '/' }}"
  loading="{clusters === undefined}"
  searchEnabled="{false}"
  title="{consoleObj?.project ?? ''}">
  <svelte:fragment slot="additional-actions">
    {#if consoleObj}
      <ConsoleActions object="{consoleObj}" showManagedActions="{false}" />
    {/if}
  </svelte:fragment>

  <div class="flex min-w-full h-full py-5" slot="content">
    {#if clusters}
      <Table
        bind:this="{table}"
        columns="{columns}"
        data="{clusters}"
        defaultSortColumn="Name"
        kind="Running clusters"
        on:update="{() => (clusters = clusters)}"
        row="{row}">
      </Table>

      {#if clusters.length === 0}
        No clusters.
      {/if}
    {/if}
  </div>
</NavPage>
