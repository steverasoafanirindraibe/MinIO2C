#!/usr/bin/env node

/**
 * =====================================================
 * MinIO2C - Gestionnaire MinIO via mc
 * Version stable compatible .exe (pkg)
 * Avec téléchargement automatique de mc.exe
 * =====================================================
 */

const { execSync } = require("child_process");
const readline = require("readline");
const fs = require("fs");
const https = require("https");
const path = require("path");

// -----------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------

// URL officielle mc Windows
const MC_DOWNLOAD_URL =
  "https://dl.min.io/client/mc/release/windows-amd64/mc.exe";

// Chemin où sera stocké mc.exe
const MC_PATH = path.join(process.cwd(), "mc.exe");

// -----------------------------------------------------
// INTERFACE TERMINAL
// -----------------------------------------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// -----------------------------------------------------
// TÉLÉCHARGEMENT DE MC
// -----------------------------------------------------

function downloadMc(callback) {
  console.log("Téléchargement de mc.exe...");
  console.log("Source :", MC_DOWNLOAD_URL);

  const file = fs.createWriteStream(MC_PATH);

  https.get(MC_DOWNLOAD_URL, (response) => {
    if (response.statusCode !== 200) {
      console.log("Erreur téléchargement :", response.statusCode);
      process.exit(1);
    }

    response.pipe(file);

    file.on("finish", () => {
      file.close();
      console.log("mc.exe téléchargé avec succès !");
      callback();
    });
  }).on("error", (err) => {
    console.log("Erreur :", err.message);
    process.exit(1);
  });
}

// -----------------------------------------------------
// EXECUTION COMMANDE MC
// -----------------------------------------------------

function runMc(command) {
  try {
    console.log("\n> mc " + command);
    execSync(`"${MC_PATH}" ${command}`, { stdio: "inherit" });
  } catch (error) {
    console.log("Erreur lors de l'exécution.");
  }
}

// -----------------------------------------------------
// CONFIGURATION ALIAS
// -----------------------------------------------------

function configureAlias(callback) {
  rl.question("Alias MinIO (ex: local): ", (alias) => {
    rl.question("Endpoint (ex: http://localhost:9000): ", (endpoint) => {
      rl.question("Access Key: ", (accessKey) => {
        rl.question("Secret Key: ", (secretKey) => {
          runMc(
            `alias set ${alias} ${endpoint} ${accessKey} ${secretKey}`
          );
          callback(alias);
        });
      });
    });
  });
}

// -----------------------------------------------------
// MENU PRINCIPAL
// -----------------------------------------------------

function showMenu(alias) {
  console.log("\n=== MinIO2C MENU ===");
  console.log("1 - Voir les utilisateurs");
  console.log("2 - Créer un utilisateur");
  console.log("3 - Supprimer un utilisateur");
  console.log("4 - Créer un bucket");
  console.log("5 - Voir les buckets");
  console.log("6 - Créer une policy");
  console.log("7 - Attacher une policy à un user");
  console.log("0 - Quitter");

  rl.question("Choix: ", (choice) => {
    switch (choice) {
      case "1":
        runMc(`admin user list ${alias}`);
        break;

      case "2":
        rl.question("Nom utilisateur: ", (user) => {
          rl.question("Mot de passe: ", (pass) => {
            runMc(`admin user add ${alias} ${user} ${pass}`);
            showMenu(alias);
          });
        });
        return;

      case "3":
        rl.question("Nom utilisateur à supprimer: ", (user) => {
          runMc(`admin user remove ${alias} ${user}`);
          showMenu(alias);
        });
        return;

      case "4":
        rl.question("Nom du bucket: ", (bucket) => {
          runMc(`mb ${alias}/${bucket}`);
          showMenu(alias);
        });
        return;

      case "5":
        runMc(`ls ${alias}`);
        break;

      case "6":
        rl.question("Nom policy: ", (policyName) => {
          rl.question("Chemin fichier JSON policy: ", (file) => {
            runMc(
              `admin policy add ${alias} ${policyName} ${file}`
            );
            showMenu(alias);
          });
        });
        return;

      case "7":
        rl.question("Nom utilisateur: ", (user) => {
          rl.question("Nom policy: ", (policy) => {
            runMc(
              `admin policy attach ${alias} ${policy} --user=${user}`
            );
            showMenu(alias);
          });
        });
        return;

      case "0":
        console.log("Au revoir 👋");
        rl.close();
        return;

      default:
        console.log("Choix invalide.");
    }

    showMenu(alias);
  });
}

// -----------------------------------------------------
// LANCEMENT APPLICATION
// -----------------------------------------------------

console.log("=== MinIO2C ===");

// Vérifie si mc.exe existe
if (!fs.existsSync(MC_PATH)) {
  rl.question(
    "mc.exe n'est pas installé. Voulez-vous le télécharger ? (y/n): ",
    (answer) => {
      if (answer.toLowerCase() === "y") {
        downloadMc(() => {
          configureAlias(showMenu);
        });
      } else {
        console.log("mc est requis pour continuer.");
        process.exit(1);
      }
    }
  );
} else {
  configureAlias(showMenu);
}
