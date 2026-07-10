require('dotenv').config();
const { spawn, exec } = require('child_process');
const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const LINK_FILE = path.join(__dirname, 'LIEN-PUBLIC.txt');

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PUBLIC_MODE: '1' },
});

let tunnelInstance = null;

async function startTunnel() {
  try {
    tunnelInstance = await localtunnel({ port: PORT, subdomain: 'remboursement-mobile' });

    fs.writeFileSync(LINK_FILE, tunnelInstance.url, 'utf8');

    console.log('\n========================================');
    console.log('  LIEN PUBLIC (partagez ce lien) :');
    console.log(`  ${tunnelInstance.url}`);
    console.log('========================================');
    console.log('\nLien sauvegarde dans LIEN-PUBLIC.txt');
    console.log('Le lien reste actif tant que cette fenetre est ouverte.\n');

    if (process.platform === 'win32') {
      exec(`start ${tunnelInstance.url}`);
    }

    tunnelInstance.on('close', () => {
      console.log('\nTunnel ferme. Relancez ACCES-PUBLIC.bat pour un nouveau lien.');
    });
  } catch (err) {
    console.error('\nErreur creation du lien public:', err.message);
    console.error('Verifiez votre connexion internet et relancez ACCES-PUBLIC.bat.\n');
  }
}

setTimeout(startTunnel, 4000);

function cleanup() {
  if (tunnelInstance) tunnelInstance.close();
  server.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server.on('close', (code) => {
  if (tunnelInstance) tunnelInstance.close();
  process.exit(code || 0);
});
