import { derived, writable, type Readable } from 'svelte/store';
import { Messages } from '/@shared/src/messages/Messages';
import { streamshubClient } from '/@/api/client';
import type { StreamshubConsoleInfo } from '/@shared/src/models/streamshub';
import { RPCReadable } from '/@/stores/rpcReadable';
import { findMatchInLeaves } from '../lib/upstream/search-util';

export const consolesInfo: Readable<StreamshubConsoleInfo[]> = RPCReadable<StreamshubConsoleInfo[]>(
  [],
  [Messages.MSG_CONTAINERS_UPDATE],
  streamshubClient.listConsoles,
);

// For searching
export const searchPattern = writable('');

export const filtered = derived([searchPattern, consolesInfo], ([$searchPattern, $consolesInfo]) =>
  $consolesInfo.filter(historyInfo => findMatchInLeaves(historyInfo, $searchPattern.toLowerCase())),
);
