<script lang="ts">
  import type {StreamshubConsoleInfo} from '/@shared/src/models/streamshub';
  import Link from './Link.svelte';

  export let object: StreamshubConsoleInfo;

</script>

<div class="text-sm">
  {#if object.api.status === 'running' && object.api.ports.filter(p => p.PublicPort !== undefined).length > 0}
    <Link internalRef="/console/{object.project}">
      {object.project}
    </Link>
  {:else}
    {object.project}
  {/if}
</div>
