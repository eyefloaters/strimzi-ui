<script lang="ts">
  import type {StreamshubConsoleInfo} from '/@shared/src/models/streamshub';

  export let object: StreamshubConsoleInfo;

</script>

<div class="text-sm">
  {object.ui.status}
</div>
