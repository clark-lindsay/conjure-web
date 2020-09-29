import packageJson from "../package.json";

export function packageVersion() {
  if (packageJson) {
    return packageJson.version;
  } else return "";
}
