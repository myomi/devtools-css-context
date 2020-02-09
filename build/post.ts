import { readFile, writeFile, createWriteStream } from "fs";
import * as archiver from "archiver";

const targetFile = "dist/manifest.json";

/*
 * I am waiting for fix of https://github.com/kevincharm/parcel-plugin-web-extension/issues/39
 */
readFile(targetFile, "utf8", (err, data) => {
  if (err) {
    return console.error(err);
  }
  var result = data.replace(
    `,"content_scripts":[{"matches":["*://*/*"],"js":["devtools.js"]}]`,
    ""
  );

  writeFile(targetFile, result, "utf8", err => {
    if (err) return console.error(err);
  });
});

/*
 * zip dist directory for deploy
 */
const archive = archiver.create("zip");
const output = createWriteStream("dist.zip");

archive.on("error", (err) => {
  console.error(err);
});

archive.pipe(output);
archive.directory('dist', false);
archive.finalize();