<script lang="ts">
  import {streamshubClient} from '/@/api/client';
  import NavPage from '/@/lib/upstream/NavPage.svelte';
  import {filtered, searchPattern} from '/@/stores/consolesInfo';
  import type {KubernetesCluster, StreamshubConsoleInfo} from '/@shared/src/models/streamshub';
  import {faCheckCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
  import {Button, EmptyScreen, Spinner} from '@podman-desktop/ui-svelte';
  import {onMount} from 'svelte';
  import {router} from 'tinro';

  let state: 'loading' | 'ready' | 'creating' | 'created' = 'loading';
let projectName: string;
let clusterName: string;
let clusterNamespace: string;
let clusterListener: string;
let clusterBootstrap: string | undefined;
let clusterSaslJaas: string | undefined;
let clusterSaslMechanism: string | undefined;
let clusterSecurityProtocol: string | undefined;
let k8sApi: string;
let k8sToken: string | undefined;
let k8sContext: string | undefined;
let k8sClusters: KubernetesCluster[] = [];

let activeCluster: KubernetesCluster | undefined;

let createdConsole: StreamshubConsoleInfo | undefined;
  $: searchPattern.set(projectName);

function selectCluster(cluster: KubernetesCluster | undefined) {
  if (!cluster) return;
  activeCluster = cluster;
  console.log('parseCluster', { cluster });
  const listener = (cluster.listeners || [])[0];
  console.log('parseCluster', { listener });
  clusterName = cluster.name;
  clusterNamespace = cluster.namespace;
  k8sToken = cluster.token;

  if (listener) {
    clusterListener = listener.name;
    clusterBootstrap = listener.bootstrapServers;
    if (listener.authentication && listener.authentication.type.includes('scram')) {
      if (listener.tls) {
        clusterSecurityProtocol = 'SASL_SSL';
      } else {
        clusterSecurityProtocol = 'SASL_PLAINTEXT';
      }
      clusterSaslMechanism = listener.authentication.type.toUpperCase();
      clusterSaslJaas = cluster.jaasConfigurations[0];
    } else if (listener.authentication && listener.authentication.type.includes('gssapi')) {
      clusterSecurityProtocol = 'SASL_PLAINTEXT';
      clusterSaslMechanism = 'GSSAPI';
      clusterSaslJaas = `com.sun.security.auth.module.Krb5LoginModule required \\
    useKeyTab=true \\
    storeKey=true \\
    useTicketCache=false \\
    keyTab="/etc/security/kafka_server.keytab" \\
    principal="kafka/kafka.example.com@EXAMPLE.COM";`;
    } else if (listener.authentication && listener.authentication.type.includes('oauth')) {
      clusterSecurityProtocol = 'SASL_SSL';
      clusterSaslMechanism = 'OAUTHBEARER';
      clusterSaslJaas = `org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required \\
    oauth.client.bind:value={your-client-id} \\
    oauth.client.secret="your-client-secret" \\
    oauth.token.endpoint.uri="https://your-oauth-provider.com/token";
  `;
    } else if (listener.authentication) {
      if (listener.tls) {
        clusterSecurityProtocol = 'SASL_SSL';
      } else {
        clusterSecurityProtocol = 'SASL_PLAINTEXT';
      }
      clusterSaslMechanism = listener.authentication.type.toUpperCase();
      clusterSaslJaas = cluster.jaasConfigurations[0];
    } else if (listener.tls) {
      clusterSecurityProtocol = 'SSL';
    } else {
      clusterSecurityProtocol = 'PLAINTEXT';
    }
  }
}

onMount(async () => {
  state = 'loading';
  console.log('Wizard on mount');
  try {
    const { context, clusters, server } = await streamshubClient.getKubernetesClusters();
    k8sContext = context;
    k8sClusters = clusters;
    k8sApi = server;

    if (clusters.length > 0) {
      selectCluster(clusters[0]);
    }

    filtered.subscribe(c => {
      console.log("???", {c})
      if (c && state === 'creating') {
        state = 'created';
      }
    });
  } catch {
    k8sClusters = [];
  } finally {
    state = 'ready';
  }
});

function isReady() {
  return projectName && clusterName && clusterNamespace && clusterListener;
}

async function createConsole() {
  if (!isReady()) {
    return;
  }
  state = 'creating';
  await streamshubClient.createConsole(
    projectName,
    {
      consoleApiServiceAccountToken: k8sToken,
      consoleApiKubernetesApiServerUrl: k8sApi,
      // consoleUiImage: 'console-ui:local',
      // consoleApiImage: 'console-api:local',
    },
    {
      clusters: [
        {
          listener: clusterListener,
          name: clusterName,
          namespace: clusterNamespace,
          properties: {
            'bootstrap.servers': clusterBootstrap,
            'sasl.jaas.config': clusterSaslJaas,
            'sasl.mechanism': clusterSaslMechanism,
            'security.protocol': clusterSecurityProtocol,
          },
          producerProperties: {},
          adminProperties: {},
          consumerProperties: {},
        },
      ],
    },
  );
  state = 'created';
}
</script>

<NavPage
  lastPage="{{ name: 'Streamshub', path: '/' }}"
  loading="{state === 'loading'}"
  searchEnabled="{false}"
  title="{'Create a Streamshub console'}">
  <svelte:fragment slot="additional-actions">
    <Button icon="{faPlusCircle}" inProgress="{state === 'creating'}" on:click="{createConsole}" title="Create console">
      Create console
    </Button>
  </svelte:fragment>

  <svelte:fragment slot="content">
    {#if state === 'ready'}
      <form class="flex flex-col w-full">
        <!-- form -->
        <div class="bg-charcoal-800 m-5 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg h-fit">
          <div class="w-full">
            <!-- playground name input -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="projectName">Console name</label>
            <input
              aria-label="Console name"
              bind:value="{projectName}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900 invalid:[&:not(:placeholder-shown):not(:focus)]:text-red-600"
              name="projectName"
              pattern="{'[\\w_\\p{Pd}]{3,}'}"
              placeholder="Use a unique and memorable name"
              required
              type="text" />
          </div>
          <p class="block mt-2 mb-2 text-sm text-gray-600">
            This will be used to create a directory on your filesystem in this extension's storage path.
            <br />
            <br />* It must be a unique name.
            <br />* Name must be at least 3 characters long.
            <br />* Only characters and numbers allowed.
          </p>
        </div>

        <div class="bg-charcoal-800 m-5 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg h-fit">
          <div class="flex flex-row space-x-2 items-center text-[var(--pd-content-card-header-text)]">
            <p class="text-lg font-semibold">Kubernetes connection details</p>
          </div>
          <div class="w-full">
            <!-- kafka name -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="k8sApi">API server url</label>
            <input
              aria-label="Kubernetes API server url"
              bind:value="{k8sApi}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              name="k8sApi"
              required
              type="text" />
          </div>
          <div class="w-full">
            <!-- kafka namespace -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="k8sToken">Service account token</label>
            <input
              aria-label="Kubernetes service account token"
              bind:value="{k8sToken}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              name="k8sToken"
              type="text" />
          </div>
        </div>

        <div class="bg-charcoal-800 m-5 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg h-fit">
          <div class="flex flex-row space-x-2 items-center text-[var(--pd-content-card-header-text)]">
            <p class="text-lg font-semibold">Strimzi CR details</p>
          </div>
          <div class="w-full">
            <!-- kafka name -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="clusterName">Kafka cluster name</label>
            <select
              bind:value="{clusterName}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              id="clusterName"
              name="clusterName"
              on:change="{() => selectCluster(k8sClusters.find(c => c.name === clusterName))}">
              {#each k8sClusters as c}
                <option value="{c.name}">
                  {c.name}
                </option>
              {/each}
            </select>
            <!--          <input-->
            <!--            aria-label="Kafka cluster name"-->
            <!--            bind:value={clusterName}-->
            <!--            class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"-->
            <!--            disabled={submitted}-->
            <!--            name="clusterName"-->
            <!--            required-->
            <!--            type="text" />-->
            <p class="block mt-2 mb-2 text-sm text-gray-600">Name of the Strimzi Kafka CR</p>
          </div>
          <div class="w-full">
            <!-- kafka namespace -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="clusterNamespace"
              >Kafka cluster namespace</label>
            <input
              aria-label="Kafka cluster namespace"
              bind:value="{clusterNamespace}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              name="clusterNamespace"
              required
              type="text" />
            <p class="block mt-2 mb-2 text-sm text-gray-600">Namespace of the Strimzi Kafka CR</p>
          </div>
          <div class="w-full">
            <!-- kafka listener -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="clusterListener">Cluster listener</label>
            <!--          <input-->
            <!--            aria-label="Strimzi cluster listener"-->
            <!--            bind:value={clusterListener}-->
            <!--            class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"-->
            <!--            disabled={submitted}-->
            <!--            name="clusterListener"-->
            <!--            required-->
            <!--            type="text" />-->
            <select
              bind:value="{clusterListener}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              id="clusterListener"
              name="clusterListener">
              {#each activeCluster?.listeners ?? [] as l}
                <option value="{l.name}">
                  {l.name}
                </option>
              {/each}
            </select>
            <p class="block mt-2 mb-2 text-sm text-gray-600">
              Name of the listener to use for connections from the console
            </p>
          </div>
        </div>
        <div class="bg-charcoal-800 m-5 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg h-fit">
          <div class="flex flex-row space-x-2 items-center text-[var(--pd-content-card-header-text)]">
            <p class="text-lg font-semibold">Kafka connection properties (optional)</p>
          </div>
          <div class="w-full">
            <!-- kafka bootstrap -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="clusterBootstrap"
              >Bootstrap urls (comma separated)</label>
            <input
              aria-label="Bootstrap url"
              bind:value="{clusterBootstrap}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              name="clusterBootstrap"
              required
              type="text" />
            <p class="block mt-2 mb-2 text-sm text-gray-600">
              If omitted the bootstrap servers from the Strimzi Kafka CR are used
            </p>
          </div>
          <div class="w-full">
            <!-- kafka properties -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="clusterSecurityProtocol"
              >Security protocol</label>
            <input
              aria-label="Security protocol"
              bind:value="{clusterSecurityProtocol}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              name="clusterSecurityProtocol"
              type="text" />
          </div>
          <div class="w-full">
            <!-- kafka properties -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="clusterSaslMechanism">SASL Mechanism</label>
            <input
              aria-label="SASL mechanism"
              bind:value="{clusterSaslMechanism}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900"
              name="clusterSaslMechanism"
              type="text" />
          </div>
          <div class="w-full">
            <!-- kafka properties -->
            <label class="block mb-2 text-sm font-bold text-gray-400" for="clusterSecurityProtocol"
              >SASL JAAS configuration</label>
            <textarea
              aria-label="SASL JAAS configuration"
              bind:value="{clusterSaslJaas}"
              class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-900 resize rounded-md min-h-[200px]"
              name="clusterSaslJaas"></textarea>
          </div>
        </div>

        <footer class="bg-charcoal-800 m-5 space-y-6 p-8 rounded-lg h-fit">
          <div class="w-full flex flex-col">
            <Button icon="{faPlusCircle}" on:click="{createConsole}" title="Create console">Create console</Button>
          </div>
        </footer>
      </form>
    {:else if state === 'creating'}
      <EmptyScreen icon="{Spinner}" title="Creation in progress" message="Console {projectName} is being created" />
      Creating console...
    {:else if state === 'created'}
      <EmptyScreen icon="{faCheckCircle}" title="Success" message="Console {projectName} created">
          <Button on:click="{() => router.goto(`/console/${projectName}`)}" title="List consoles">Open the console</Button>
      </EmptyScreen>
    {/if}
  </svelte:fragment>
</NavPage>
