<script lang="ts">
  import type {TopicList} from '/@/api/api-topics';

  type TopicListColumn = TopicList & { selected: boolean, cluster: string, project: string }
  export let object: TopicListColumn;

</script>

<div class="text-sm">
<!--  <Link internalRef="/console/{object.project}/cluster/{object.cluster}/topics/{object.id}">-->
    {object.attributes.name}
<!--  </Link>-->
</div>
