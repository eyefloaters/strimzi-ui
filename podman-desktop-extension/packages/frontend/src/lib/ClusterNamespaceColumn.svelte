<script lang="ts">
  import type { ClusterList } from '/@/api/api-kafka';
  import Link from './Link.svelte';

  export let object: ClusterList;

</script>

<div class="text-sm">
    {object.attributes.namespace}
</div>
