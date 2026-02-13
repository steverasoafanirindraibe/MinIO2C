#!/usr/bin/env node

/**
 * ==========================================
 * MinIO2C - Gestionnaire MinIO via mc
 * Version simple compatible .exe (pkg)
 * ==========================================
 */

const { execSync } = require("child_process");
const readline = require("readline");
const fs = require("fs");

const MC_PATH = "mc.exe"; // mc doit être dans le même dossier que le .exe

// Création interface terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour exécuter mc
function runMc(command) {
  try {
    console.log("\n> mc " + command);
    execSync(`${MC_PATH} ${command}`, { stdio: "inherit" });
  } catch (error) {
    console.log("❌ Erreur lors de l'exécution de la commande.");
  }
}

// Configuration alias
function configureAlias(callback) {
  rl.question("Alias MinIO (ex: local): ", (alias) => {
    rl.question("Endpoint (ex: http://localhost:9000): ", (endpoint) => {
      rl.question("Access Key: ", (accessKey) => {
        rl.question("Secret Key: ", (secretKey) => {
          runMc(`alias set ${alias} ${endpoint} ${accessKey} ${secretKey}`);
          callback(alias);
        });
      });
    });
  });
}

// MENU PRINCIPAL
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
            runMc(`admin policy add ${alias} ${policyName} ${file}`);
            showMenu(alias);
          });
        });
        return;

      case "7":
        rl.question("Nom utilisateur: ", (user) => {
          rl.question("Nom policy: ", (policy) => {
            runMc(`admin policy attach ${alias} ${policy} --user=${user}`);
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

// Lancement
console.log("=== MinIO2C ===");

if (!fs.existsSync(MC_PATH)) {
  console.log("⚠️ mc.exe doit être dans le même dossier que l'exécutable.");
  process.exit(1);
}

configureAlias(showMenu);
