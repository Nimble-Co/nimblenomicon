import type { NimbleJsonId } from './nimble-json-ids';
import { nimbleGameDataById } from './nimble-data-files';

/** Synchronous read of bundled JSON (scripts, tests, build integrations). */
export function readNimbleGameJson(id: NimbleJsonId): unknown {
	return nimbleGameDataById[id];
}
