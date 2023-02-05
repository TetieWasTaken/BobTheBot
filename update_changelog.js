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

if (
  !commitMsg.match(
    /^(revert: )?(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff]\s)?\s*(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(.+.+)?: .{1,72}/
  )
)
  return console.error(
    "Commit message does not match conventional commit format"
  );

const changelog = fs.readFileSync("CHANGELOG.md", "utf8");

// Get everything inbetween <!--Changelog start--> and <!--Changelog end-->
const changelogContent = changelog.match(
  /<!--Changelog start-->([\s\S]*)<!--Changelog end-->/m
)[1];

// Get the first line of the commit message
let commitTitle = commitMsg.match(
  /^(revert: )?(\u00a9\s|\u00ae\s|[\u2000-\u3300]\s|\ud83c[\ud000-\udfff]\s|\ud83d[\ud000-\udfff]\s|\ud83e[\ud000-\udfff]\s)?\s*(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)/
);

commitTitle = commitTitle[0].toUpperCase();

// Get the commit description
commitDescription = commitDescription.trim();

// Get the files added
filesAdded = filesAdded.trim().split(" ");

// Get the files deleted
filesDeleted = filesDeleted.trim().split(" ");

// Get the files modified
filesModified = filesModified.trim().split(" ");

// Get the files renamed
filesRenamed = filesRenamed.trim().split(" ");

console.log(filesRenamed);

// Get the date
const date = new Date().toISOString().split("T")[0];

// Create the new changelog entry
const newChangelogEntry = `
### [ ${commitTitle} ] (${date})

${commitMsg}

${
  filesAdded[0].length > 0
    ? `**File(s) added:** \`${filesAdded
        .map((file) => `\`${file}\``)
        .join(", ")}\``
    : ""
}
${
  filesDeleted[0].length > 0
    ? `**File(s) deleted:** \`${filesDeleted
        .map((file) => `\`${file}\``)
        .join(", ")}\``
    : ""
}
${
  filesModified[0].length > 0
    ? `**File(s) modified:** ${filesModified
        .map((file) => `\`${file}\``)
        .join(", ")}`
    : ""
}

${
  filesRenamed[0].length > 0
    ? `**File(s) renamed:** \`${filesRenamed
        .map((file) => `\`${file}\``)
        .join(", ")}\``
    : ""
}
`;

// Create the new changelog
const newChangelog = changelog.replace(
  /<!--Changelog start-->([\s\S]*)<!--Changelog end-->/m,
  `<!--Changelog start-->
${newChangelogEntry}
${changelogContent}
<!--Changelog end-->`
);

// Write the new changelog to the file

fs.writeFileSync("CHANGELOG.md", newChangelog);
