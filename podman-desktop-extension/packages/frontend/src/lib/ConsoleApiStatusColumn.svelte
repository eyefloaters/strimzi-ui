<script lang="ts">
  import type {StreamshubConsoleInfo} from '/@shared/src/models/streamshub';
  import Link from './Link.svelte';

  export let object: StreamshubConsoleInfo;

</script>

<div class="text-sm">
  {object.api.status}
</div>
