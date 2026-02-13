import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";

const BIN_DIR = path.resolve("bin");
const MC_PATH = path.join(
  BIN_DIR,
  process.platform === "win32" ? "mc.exe" : "mc"
);

/**
 * Vérifie si mc existe déjà dans ./bin
 */
export function mcExists() {
  return fs.existsSync(MC_PATH);
}

/**
 * Télécharge mc depuis le site officiel MinIO
 */
export async function downloadMc() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR);
  }

  const url =
    process.platform === "win32"
      ? "https://dl.min.io/client/mc/release/windows-amd64/mc.exe"
      : "https://dl.min.io/client/mc/release/linux-amd64/mc";

  console.log("Téléchargement de mc...");
  console.log("Source:", url);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(MC_PATH);

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error("Erreur téléchargement mc"));
        return;
      }

      res.pipe(file);

      file.on("finish", () => {
        file.close();

        // Rendre exécutable sous Linux/Mac
        if (process.platform !== "win32") {
          execSync(`chmod +x ${MC_PATH}`);
        }

        resolve();
      });
    }).on("error", reject);
  });
}

/**
 * Exécute une commande mc
 */
export function run(command) {
  execSync(`${MC_PATH} ${command}`, { stdio: "inherit" });
}
