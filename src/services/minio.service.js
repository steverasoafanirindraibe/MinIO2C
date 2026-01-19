import { runMc } from "./mc.service.js";

/**
 * Configure l'alias MinIO
 */
export function setAlias(alias, endpoint, accessKey, secretKey) {
    runMc(`alias set ${alias} ${endpoint} ${accessKey} ${secretKey}`);
}

/**
 * Crée un utilisateur MinIO
 */
export function createUser(alias, user, password) {
  runMc(`admin user add ${alias} ${user} ${password}`);
}

/**
 * Applique une policy à un utilisateur
 */
export function setPolicy(alias, policy, user) {
  runMc(`admin policy set ${alias} ${policy} user=${user}`);
}