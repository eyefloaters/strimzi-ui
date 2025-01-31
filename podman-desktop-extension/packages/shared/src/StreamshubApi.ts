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
 l***********************************************************************/

import type { ConsoleCompose, ConsoleConfig, KubernetesCluster, StreamshubConsoleInfo } from './models/streamshub';

export abstract class StreamshubApi {
  abstract listConsoles(): Promise<StreamshubConsoleInfo[]>;

  abstract openLink(link: string): Promise<void>;

  abstract createConsole(projectName: string, compose: ConsoleCompose, config: ConsoleConfig): Promise<void>;

  abstract startConsole(projectName: string): Promise<void>;

  abstract stopConsole(projectName: string): Promise<void>;

  abstract deleteConsole(projectName: string): Promise<void>;

  abstract getKubernetesClusters(): Promise<{ context: string; clusters: KubernetesCluster[]; server: string }>;

  abstract telemetryLogUsage(eventName: string, data?: Record<string, unknown> | undefined): Promise<void>;

  abstract telemetryLogError(eventName: string, data?: Record<string, unknown> | undefined): Promise<void>;
}
