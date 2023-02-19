const fs = require("fs");

const commitMsg = process.argv[2];
const commitMsgRegex =
  /^^((revert: )?(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff]\s)?\s*(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(.+.+)?(!)?: .{1,72}|Merge branch.*)/;

const importantCommitMsgRegex =
  /^(revert: )?(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff]\s)?\s*(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(.+.+)?!: .{1,72}/;

let output = "Failed";

try {
  if (!commitMsg) {
    output = "Failed";
  } else if (!commitMsg.match(commitMsgRegex)) {
    output = "Invalid";
  } else if (!commitMsg.match(importantCommitMsgRegex)) {
    output = "Not important";
  } else {
    output = "Important";
  }
} catch (e) {
  console.error(e);
}

fs.writeFileSync(process.env.GITHUB_OUTPUT, `commit=${output}`);
console.log(`Successfully wrote ${output} to $GITHUB_OUTPUT`);
