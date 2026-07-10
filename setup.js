const fs = require('fs');
const readline = require('readline');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const args = process.argv.slice(2);
const autoMode = args.includes('--auto');

if (fs.existsSync(envPath) && !args.includes('--force')) {
  console.log('Configuration deja presente.');
  process.exit(0);
}

if (autoMode) {
  fs.writeFileSync(envPath, 'PORT=3000\n', 'utf8');
  console.log('Configuration par defaut creee (email: lancez CONFIGURER-EMAIL.bat)');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('\n=== Configuration email ===\n');
  console.log('Appuyez sur Entree sans rien ecrire pour passer cette etape.\n');

  const email = await ask('Votre email (qui recevra les demandes) : ');
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    fs.writeFileSync(envPath, 'PORT=3000\n', 'utf8');
    console.log('\nEmail ignore. Les demandes seront sauvegardees dans data/demandes.json');
    console.log('Pour configurer l\'email plus tard : double-cliquez CONFIGURER-EMAIL.bat\n');
    rl.close();
    return;
  }

  const smtpPass = await ask('Mot de passe application Gmail : ');

  const content = `PORT=3000
RECEIVER_EMAIL=${trimmedEmail}
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${trimmedEmail}
SMTP_PASS=${smtpPass.trim()}
`;

  fs.writeFileSync(envPath, content, 'utf8');
  console.log('\nEmail configure avec succes !\n');
  rl.close();
}

main().catch(console.error);
