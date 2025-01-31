<script lang="ts">
  import Link from '/@/lib/Link.svelte';
  import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
  import { Button, Table, TableColumn, TableRow } from '@podman-desktop/ui-svelte';
  import { router } from 'tinro';

  function createConsole() {
    router.goto('/wizard');
  }
</script>

<div class="flex w-full h-full justify-center items-center">
  <div class="flex flex-col h-full items-center text-center space-y-3">
    <h1 class="text-xl pb-4 text-[var(--pd-content-header)]">Welcome to Streamshub</h1>

    <p class="pb-4 max-w-xl text-[var(--pd-card-header-text)]">
      Streamshub is your entry point to your Apache Kafka&#8482; cluster running on Kubernetes via Strimzi.
    </p>

    <p class="pb-1 max-w-xl text-[var(--pd-card-header-text)]">
      Create your first Streamshub console now.
    </p>

    <Button
      icon="{faPlusCircle}"
      on:click="{createConsole}"
      title="Create console">
      Create a new console
    </Button>

    <p class="pt-8 max-w-xl text-[var(--pd-card-header-text)]">
      Want to learn more about Streamshub? Check out the
      <Link externalRef="https://github.com/streamshub"
      >project documentation
      </Link>&nbsp;.
    </p>
  </div>
</div>
