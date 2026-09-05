// Usage: npm run hash-password -- "mon-mot-de-passe"
// Colle le résultat dans AUTH_PASSWORD_HASH (.env).
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "mon-mot-de-passe"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// Next.js fait de l'expansion "$VAR" même dans les valeurs entre guillemets d'un
// .env — on échappe donc chaque "$" pour que le hash colle-copié reste intact.
console.log(hash.replaceAll("$", "\\$"));
