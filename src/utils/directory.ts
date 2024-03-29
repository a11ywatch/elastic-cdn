import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

export function ensureDirectoryExistence(filePath: string) {
  const directory = dirname(filePath);

  try {
    if (existsSync(directory)) {
      return true;
    }
    mkdirSync(directory, { recursive: true });
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

//todo: refactor
export function directoryExist(cdnFileName: string) {
  const existDir = ensureDirectoryExistence(cdnFileName);

  if (existDir) {
    return true;
  } else {
    return ensureDirectoryExistence(cdnFileName);
  }
}
