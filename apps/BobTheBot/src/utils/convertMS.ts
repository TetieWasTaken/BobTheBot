/**
 * @param num - The number to pad to 2 digits
 * @returns The number padded to 2 digits
 */
function padTo2Digits(num: number | string): string {
  return num.toString().padStart(2, "0");
}

/**
 * @param milliseconds - The number of milliseconds to convert
 * @returns The converted milliseconds in the format of `HH` hours, `MM` minutes, `SS` seconds
 */
export function convertMS(milliseconds: number): string {
  return `\`${padTo2Digits(Math.floor(milliseconds / 3_600_000))}\` hours, \`${padTo2Digits(
    Math.floor((milliseconds / 60_000) % 60)
  )}\` minutes, \`${padTo2Digits(Math.floor((milliseconds / 1_000) % 60))}\` seconds`;
}
