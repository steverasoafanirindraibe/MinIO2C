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
  rl.question("|==|  Alias MinIO (ex: local) : ", (aliasInput) => {
    const alias = aliasInput.trim() || "local";

    rl.question(
      "|==|  Endpoint (ex: http://localhost:9000) [http://localhost:9000]: ",
      (endpointInput) => {
        let endpoint =
          endpointInput.trim() || "http://localhost:9000";

        // Vérification simple URL
        if (
          !endpoint.startsWith("http://") &&
          !endpoint.startsWith("https://")
        ) {
          console.log("|==|  Endpoint invalide. Ajout automatique de http://");
          endpoint = "http://" + endpoint;
        }

        rl.question("|==|  Access Key (by default: minioadmin): ", (accessInput) => {
          const accessKey = accessInput.trim() || "minioadmin";

          rl.question("|==|  Secret Key (by default: minioadmin): ", (secretInput) => {
            const secretKey = secretInput.trim() || "minioadmin";

            console.log("\n|==|  Configuration alias...");
            runMc(
              `alias set ${alias} ${endpoint} ${accessKey} ${secretKey}`
            );

            callback(alias);
          });
        });
      }
    );
  });
}


// -----------------------------------------------------
// MENU PRINCIPAL
// -----------------------------------------------------

function showMenu(alias) {
  console.log("\n|==============================================================================================|");
  console.log("|========|  MinIO2C MENU  |====================================================================|");
  console.log("|==============================================================================================|");
  console.log("|==|  01 - Voir les utilisateurs                         |=====================================|");
  console.log("|==|  02 - Créer un utilisateur                          |=====================================|");
  console.log("|==|  03 - Supprimer un utilisateur                      |=====================================|");
  console.log("|==|  04 - Créer un bucket                               |=====================================|");
  console.log("|==|  05 - Voir les buckets                              |=====================================|");
  console.log("|==|  06 - Créer une policy                              |=====================================|");
  console.log("|==|  07 - Lister toutes les policies                    |=====================================|");
  console.log("|==|  08 - Attacher une policy à un user                 |=====================================|");
  console.log("|==|  09 - Détacher une policy d’un utilisateur          |=====================================|");
  console.log("|==|  10 - Voir les policies d’un utilisateur            |=====================================|");
  console.log("|==|  11 - Voir le détail d'une policy                   |=====================================|");
  console.log("|==|  12 - Supprimer une policy                          |=====================================|");
  console.log("|==|  13 - Supprimer un bucket                           |=====================================|");
  console.log("|==|  14 - Supprimer un bucket (force - dangereux)       |=====================================|");
  console.log("|==|  15 - Supprimer définitivement un utilisateur       |=====================================|");
  console.log("|==|  16 - Quitter                                       |=====================================|");

  rl.question("|==|  Choix: ", (choice) => {
    switch (choice) {
      case "01":
        runMc(`admin user list ${alias}`);
        showMenu(alias);
        return;

      case "02":
        rl.question("|==|  Nom utilisateur (ex: Steve): ", (user) => {
          rl.question("|==|  Mot de passe: ", (pass) => {
            runMc(`admin user add ${alias} ${user} ${pass}`);
            showMenu(alias);
          });
        });
        return;

      case "03":
        rl.question("|==|  Nom utilisateur à supprimer: ", (user) => {
          runMc(`admin user remove ${alias} ${user}`);
          showMenu(alias);
        });
        return;

      case "04":
        rl.question("|==|  Nom du bucket (ex: my-bucket): ", (bucket) => {
          runMc(`mb ${alias}/${bucket}`);
          showMenu(alias);
        });
        return;

      case "05":
        runMc(`ls ${alias}`);
        showMenu(alias);
        return;

      case "06":
        rl.question("\n|==|  Nom policy: ", (policyName) => {
          console.log("|==|  Pour créer cette policy, vous pouvez choisir entre ces fichiers json existants :");
          console.log("|==|  - read-policy.json : policy en lecture seule");
          console.log("|==|  - write-policy.json : policy en écriture seule");
          console.log("|==|  - delete-policy.json : policy en suppression");
          console.log("|==|  - full-policy.json : policy admin (full access)");
          console.log("\n|==|  OU vous pouvez aussi créer votre propre fichier JSON de policy dans le dossier 'policies'.");
          rl.question("\n|==|  Chemin fichier JSON policy (ex: ./policies/read-policy.json): ", (file) => {
            if (!fs.existsSync(file)) {
              console.log("|==|  Fichier introuvable :", file);
              showMenu(alias);
              return;
            }
            runMc(`admin policy create ${alias} ${policyName} ${file}`);
            showMenu(alias);
          });
        });
        return;

      case "07":
        runMc(`admin policy list ${alias}`);
        showMenu(alias);
        return;

      case "08":
        rl.question("|==|  Nom utilisateur: ", (user) => {
          rl.question("|==|  Nom policy: ", (policy) => {
            runMc(`admin policy attach ${alias} ${policy} --user=${user}`);
            showMenu(alias);
          });
        });
        return;

      case "09":
        rl.question("|==|  Nom utilisateur: ", (user) => {
          rl.question("|==|  Nom policy: ", (policy) => {
            runMc(`admin policy detach ${alias} ${policy} --user=${user}`);
            showMenu(alias);
          });
        });
        return;

      case "10":
        rl.question("|==|  Nom utilisateur: ", (user) => {
          runMc(`admin policy entities ${alias} --user ${user}`);
          showMenu(alias);
        });
        return;

      case "11":
        rl.question("|==|  Nom de la policy: ", (policy) => {
          runMc(`admin policy info ${alias} ${policy}`);
          showMenu(alias);
        });
        return;

      case "12":
        rl.question("|==|  Nom de la policy à supprimer: ", (policy) => {
          rl.question("⚠️  Confirmer suppression ? (yes/no): ", (confirm) => {
            if (confirm.toLowerCase() === "yes") {
              runMc(`admin policy remove ${alias} ${policy}`);
            } else {
              console.log("|==|  Suppression annulée.");
            }
            showMenu(alias);
          });
        });
        return;

      case "13":
        rl.question("|==|  Nom du bucket à supprimer: ", (bucket) => {
          rl.question("⚠️  Confirmer suppression ? (yes/no): ", (confirm) => {
            if (confirm.toLowerCase() === "yes") {
              runMc(`rb ${alias}/${bucket}`);
            } else {
              console.log("|==|  Suppression annulée.");
            }
            showMenu(alias);
          });
        });
        return;

      case "14":
        rl.question("|==|  Nom du bucket à supprimer (force): ", (bucket) => {
          console.log("⚠️  Cette action supprimera TOUT le contenu !");
          rl.question("⚠️  Taper DELETE pour confirmer: ", (confirm) => {
            if (confirm === "DELETE") {
              runMc(`rb --force ${alias}/${bucket}`);
            } else {
              console.log("|==|  Suppression annulée.");
            }
            showMenu(alias);
          });
        });
        return;

      case "15":
        rl.question("|==|  Nom utilisateur à supprimer: ", (user) => {

          if (user === "minioadmin") {
            console.log("|==|  Impossible de supprimer le ROOT.");
            showMenu(alias);
            return;
          }

          rl.question("⚠️  Cette action est définitive. Taper DELETE pour confirmer: ", (confirm) => {
            if (confirm === "DELETE") {
              runMc(`admin user remove ${alias} ${user}`);
            } else {
              console.log("|==|  Suppression annulée.");
            }
            showMenu(alias);
          });
        });
        return;

      case "16":
        console.log("|==|  Au revoir 👋");
        rl.close();
        return;

      default:
        console.log("|==|  Choix invalide.");
        showMenu(alias);
        return;
    }
  });
}

// -----------------------------------------------------
// LANCEMENT APPLICATION
// -----------------------------------------------------
console.log("|=============================================================================================|");
console.log("|========================================|  MinIO2C  |========================================|");
console.log("|=============================================================================================|");
console.log("|==|                                                                                       |==|");
console.log("|==|  A simple MinIO management tool. See the README for more information.                 |==|");
console.log("|==|  NB: Please make sure that the MinIO server is installed and running (via Docker or   |==|");
console.log("|==|  standalone) before proceeding with the mc configuration.                             |==|");
console.log("|==|                                                                                       |==|");
console.log("|=============================================================================================|");
console.log("|==|                                                                                       |==|");

// Vérifie si mc.exe existe
if (!fs.existsSync(MC_PATH)) {
  rl.question(
    "|==|  mc.exe n'est pas installé. Voulez-vous le télécharger ? (y/n): ",
    (answer) => {
      if (answer.toLowerCase() === "y") {
        downloadMc(() => {
          configureAlias(showMenu);
        });
      } else {
        console.log("|==|  mc est requis pour continuer.");
        process.exit(1);
      }
    }
  );
} else {
  configureAlias(showMenu);
}
