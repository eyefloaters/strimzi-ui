<script lang="ts">
  import type { ClusterList } from '/@/api/api-kafka';

  export let object: ClusterList;

</script>

<div class="text-sm">
  {object.attributes.kafkaVersion}
</div>
