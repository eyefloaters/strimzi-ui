import type { ConsoleCompose, ConsoleConfig } from '/@shared/src/models/streamshub';
import * as extensionApi from '@podman-desktop/api';
import crypto from 'crypto';
import yaml from 'js-yaml';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const CONSOLE_API_IMAGE = 'streamshub/console-api:latest';
const CONSOLE_UI_IMAGE = 'streamshub/console-ui:latest';
const COMPOSEYAML = 'compose.yaml';
const CONFIGYAML = 'console-config.yaml';

function getProjectPath(storagePath: string, projectName: string) {
  return path.join(storagePath, projectName);
}

async function isProjectCreated(projectPath: string) {
  console.log('isProjectCreated', { projectPath });
  // Check if the directory exists
  try {
    // Check if the directory exists
    await fs.access(projectPath);

    // List of files to check
    const filesToCheck = [COMPOSEYAML, CONFIGYAML];

    // Check for each file in the directory
    for (const fileName of filesToCheck) {
      const filePath = path.join(projectPath, fileName);
      await fs.access(filePath);
    }

    return true;
  } catch {
    return false;
  }
}

async function createProject(projectPath: string) {
  console.log('createProject', projectPath);
  await fs.mkdir(projectPath, { recursive: true });
}

async function writeConfig(projectPath: string, config: ConsoleConfig) {
  console.log('writeConfig', { projectPath, config });
  const configFile = path.join(projectPath, CONFIGYAML);
  const configObj = {
    kafka: {
      clusters: config.clusters,
    },
  };
  const yamlString = yaml.dump(configObj);
  await fs.writeFile(configFile, yamlString);
}

async function writeCompose(projectPath: string, compose: ConsoleCompose) {
  console.log('writeCompose', { projectPath, compose });
  const composeFile = path.join(projectPath, COMPOSEYAML);
  await fs.writeFile(
    composeFile,
    `---
version: '3.9'

services:
  console-api:
    image: ${compose.consoleApiImage ?? CONSOLE_API_IMAGE}
    ports:
      - :8080
    volumes:
      - ${projectPath}/console-config.yaml:/deployments/console-config.yaml:z
    environment:
      CONSOLE_CONFIG_PATH: /deployments/console-config.yaml
      QUARKUS_KUBERNETES_CLIENT_API_SERVER_URL: ${compose.consoleApiKubernetesApiServerUrl}
      QUARKUS_KUBERNETES_CLIENT_TRUST_CERTS: "true"
      QUARKUS_KUBERNETES_CLIENT_TOKEN: ${compose.consoleApiServiceAccountToken}
    labels:
      io.streamshub.console.container: api

  console-ui:
    image: ${compose.consoleUiImage ?? CONSOLE_UI_IMAGE}
    ports:
      - :3000
    environment:
      CONSOLE_METRICS_PROMETHEUS_URL: ${''}
      NEXTAUTH_SECRET: ${crypto.randomBytes(32).toString('hex')}
      NEXTAUTH_URL: http://localhost:3000
      BACKEND_URL: http://console-api:8080/
    labels:
      io.streamshub.console.container: ui

  console-registry:
    image: quay.io/apicurio/apicurio-registry-mem:2.6.1.Final
    ports:
      - :8080
    labels:
      io.streamshub.console.container: registry
    `,
  );
}

async function composeUp(projectPath: string) {
  console.log('composeUp', { projectPath });
  await extensionApi.process.exec(getPodmanCli(), ['compose', 'up'], {
    cwd: projectPath,
  });
}

async function composeDown(projectPath: string) {
  console.log('composeDown', { projectPath });
  await extensionApi.process.exec(getPodmanCli(), ['compose', 'down'], {
    cwd: projectPath,
  });
}

async function deleteProject(projectPath: string) {
  console.log('deleteProject', { projectPath });
  await fs.rm(projectPath, { recursive: true, force: true });
}

export async function createAndStartConsole(
  storagePath: string,
  projectName: string,
  compose: ConsoleCompose,
  config: ConsoleConfig,
) {
  console.log('createAndStartConsole', { storagePath, projectName, compose, config });
  const projectPath = getProjectPath(storagePath, projectName);
  if ((await isProjectCreated(projectPath)) === false) {
    console.log("Project doesn't exist, creating");
    await createProject(projectPath);
    await writeCompose(projectPath, compose);
    await writeConfig(projectPath, config);
  }
  await composeUp(projectPath);
}

export async function startConsole(storagePath: string, projectName: string) {
  const projectPath = getProjectPath(storagePath, projectName);
  await composeUp(projectPath);
}

export async function stopConsole(storagePath: string, projectName: string) {
  const projectPath = getProjectPath(storagePath, projectName);
  await composeDown(projectPath);
}

export async function stopAndDeleteConsole(storagePath: string, projectName: string) {
  const projectPath = getProjectPath(storagePath, projectName);
  await composeDown(projectPath);
  await deleteProject(projectPath);
}

// Below functions are borrowed from the podman extension
function getPodmanCli(): string {
  const customBinaryPath = getCustomBinaryPath();
  if (customBinaryPath) {
    return customBinaryPath;
  }

  if (isWindows()) {
    return 'podman.exe';
  }
  return 'podman';
}

function getCustomBinaryPath(): string | undefined {
  return extensionApi.configuration.getConfiguration('podman').get('binary.path');
}

const windows = os.platform() === 'win32';

export function isWindows(): boolean {
  return windows;
}

const linux = os.platform() === 'linux';

export function isLinux(): boolean {
  return linux;
}
