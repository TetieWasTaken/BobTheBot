export function permissionToString(permissionArray: readonly bigint[]) {
  return permissionArray.length >= 1 ? permissionArray.reduce((a, b) => a | b, 0n).toString() : undefined;
}
