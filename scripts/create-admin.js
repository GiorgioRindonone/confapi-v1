const crypto = require('crypto');
const sql = require('../cms/db');
const { passwordHash } = require('../cms/security');

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1];
  const passArg = args.find(a => a.startsWith('--password='))?.split('=')[1];
  const nameArg = args.find(a => a.startsWith('--name='))?.split('=')[1];
  const isReset = args.includes('--reset');

  const email = (emailArg || process.env.ADMIN_EMAIL || 'redazione@confapi.local').toLowerCase().trim();
  const password = passArg || process.env.ADMIN_PASSWORD || 'ff6RDTgh3fVOXahLHEgeWC5Z';
  const name = nameArg || process.env.ADMIN_NAME || 'Responsabile redazione';

  if (!email || password.length < 8) {
    console.error('Errore: Specificare una password valida (almeno 8 caratteri).');
    process.exit(1);
  }

  const existing = sql.get('SELECT id FROM users WHERE email=?', email);
  const hash = await passwordHash(password);

  if (existing) {
    if (!isReset && !emailArg && !passArg) {
      console.log(`L'account amministratore ${email} esiste già nel database.`);
      console.log('Per reimpostare la password usa: node scripts/create-admin.js --reset --password=NUOVA_PASSWORD');
      return;
    }
    sql.run('UPDATE users SET password_hash=?, role=?, name=? WHERE id=?', hash, 'admin', name, existing.id);
    sql.run('DELETE FROM sessions WHERE user_id=?', existing.id);
    console.log(`✅ Password per l'amministratore ${email} aggiornata con successo!`);
  } else {
    const id = crypto.randomUUID();
    sql.run(
      'INSERT INTO users(id, email, name, password_hash, role, created_at) VALUES(?, ?, ?, ?, ?, ?)',
      id,
      email,
      name,
      hash,
      'admin',
      new Date().toISOString()
    );
    console.log(`✅ Nuovo account amministratore creato con successo: ${email}`);
  }

  console.log(`----------------------------------------`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Ruolo:    admin`);
  console.log(`----------------------------------------`);
}

main().catch(err => {
  console.error('Errore durante la configurazione dell\'amministratore:', err);
  process.exit(1);
});
