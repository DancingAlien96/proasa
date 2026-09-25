// Crea o actualiza un usuario administrador.
// Uso interactivo:  npm run admin:create
// Sin preguntas:    ADMIN_EMAIL=... ADMIN_NAME=... ADMIN_PASSWORD=... npm run admin:create
import readline from 'node:readline';
import pg from 'pg';
import { hashPassword } from '../src/auth.js';

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Ocultar lo que se escribe
      rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : '*'.repeat(s.length ? 1 : 0));
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

const email = (process.env.ADMIN_EMAIL || (await ask('Correo: '))).toLowerCase();
const name = process.env.ADMIN_NAME || (await ask('Nombre: '));
const password = process.env.ADMIN_PASSWORD || (await ask('Contraseña (mín. 10 caracteres): ', { hidden: true }));

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Correo inválido');
  process.exit(1);
}
if (!name) {
  console.error('El nombre es obligatorio');
  process.exit(1);
}
if (password.length < 10) {
  console.error('La contraseña debe tener al menos 10 caracteres');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(
  `INSERT INTO admin_users (email, name, password_hash) VALUES ($1, $2, $3)
   ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
   RETURNING id, (xmax = 0) AS created`,
  [email, name, hashPassword(password)]
);
await client.end();
console.log(rows[0].created ? `✔ Administrador creado: ${email}` : `✔ Contraseña actualizada: ${email}`);
