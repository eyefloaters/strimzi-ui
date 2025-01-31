<script lang="ts">
  import type { StreamshubConsoleInfo } from '/@shared/src/models/streamshub';
  import ConsoleActions from './ConsoleActions.svelte';

  export let object: StreamshubConsoleInfo;
</script>

<ConsoleActions object="{object}" on:update />
