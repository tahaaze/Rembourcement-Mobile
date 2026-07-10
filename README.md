# Page de demande de remboursement

## Lien public (acces direct)

Double-cliquez sur **`ACCES-PUBLIC.bat`**

Un lien du type `https://xxxx.loca.lt` sera affiche et sauvegarde dans **`LIEN-PUBLIC.txt`**.

Partagez ce lien pour que n'importe qui accede au formulaire.

> Le lien reste actif tant que la fenetre ACCES-PUBLIC.bat est ouverte.
> Votre PC doit rester allume et connecte a internet.

---

## Lien permanent (gratuit, 24h/24)

Pour un lien qui fonctionne **meme quand votre PC est eteint** :

1. Creez un compte sur https://render.com
2. Connectez ce projet a Render (depuis GitHub ou en uploadant le dossier)
3. Ajoutez les variables d'environnement :
   - `RECEIVER_EMAIL` = tahaait015@gmail.com
   - `SMTP_USER` = tahaait015@gmail.com
   - `SMTP_PASS` = votre mot de passe
   - `SMTP_HOST` = smtp.gmail.com
   - `SMTP_PORT` = 587
4. Deployez — vous obtiendrez un lien du type :
   **`https://remboursement.onrender.com`**

Le fichier `render.yaml` est deja pret pour le deploiement.

---

## Demarrage local

Double-cliquez sur **`DEMARRER.bat`** → http://localhost:3000

## Configuration email

Double-cliquez sur **`CONFIGURER-EMAIL.bat`**

## Sauvegarde automatique

Toutes les demandes sont enregistrees dans `data/demandes.json`
