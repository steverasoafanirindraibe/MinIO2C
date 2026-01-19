import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { getPlatform } from "../config/os.js";

const BIN_DIR = path.resolve("bin");
const MC_PATH = path.join(BIN_DIR, process.platform === "win32" ? "mc.exe" : "mc");

/**
 * Vérifie si mc est déjà disponible
 */
export function isMcInstalled() {
  return fs.existsSync(MC_PATH);
}

/**
 * Télécharge mc depuis le site officiel MinIO
 */
export function downloadMc() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR);
  }

  const platform = getPlatform();
  const url = `https://dl.min.io/client/mc/release/${platform}/mc${
    platform.startsWith("windows") ? ".exe" : ""
  }`;

  console.log("Téléchargement de mc depuis :", url);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(MC_PATH);

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error("Échec du téléchargement de mc"));
        return;
      }

      res.pipe(file);

      file.on("finish", () => {
        file.close();

        // Rendre le fichier exécutable (Linux/macOS)
        if (process.platform !== "win32") {
          execSync(`chmod +x ${MC_PATH}`);
        }

        resolve();
      });
    }).on("error", reject);
  });
}

/**
 * Exécute mc avec les bons paramètres
 */
export function runMc(command) {
  return execSync(`${MC_PATH} ${command}`, { stdio: "inherit" });
}
