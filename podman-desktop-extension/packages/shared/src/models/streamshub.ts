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

import type { Port } from '@podman-desktop/api';

export interface StreamshubConsoleInfo {
  project: string;
  managed: boolean;
  api: {
    ports: Port[];
    baseUrl: string;
    status: 'running' | 'starting' | 'exited';
  };
  ui: {
    ports: Port[];
    url: string;
    status: 'running' | 'starting' | 'exited';
  };
}

export interface ConsoleCompose {
  consoleApiKubernetesApiServerUrl: string;
  consoleApiServiceAccountToken?: string;
  consoleApiImage?: string;
  consoleUiImage?: string;
}

export interface ConsoleConfig {
  clusters: StrimziCluster[];
}

export interface StrimziCluster {
  name: string;
  namespace: string;
  listener: string;
  properties: StrimziProperties;
  adminProperties: StrimziProperties;
  consumerProperties: StrimziProperties;
  producerProperties: StrimziProperties;
}

export interface StrimziProperties {
  'security.protocol'?: string;
  'sasl.mechanism'?: string;
  'bootstrap.servers'?: string;
  'sasl.jaas.config'?: string;
}

export interface KubernetesCluster {
  name: string;
  namespace: string;
  listeners: {
    authentication?: {
      type: string;
    };
    tls?: boolean;
    bootstrapServers: string;
    name: string;
  }[];
  jaasConfigurations: string[];
  token?: string;
}
