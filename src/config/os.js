import os from "os";

/**
 * Détecte l'OS et l'architecture pour télécharger
 * le bon binaire mc
 */
export function getPlatform() {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === "win32") return "windows-amd64";
  if (platform === "linux") return "linux-amd64";
  if (platform === "darwin") return "darwin-amd64";

  throw new Error("OS non supporté");
}
