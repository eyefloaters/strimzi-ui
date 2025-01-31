<script lang="ts">
  import type {TopicList} from '/@/api/api-topics';

  export let object: TopicList;

</script>

<div class="text-sm">
  {object.attributes.numPartitions}
</div>
