const fs = require("fs");

let commitMsg = process.argv[2];
let commitDescription = process.argv[3] ?? "";
let filesAdded = process.argv[4] ?? "";
let filesDeleted = process.argv[5] ?? "";
let filesModified = process.argv[6] ?? "";
let filesRenamed = process.argv[7] ?? "";

if (!commitMsg) {
  return console.error("No commit message provided");
}

const changelog = fs.readFileSync("./apps/BobTheBot/CHANGELOG.md", "utf8");

const changelogContent = changelog.match(/<!--Changelog start-->([\s\S]*)<!--Changelog end-->/m)[1];
let commitTitle = commitMsg.match(
  /^(revert: )?(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff]\s)?\s*(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)/
);

commitTitle = commitTitle[0].toUpperCase();
commitDescription = commitDescription.trim();
filesAdded = filesAdded.trim().split(" ");
filesDeleted = filesDeleted.trim().split(" ");
filesModified = filesModified.trim().split(" ");
filesRenamed = filesRenamed.trim().split(" ");
const date = new Date().toISOString().split("T")[0];
const newChangelogEntry = `
### [ ${commitTitle} ] (${date})

${commitMsg}

${filesAdded[0].length > 0 ? `**File(s) added:** \`\`${filesAdded.map((file) => `\`${file}\``).join(", ")}\`` : ""}
${filesDeleted[0].length > 0 ? `**File(s) deleted:** \`${filesDeleted.map((file) => `\`${file}\``).join(", ")}\`` : ""}
${
  filesModified[0].length > 0
    ? `**File(s) modified:** \`${filesModified.map((file) => `\`${file}\``).join(", ")}\``
    : ""
}
${filesRenamed[0].length > 0 ? `**File(s) renamed:** \`${filesRenamed.map((file) => `\`${file}\``).join(", ")}\`` : ""}
`;
const newChangelog = changelog.replace(
  /<!--Changelog start-->([\s\S]*)<!--Changelog end-->/m,
  `<!--Changelog start-->
${newChangelogEntry}
${changelogContent}
<!--Changelog end-->`
);

fs.writeFileSync("./apps/BobTheBot/CHANGELOG.md", newChangelog);

return console.log("Changelog updated successfully");
