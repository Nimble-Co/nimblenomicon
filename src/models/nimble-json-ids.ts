/**
 * Stable ids for `nimbleGameData` content entries (one per JSON file under
 * `src/data/`). Derived from the same glob-backed map as `nimbleGameDataById`.
 */
export { NIMBLE_JSON_IDS } from './nimble-data-files';

/** Dataset slug matching a file stem under `src/data/`. */
export type NimbleJsonId = string;
