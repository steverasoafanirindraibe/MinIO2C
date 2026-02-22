import { run } from "./mc.js";

/**
 * Configure alias MinIO
 */
export function setAlias(alias, endpoint, access, secret) {
  run(`alias set ${alias} ${endpoint} ${access} ${secret}`);
}

/**
 * Voir tous les utilisateurs
 */
export function listUsers(alias) {
  console.log("\n|==|  ")
  run(`admin user list ${alias}`);
}

/**
 * Créer utilisateur
 */
export function createUser(alias, user, pass) {
  console.log("\n|==|  ")
  run(`admin user create ${alias} ${user} ${pass}`);
}

/**
 * Supprimer utilisateur
 */
export function removeUser(alias, user) {
  run(`admin user remove ${alias} ${user}`);
}

/**
 * Voir buckets
 */
export function listBuckets(alias) {
  run(`ls ${alias}`);
}

/**
 * Créer bucket
 */
export function createBucket(alias, bucket) {
  run(`mb ${alias}/${bucket}`);
}

/**
 * Lister policies
 */
export function listPolicies(alias) {
  run(`admin policy list ${alias}`);
}

/**
 * Attacher policy à un user
 */
export function setPolicy(alias, policy, user) {
  run(`admin policy set ${alias} ${policy} user=${user}`);
}
