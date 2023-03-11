function padTo2Digits(num: number | string): string {
  return num.toString().padStart(2, "0");
}

export function convertMS(milliseconds: number): string {
  return `\`${padTo2Digits(Math.floor(milliseconds / 3_600_000))}\` hours, \`${padTo2Digits(
    Math.floor((milliseconds / 60_000) % 60)
  )}\` minutes, \`${padTo2Digits(Math.floor((milliseconds / 1_000) % 60))}\` seconds`;
}
