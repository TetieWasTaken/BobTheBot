function padTo2Digits(num: string | number) {
  return num.toString().padStart(2, "0");
}
module.exports = {
  convertMS: (milliseconds: number) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;

    return `\`${padTo2Digits(hours)}\` hours, \`${padTo2Digits(minutes)}\` minutes, \`${padTo2Digits(
      seconds
    )}\` seconds`;
  },
};
