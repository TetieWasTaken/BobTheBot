const commitMsg = process.argv[2];
const commitMsgRegex =
  /^(revert: )?(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff]\s)?\s*(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(.+.+)?(!)?: .{1,72}/;

const importantCommitMsgRegex =
  /^(revert: )?(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff]\s)?\s*(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(.+.+)?!: .{1,72}/;

try {
  if (!commitMsg) {
    return console.log("Failed");
  } else if (!commitMsg.match(commitMsgRegex)) {
    return console.log("Invalid");
  } else if (!commitMsg.match(importantCommitMsgRegex)) {
    return console.log("Not important");
  } else {
    return console.log("Important");
  }
} catch (e) {
  console.log("Failed");
}
