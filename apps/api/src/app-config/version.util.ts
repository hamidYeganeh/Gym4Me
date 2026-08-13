/** Compare SemVer-like app versions while ignoring prerelease/build labels. */
export function compareAppVersions(left: string, right: string): number {
  const a = parseVersion(left);
  const b = parseVersion(right);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function parseVersion(value: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value);
  if (!match) return [0, 0, 0];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** FNV-1a yields a stable rollout bucket without storing device identifiers. */
export function rolloutBucket(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 100;
}

