import { readFile, writeFile } from "fs";

const targetFile = "dist/manifest.json";

readFile(targetFile, "utf8", (err, data) => {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(
    `,"content_scripts":[{"matches":["*://*/*"],"js":["devtools.js"]}]`,
    ""
  );

  writeFile(targetFile, result, "utf8", err => {
    if (err) return console.log(err);
  });
});
