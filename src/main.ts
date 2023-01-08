import { readdirSync } from "fs";
import { join } from "path";

function getKeys(object: any) {
  function iter(o: any, p: any[]) {
    if (Array.isArray(o)) {
      return;
    }
    if (o && typeof o === "object") {
      var keys = Object.keys(o);
      if (keys.length) {
        keys.forEach(function (k) {
          iter(o[k], p.concat(k));
        });
      }
      return;
    }
    result.push(p.join("."));
  }
  let result: any[] = [];
  iter(object, []);
  return result;
}

function main(path: string) {
  getFilesFromDirectory(path);
}

function getFilesFromDirectory(path: string) {
  const files: string[] = [];
  const filesWithProperties: { fileName: string; keys: string[] }[] = [];

  const dir = readdirSync(path, { withFileTypes: true });

  const folders = dir.filter((dirent) => dirent.isDirectory());

  folders.forEach((folder) => {
    const folderFiles = readdirSync(join(path, folder.name));

    files.push(...folderFiles.map((file) => join(path, folder.name, file)));
  });

  for (const filePath of files) {
    const file = require(filePath);

    const fileProperties = {
      fileName: filePath.substring(filePath.lastIndexOf("/")),
      keys: getKeys(file),
    };

    filesWithProperties.push(fileProperties);
  }

  const propertiesMap = new Map<string, string[][]>();
  filesWithProperties.forEach((file) => {
    if (propertiesMap.has(file.fileName)) {
      const oldValue = propertiesMap.get(file.fileName);
      propertiesMap.set(file.fileName, [...oldValue!, file.keys]);
    } else {
      propertiesMap.set(file.fileName, [file.keys]);
    }
  });

  const verifiedFileNames: string[] = [];

  for (const file of filesWithProperties) {
    if (verifiedFileNames.includes(file.fileName)) {
      return;
    }

    const data = propertiesMap.get(file.fileName);

    if (!data) return;

    data.reduce<string | undefined>((acc, value) => {
      if (!acc) {
        acc = value.toString();
      } else {
        console.log("acc", acc);
        console.log("value.toString()", value.toString());
        if (acc !== value.toString()) {
          console.error("Invalid setup");
          process.exit(1);
        }
      }

      return acc;
    }, undefined);

    verifiedFileNames.push(file.fileName);
  }
}

main(join(__dirname, "..", "i18n_bad"));
