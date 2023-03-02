function padTo2Digits(num: string | number): string {
  return num.toString().padStart(2, "0");
}

export function convertMS(milliseconds: number): string {
  return `\`${padTo2Digits(Math.floor(milliseconds / 3600000))}\` hours, \`${padTo2Digits(
    Math.floor((milliseconds / 60000) % 60)
  )}\` minutes, \`${padTo2Digits(Math.floor((milliseconds / 1000) % 60))}\` seconds`;
}
