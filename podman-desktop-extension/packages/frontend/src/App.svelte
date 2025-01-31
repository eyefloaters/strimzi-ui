<script lang="ts">
  import './app.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import { getRouterState, rpcBrowser, streamshubClient } from '/@/api/client';
  import ConsoleWizard from '/@/ConsoleWizard.svelte';
  import { Messages } from '/@shared/src/messages/Messages';
  import { onMount } from 'svelte';
  import { router } from 'tinro';
  import Cluster from './Clusters.svelte';
  import Console from './Console.svelte';
  import Homepage from './Homepage.svelte';
  import Topics from './Topics.svelte';
  import Route from './lib/Route.svelte';

  router.mode.hash();

  let isMounted = false;

  onMount(() => {
    // Load router state on application startup
    const state = getRouterState();
    console.log('app onMount', state);
    router.goto(state.url);
    isMounted = true;

    return rpcBrowser.subscribe(Messages.MSG_NAVIGATE_CONSOLE, (port: string) => {
      router.goto(`/console/${port}`);
    });
  });

</script>

<Route breadcrumb="Streamshub" isAppMounted="{isMounted}" let:meta path="/*">
  <main class="flex flex-col w-screen h-screen overflow-hidden bg-charcoal-700">
    <div class="flex flex-row w-full h-full overflow-hidden">
      <Route breadcrumb="Streamshub" path="/">
        <Homepage />
      </Route>
      <Route breadcrumb="Console" path="/wizard">
        <ConsoleWizard />
      </Route>
      <Route breadcrumb="Console" let:meta path="/console/:project/cluster/:clusterName/:cluster">
        <Topics cluster="{decodeURIComponent(meta.params.cluster)}"
                clusterName="{decodeURIComponent(meta.params.clusterName)}"
                project="{decodeURIComponent(meta.params.project)}" />
      </Route>
      <Route breadcrumb="Console UI" let:meta path="/console/:project/embedded">
        <Console project="{decodeURIComponent(meta.params.project)}" />
      </Route>
      <Route breadcrumb="Console" let:meta path="/console/:project">
        <Cluster project="{decodeURIComponent(meta.params.project)}" />
      </Route>
    </div>
  </main>
</Route>
