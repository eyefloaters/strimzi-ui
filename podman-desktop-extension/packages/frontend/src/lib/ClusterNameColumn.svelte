<script lang="ts">
  import type {ClusterList} from '/@/api/api-kafka';
  import Link from './Link.svelte';

  export let object: ClusterListColumn;

  type ClusterListColumn = ClusterList & {
    selected: boolean;
    project: string;
  }

  console.log('ClusterNameColumn', object);
</script>

<div class="text-sm">
  <Link internalRef="/console/{object.project}/cluster/{object.attributes.name}/{object.id}">
    {object.attributes.name}
  </Link>
</div>
