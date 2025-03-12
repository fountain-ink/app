/**
 * Checks if a string is a valid EVM address.
 * @param address The string to check
 * @returns true if the string is a valid EVM address, false otherwise
 */
export function isEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
