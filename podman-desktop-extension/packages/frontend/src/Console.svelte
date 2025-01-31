<script lang="ts">
  import './app.css';
  import {streamshubClient} from '/@/api/client';
  import NavPage from '/@/lib/upstream/NavPage.svelte';
  import type {StreamshubConsoleInfo} from '/@shared/src/models/streamshub';
  import {onMount} from 'svelte';

  export let project: string | undefined = undefined;
  let consoleObj: StreamshubConsoleInfo | undefined = undefined;

  onMount(async () => {
    const consoles = await streamshubClient.listConsoles();
    consoleObj = consoles.find(c => c.project === project);
    console.log({ project, consoles, object: consoleObj });
  });
</script>

<NavPage
  lastPage="{{ name: 'Streamshub', path: '/' }}"
  loading={consoleObj === undefined}
  searchEnabled="{false}"
  title={consoleObj?.project ?? ''}
>
  <svelte:fragment slot="content">
    <iframe class="w-full h-full py-5" src="{consoleObj?.ui.url}"
            title={consoleObj?.project}></iframe>
  </svelte:fragment>

</NavPage>
