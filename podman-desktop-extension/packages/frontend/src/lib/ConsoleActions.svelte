<script lang="ts">
  import type {StreamshubConsoleInfo} from '/@shared/src/models/streamshub';
  import {faDisplay, faExternalLink, faPlay, faStop, faTrash} from '@fortawesome/free-solid-svg-icons';
  import {router} from 'tinro';
  import {streamshubClient} from '../api/client';
  import ListItemButtonIcon from './upstream/ListItemButtonIcon.svelte';

  export let object: StreamshubConsoleInfo;
  export let showManagedActions = true;

  // Delete the build
  async function openEmbeddedConsole(): Promise<void> {
    router.goto(`/console/${object.project}/embedded`);
  }

  async function openConsole(): Promise<void> {
    await streamshubClient.openLink(`http://localhost:${object.ui.ports.find(p => p.PublicPort)?.PublicPort}`);
  }

  async function startConsole(): Promise<void> {
    await streamshubClient.startConsole(object.project);
  }

  async function stopConsole(): Promise<void> {
    await streamshubClient.stopConsole(object.project);
  }

  async function deleteConsole(): Promise<void> {
    await streamshubClient.deleteConsole(object.project);
  }
</script>

<ListItemButtonIcon enabled={object.ui.status === 'running' && object.api.status === 'running'} icon="{faDisplay}"
                    onClick="{() => openEmbeddedConsole()}"
                    title="Open console"
/>
<ListItemButtonIcon enabled={object.ui.status === 'running' && object.api.status === 'running'} icon="{faExternalLink}"
                    onClick="{() => openConsole()}"
                    title="Open console in an external browser"
/>
{#if object.managed && showManagedActions}
  {#if object.api.status === 'running'}
    <ListItemButtonIcon icon="{faStop}" onClick="{() => stopConsole()}"
                        title="Stop console"
    />
  {:else}
    <ListItemButtonIcon icon="{faPlay}" onClick="{() => startConsole()}"
                        title="Start console"
                        enabled={object.api.status === 'exited'}
    />
  {/if}
  <ListItemButtonIcon icon="{faTrash}" onClick="{() => deleteConsole()}"
                      title="Open console" />
{/if}
