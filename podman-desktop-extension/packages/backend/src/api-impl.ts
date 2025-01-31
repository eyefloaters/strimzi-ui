/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { Messages } from '/@shared/src/messages/Messages';
import type {
  ConsoleCompose,
  ConsoleConfig,
  KubernetesCluster,
  StreamshubConsoleInfo,
} from '/@shared/src/models/streamshub';
import type { StreamshubApi } from '/@shared/src/StreamshubApi';
import * as podmanDesktopApi from '@podman-desktop/api';
import * as fs from 'node:fs/promises';
import { telemetryLogger } from './extension';
import { createAndStartConsole, startConsole, stopAndDeleteConsole, stopConsole } from './utils';

const CONTAINER_LABEL = 'io.streamshub.console.container';

export class StreamshubImpl implements StreamshubApi {
  private webview: podmanDesktopApi.Webview;

  constructor(
    private readonly extensionContext: podmanDesktopApi.ExtensionContext,
    webview: podmanDesktopApi.Webview,
  ) {
    this.webview = webview;
  }

  async listConsoles(): Promise<StreamshubConsoleInfo[]> {
    console.group('listConsoles');
    const consoles: Record<string, StreamshubConsoleInfo> = {};
    const { storagePath } = this.extensionContext;
    try {
      const containers = await podmanDesktopApi.containerEngine.listContainers();

      const consoleContainers = containers.filter(
        container =>
          container.Labels['com.docker.compose.project'] !== undefined &&
          container.Labels[CONTAINER_LABEL] !== undefined,
      );
      consoleContainers.forEach(container => {
        const project = container.Labels['com.docker.compose.project'];
        const workingDir = container.Labels['com.docker.compose.project.working_dir'];
        const c: StreamshubConsoleInfo = consoles[project] ?? {
          project,
          managed: workingDir.startsWith(storagePath),
          api: {
            ports: [],
            baseUrl: '',
          },
          ui: {
            ports: [],
            url: '',
          },
        };
        if (container.Labels[CONTAINER_LABEL] === 'api') {
          c.api.ports = container.Ports;
          c.api.baseUrl = `http://localhost:${c.api.ports.find(p => p.PublicPort)?.PublicPort}`;
          c.api.status =
            container.State === 'running' ? 'running' : container.State === 'exited' ? 'exited' : 'starting';
        }
        if (container.Labels[CONTAINER_LABEL] === 'ui') {
          c.ui.ports = container.Ports;
          c.ui.url = `http://localhost:${c.ui.ports.find(p => p.PublicPort)?.PublicPort}`;
          c.ui.status =
            container.State === 'running' ? 'running' : container.State === 'exited' ? 'exited' : 'starting';
        }
        console.log(c);
        consoles[project] = c;
      });

      try {
        (await fs.readdir(storagePath, { withFileTypes: true }))
          .filter(f => f.isDirectory())
          .forEach(f => {
            const project = f.name;
            if (!consoles[project]) {
              consoles[project] = {
                project,
                managed: true,
                api: {
                  ports: [],
                  baseUrl: '',
                  status: 'exited',
                },
                ui: {
                  ports: [],
                  url: '',
                  status: 'exited',
                },
              };
            }
          });
      } catch {
        console.log('storagePath empty');
      }
      console.log({ containers, consoleContainers, consoles });
    } catch (err) {
      await podmanDesktopApi.window.showErrorMessage(`Error listing containers: ${err}`);
      console.error('Error listing containers: ', err);
    } finally {
      console.groupEnd();
    }
    return Object.values(consoles);
  }

  async openLink(link: string): Promise<void> {
    console.log('openLink', link);
    await podmanDesktopApi.env.openExternal(podmanDesktopApi.Uri.parse(link));
  }

  // Log an event to telemetry
  async telemetryLogUsage(eventName: string, data?: Record<string, unknown>): Promise<void> {
    telemetryLogger.logUsage(eventName, data);
  }

  // Log an error to telemetry
  async telemetryLogError(eventName: string, data?: Record<string, unknown>): Promise<void> {
    telemetryLogger.logError(eventName, data);
  }

  async createConsole(projectName: string, compose: ConsoleCompose, config: ConsoleConfig): Promise<void> {
    const { storagePath } = this.extensionContext;
    console.log('createConsole', { projectName, compose, config, storagePath });
    await createAndStartConsole(storagePath, projectName, compose, config);
  }

  async startConsole(projectName: string): Promise<void> {
    const { storagePath } = this.extensionContext;
    console.log('startConsole', { storagePath, projectName });
    await startConsole(storagePath, projectName);
  }

  async stopConsole(projectName: string): Promise<void> {
    const { storagePath } = this.extensionContext;
    console.log('stopConsole', { storagePath, projectName });
    await stopConsole(storagePath, projectName);
  }

  async deleteConsole(projectName: string): Promise<void> {
    const { storagePath } = this.extensionContext;
    console.log('deleteConsole', { storagePath, projectName });
    await stopAndDeleteConsole(storagePath, projectName);
  }

  async getKubernetesClusters(): Promise<{ context: string; server: string; clusters: KubernetesCluster[] }> {
    console.group('getKubernetesClusters');
    try {
      const { stdout: context } = await podmanDesktopApi.process.exec('kubectl', ['config', 'current-context']);
      console.log('getKubernetesClusters', { context });
      const server = context === 'minikube' ? await getServerFromMinikube() : await getServerFromKubectl();
      console.log('getKubernetesClusters', { server });
      const { stdout: kafkaCRsText } = await podmanDesktopApi.process.exec('kubectl', [
        'get',
        'kafkas.kafka.strimzi.io',
        '--all-namespaces',
        '-o',
        'json',
      ]);
      console.log('getKubernetesClusters', { kafkaCRsText });
      const kafkaCRs = JSON.parse(kafkaCRsText) as {
        items: {
          metadata: {
            name: string;
            namespace: string;
          };
          spec: {
            kafka: {
              listeners: {
                authentication?: {
                  type: string;
                };
                tls: true;
                name: string;
              }[];
            };
          };
          status: {
            listeners: {
              name: string;
              bootstrapServers: string;
            }[];
          };
        }[];
      };
      const clusters = await Promise.all(
        kafkaCRs.items.map<Promise<KubernetesCluster>>(async i => {
          const jaasConfigurations = await getNamespaceJaasConfigurations(i.metadata.namespace);
          const token = await getToken(i.metadata.namespace);
          return {
            name: i.metadata.name,
            namespace: i.metadata.namespace,
            listeners: i.status.listeners.map(l => ({
              ...l,
              ...(i.spec.kafka.listeners.find(sl => l.name === sl.name) ?? {}),
            })),
            jaasConfigurations: jaasConfigurations[i.metadata.name],
            token,
          };
        }),
      );
      console.log('getKubernetesClusters', { clusters });
      return {
        context,
        server,
        clusters,
      };
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      console.groupEnd();
    }
  }

  async containerChanges() {
    console.log('containerChanges');
    return this.notify(Messages.MSG_CONTAINERS_UPDATE);
  }

  // The API does not allow callbacks through the RPC, so instead
  // we send "notify" messages to the frontend to trigger a refresh
  // this method is internal and meant to be used by the API implementation
  protected async notify(msg: string, body?: unknown): Promise<void> {
    await this.webview.postMessage({
      id: msg,
      // Must pass in an empty body to satisfy the type system, if it is undefined, this fails.
      body: body ?? '',
    });
  }
}

async function getServerFromKubectl() {
  const { stdout: serverRaw } = await podmanDesktopApi.process.exec('kubectl', [
    'config',
    'view',
    '--minify',
    '-o',
    "jsonpath='{.clusters[0].cluster.server}'",
  ]);
  return serverRaw.replaceAll("'", '');
}

async function getServerFromMinikube() {
  const { stdout: server } = await podmanDesktopApi.process.exec('minikube', ['ip']);
  return `https://${server}:8443`;
}

async function getToken(namespace: string): Promise<string | undefined> {
  console.group('getToken');
  try {
    const { stdout: tokenRaw } = await podmanDesktopApi.process.exec('kubectl', [
      'describe',
      'secret',
      'default-token',
      '-n',
      namespace,
    ]);

    const lines = tokenRaw.split('\n').filter(line => line.startsWith('token'));

    // Step 2: cut -f2 -d':'
    const fields = lines.map(line => line.split(':')[1]);

    // Step 3: tr -d " "
    return fields.map(field => field.replace(/\s/g, '')).join('\n');
  } catch {
    const { stdout: token } = await podmanDesktopApi.process.exec('kubectl', [
      'create',
      'token',
      'console-server',
      '-n',
      namespace,
      `--duration=${365 * 24}h`,
    ]);
    return token;
  } finally {
    console.groupEnd();
  }
}

async function getNamespaceJaasConfigurations(namespace: string): Promise<Record<string, string[]>> {
  console.group('getNamespaceJaasConfigurations');
  try {
    const { stdout: usersRaw } = await podmanDesktopApi.process.exec('kubectl', [
      'get',
      'kafkausers',
      '-n',
      namespace,
      '-o',
      'json',
    ]);
    const users = JSON.parse(usersRaw) as {
      items: {
        metadata: {
          labels: {
            'strimzi.io/cluster': string;
          };
        };
        status: {
          username: string;
          secret: string;
        };
      }[];
    };
    const usersList = users.items.map(u => u.status.username);
    const { stdout: secretsRaw } = await podmanDesktopApi.process.exec('kubectl', [
      'get',
      'secrets',
      '-n',
      namespace,
      '-o',
      'json',
      ...usersList,
    ]);
    type Secret = {
      data: {
        'sasl.jaas.config': string;
      };
      metadata: {
        name: string;
      };
    };
    type Secrets = {
      items: Secret[];
    };
    const secretsObj = JSON.parse(secretsRaw) as Secrets | Secret;
    const secrets = 'items' in secretsObj ? secretsObj : { items: [secretsObj] };
    console.log('secrets', secrets);
    const jaasConfigurations: Record<string, string[]> = Object.fromEntries(
      users.items.map(u => [
        u.metadata.labels['strimzi.io/cluster'],
        secrets.items.filter(s => s.metadata.name === u.status.secret).map(s => atob(s.data['sasl.jaas.config'])),
      ]),
    );
    return jaasConfigurations;
  } catch (e) {
    console.error('getNamespaceJaasConfigurations', e);
  } finally {
    console.groupEnd();
  }
  return {};
}
