import inquirer from "inquirer";
import { isMcInstalled, downloadMc } from "./services/mc.service.js";
import { setAlias, createUser } from "./services/minio.service.js";

console.log("=== MinIO User Manager ===");

// 1️⃣ Vérifier mc
if (!isMcInstalled()) {
  const { confirm } = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: "mc n'est pas installé. Voulez-vous le télécharger automatiquement ?",
    default: true
  });

  if (!confirm) {
    console.log("mc est requis pour continuer.");
    process.exit(1);
  }

  await downloadMc();
  console.log("mc téléchargé avec succès ✅");
}

// Créer utilisateur applicatif
const userAnswers = await inquirer.prompt([
  { name: "user", message: "Nom de l'utilisateur applicatif", default: "steve_user" },
  { name: "password", message: "Mot de passe", type: "password", default: "steve_password" },
  { name: "bucket", message: "Nom du bucket à utiliser", default: "app-files" },
]);

// 2️⃣ Exemple simple
await setAlias("myminio", "http://localhost:9000", "minioadmin", "minioadmin123");
await createUser("myminio", "app_user", "StrongPass123!");

console.log("🎉 Utilisateur créé avec succès");


// const { execSync } = require("child_process");
// const inquirer = require("inquirer");
// const fs = require("fs");

// async function main() {
//   console.log("=== MinIO User Manager ===");

//   // Vérifier si mc est installé
//   try {
//     execSync("mc --version", { stdio: "ignore" });
//   } catch {
//     const { installMc } = await inquirer.prompt({
//       type: "confirm",
//       name: "installMc",
//       message: "MinIO Client (mc) n'est pas installé. Voulez-vous l'installer maintenant ?",
//       default: true,
//     });
//     if (installMc) {
//       console.log("Téléchargement et installation de mc...");
//       console.log("Installation automatique non implémentée dans cet exemple.");
//       process.exit();
//     } else {
//       console.log("Impossible de continuer sans mc.");
//       process.exit();
//     }
//   }

//   // Configurer l'alias
//   const aliasAnswers = await inquirer.prompt([
//     { name: "alias", message: "Nom de l'alias pour MinIO", default: "myminio" },
//     { name: "endpoint", message: "Endpoint MinIO", default: "http://localhost:9000" },
//     { name: "rootUser", message: "Root User" },
//     { name: "rootPassword", message: "Root Password", type: "password" },
//   ]);

//   execSync(`mc alias set ${aliasAnswers.alias} ${aliasAnswers.endpoint} ${aliasAnswers.rootUser} ${aliasAnswers.rootPassword}`, { stdio: "inherit" });

//   // Créer utilisateur applicatif
//   const userAnswers = await inquirer.prompt([
//     { name: "user", message: "Nom de l'utilisateur applicatif" },
//     { name: "password", message: "Mot de passe", type: "password" },
//     { name: "bucket", message: "Nom du bucket à utiliser", default: "app-files" },
//   ]);

//   execSync(`mc mb ${aliasAnswers.alias}/${userAnswers.bucket}`, { stdio: "inherit" });
//   execSync(`mc admin user add ${aliasAnswers.alias} ${userAnswers.user} ${userAnswers.password}`, { stdio: "inherit" });

//   // Créer policy JSON
//   const policy = {
//     Version: "2012-10-17",
//     Statement: [
//       {
//         Effect: "Allow",
//         Action: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
//         Resource: [`arn:aws:s3:::${userAnswers.bucket}/*`, `arn:aws:s3:::${userAnswers.bucket}`],
//       },
//     ],
//   };
//   fs.writeFileSync("app-policy.json", JSON.stringify(policy, null, 2));
//   execSync(`mc admin policy add ${aliasAnswers.alias} app-policy app-policy.json`, { stdio: "inherit" });
//   execSync(`mc admin policy set ${aliasAnswers.alias} app-policy user=${userAnswers.user}`, { stdio: "inherit" });

//   console.log("Utilisateur et policy créés avec succès !");
// }

// main();
