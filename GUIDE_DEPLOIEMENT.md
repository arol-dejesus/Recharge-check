# 🚀 Guide de Déploiement Pas à Pas (Débutant)

## Comment ça marche ?

```
Utilisateur visite ton site
        ↓
  ┌─────────────────┐         requête HTTP          ┌──────────────────┐
  │   NETLIFY        │  ─────────────────────────►  │   HOSTINGER       │
  │   (Frontend)     │                               │   (Backend PHP)   │
  │   React/HTML/CSS │  ◄─────────────────────────  │   send_mail.php   │
  │   ton-site.      │        réponse JSON           │   → envoie email  │
  │   netlify.app     │                               │   ton-domaine.com │
  └─────────────────┘                               └──────────────────┘
```

Le frontend (ce que l'utilisateur voit) est sur Netlify.
Le backend (le code PHP qui envoie les emails) est sur Hostinger.
Quand l'utilisateur clique "Vérifier", le frontend envoie les codes au backend, qui envoie l'email.

---

# PARTIE 1 : Préparer le mot de passe Gmail

Avant tout, il faut créer un "mot de passe d'application" Gmail pour que PHP puisse envoyer des emails.

## Étape 1.1 : Activer la validation en 2 étapes

1. Ouvre https://myaccount.google.com/security
2. Cherche **"Validation en deux étapes"**
3. Si c'est désactivé, clique dessus et suis les instructions pour l'activer
4. Tu auras besoin de ton téléphone pour confirmer

## Étape 1.2 : Créer un mot de passe d'application

1. Va sur https://myaccount.google.com/apppasswords
2. Connecte-toi avec ton compte `aroldejesus@gmail.com`
3. Dans le champ **"Nom de l'application"**, tape : `Recharge Check`
4. Clique sur **"Créer"**
5. Google affiche un code de **16 caractères** (exemple : `abcd efgh ijkl mnop`)
6. **⚠️ COPIE CE CODE ET GARDE-LE** — tu ne pourras plus le revoir !
7. Retire les espaces → ça donne : `abcdefghijklmnop`

---

# PARTIE 2 : Déployer le Backend sur Hostinger

## Étape 2.1 : Se connecter à Hostinger

1. Va sur https://hpanel.hostinger.com
2. Connecte-toi à ton compte Hostinger
3. Sélectionne ton hébergement / domaine

## Étape 2.2 : Créer le dossier pour le backend

1. Dans le panneau Hostinger, clique sur **"Gestionnaire de fichiers"** (File Manager)
2. Tu arrives dans le dossier `public_html/`
3. Crée un **nouveau dossier** appelé `api` :
   - Clique sur "Nouveau dossier" (ou l'icône ➕)
   - Nom : `api`
   - Clique "Créer"

## Étape 2.3 : Uploader les fichiers du backend

Tu dois uploader ces fichiers dans `public_html/api/` :

```
public_html/
└── api/
    ├── .htaccess          ← fichier de sécurité
    ├── composer.json       ← config des dépendances
    ├── send_mail.php       ← le script principal
    └── vendor/             ← le dossier complet (PHPMailer)
        └── ... (tous les sous-dossiers)
```

### Comment faire :

1. Ouvre le dossier `api` que tu viens de créer
2. Clique sur **"Uploader"** (ou "Upload Files")
3. Upload **un par un** ces fichiers depuis ton ordinateur :
   - `backend/.htaccess`
   - `backend/composer.json`
   - `backend/send_mail.php`
4. Pour le dossier `vendor/`, tu dois d'abord le compresser :
   - Sur ton ordinateur, va dans le dossier `Recharge-check/backend/`
   - Fais un clic droit sur le dossier `vendor` → **"Compresser"** / **"Créer une archive ZIP"**
   - Upload le fichier `vendor.zip` dans Hostinger
   - Dans Hostinger, clique droit sur `vendor.zip` → **"Extraire"** / **"Extract"**
   - Supprime le fichier `vendor.zip` après extraction
5. Crée aussi un dossier `logs` dans `api/` :
   - Nouveau dossier → `logs`
   - Dans ce dossier `logs/`, crée un fichier `.htaccess` avec le contenu : `Deny from all`

## Étape 2.4 : Configurer le mot de passe Gmail

1. Dans Hostinger File Manager, ouvre `public_html/api/send_mail.php`
2. Clique sur **"Modifier"** (ou "Edit")
3. Trouve la ligne 16 :
   ```php
   $smtpPassword = "VOTRE_MOT_DE_PASSE_APP";
   ```
4. Remplace `VOTRE_MOT_DE_PASSE_APP` par le code de 16 caractères de l'étape 1.2 :
   ```php
   $smtpPassword = "abcdefghijklmnop";
   ```
   (mets TON vrai code, pas celui d'exemple)
5. **Sauvegarde** le fichier

## Étape 2.5 : Tester le backend

1. Ouvre ton navigateur
2. Va sur : `https://ton-domaine-hostinger.com/api/send_mail.php`
3. Tu devrais voir :
   ```json
   { "success": false, "error": "Méthode non autorisée" }
   ```
4. **C'est normal !** Ça veut dire que le backend fonctionne.
   (Il refuse les requêtes GET, il n'accepte que les POST du frontend)

## Étape 2.6 : Note l'URL de ton backend

Écris quelque part l'URL de ton backend, par exemple :

- `https://ton-domaine.com/api` (si tu as un domaine)
- `https://ton-sous-domaine.hostinger.com/api` (si tu utilises un sous-domaine Hostinger)

**Important** : l'URL doit être SANS `/send_mail.php` à la fin !

---

# PARTIE 3 : Déployer le Frontend sur Netlify

## Étape 3.1 : Pousser le code sur GitHub

Ouvre un terminal et tape :

```bash
cd ~/Recharge-check
git push origin main
```

Si on te demande un mot de passe, utilise un token GitHub (pas ton mot de passe).

## Étape 3.2 : Créer un compte Netlify

1. Va sur https://app.netlify.com
2. Clique sur **"Sign up"**
3. Choisis **"Sign up with GitHub"** (c'est le plus simple)
4. Autorise Netlify à accéder à ton GitHub

## Étape 3.3 : Importer le projet

1. Sur le dashboard Netlify, clique sur **"Add new site"** → **"Import an existing project"**
2. Clique sur **"Deploy with GitHub"**
3. Choisis ton compte GitHub
4. Cherche et sélectionne le repo **"Recharge-check"**
5. Netlify te montre les paramètres de build :
   - **Branch to deploy** : `main` ✅
   - **Build command** : `npm run build` ✅ (devrait être pré-rempli grâce au `netlify.toml`)
   - **Publish directory** : `build` ✅
6. **NE CLIQUE PAS ENCORE SUR DEPLOY !**

## Étape 3.4 : Ajouter la variable d'environnement (CRUCIAL)

Avant de déployer, tu dois dire au frontend où trouver le backend :

1. Sur la même page, cherche **"Environment variables"** ou **"Show advanced"**
2. Clique sur **"New variable"**
3. Remplis :
   - **Key** (clé) : `REACT_APP_API_URL`
   - **Value** (valeur) : `https://ton-domaine-hostinger.com/api`
     (l'URL de l'étape 2.6, SANS `/send_mail.php` à la fin)
4. Clique "Add"

**Exemple :**
| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://monsite.com/api` |

## Étape 3.5 : Déployer

1. Clique sur **"Deploy site"**
2. Attends 1-2 minutes que Netlify construise le site
3. Quand c'est fini, Netlify te donne une URL comme :
   `https://random-name-123.netlify.app`
4. **Copie cette URL !** Tu en auras besoin pour l'étape suivante.

---

# PARTIE 4 : Faire communiquer les deux

## Étape 4.1 : Autoriser Netlify dans le backend (CORS)

1. Retourne dans **Hostinger File Manager**
2. Ouvre `public_html/api/send_mail.php`
3. Clique "Modifier"
4. Trouve ces lignes (vers la ligne 28) :
   ```php
   $allowedOrigins = [
       "http://localhost:3000",
       "https://votre-site.netlify.app",  // ← Remplacez par votre vrai domaine Netlify
   ];
   ```
5. Remplace `https://votre-site.netlify.app` par l'URL que Netlify t'a donné :
   ```php
   $allowedOrigins = [
       "http://localhost:3000",
       "https://random-name-123.netlify.app",  // ← Ton VRAI domaine Netlify
   ];
   ```
6. **Sauvegarde** le fichier

## Étape 4.2 : Tester le tout

1. Ouvre ton site Netlify : `https://random-name-123.netlify.app`
2. Remplis un code de test (ex: ABCDE-FGHIJ-KLMNO)
3. Mets un montant (ex: 50)
4. Clique **"Vérifier"**
5. Le popup de vérification s'affiche (15 secondes)
6. Vérifie ta boîte email `aroldejesus@gmail.com` → tu devrais recevoir l'email !

---

# PARTIE 5 : Personnaliser le nom du site (optionnel)

## Changer le nom Netlify

1. Sur Netlify → **Site settings** → **Change site name**
2. Tape un nom comme `recharge-check`
3. Ton site sera accessible sur `https://recharge-check.netlify.app`
4. **⚠️ Important** : Si tu changes le nom, retourne dans Hostinger et met à jour le CORS (étape 4.1) avec la nouvelle URL !

## Utiliser un domaine personnalisé

Si tu as un domaine (ex: `recharge-check.fr`), tu peux le configurer :

- Sur **Netlify** : Site settings → Domain management → Add custom domain
- Suis les instructions pour configurer les DNS

---

# ❓ Dépannage

## "L'email n'arrive pas"

- Vérifie que le mot de passe d'application est correct (étape 1.2)
- Vérifie les spams de ta boîte Gmail
- Vérifie les logs sur Hostinger : `public_html/api/logs/`

## "Erreur CORS"

- Vérifie que l'URL Netlify est bien ajoutée dans le CORS (étape 4.1)
- L'URL doit être EXACTE (avec `https://`, sans `/` à la fin)

## "La page est blanche sur Netlify"

- Vérifie que le build a réussi dans Netlify → Deploys → regarde les logs
- Vérifie que la variable `REACT_APP_API_URL` est bien configurée

## "Le backend ne répond pas"

- Vérifie que les fichiers sont bien dans `public_html/api/`
- Vérifie que le dossier `vendor/` a bien été extrait
- Teste l'URL `https://ton-domaine.com/api/send_mail.php` dans le navigateur

---

# 📋 Checklist finale

- [ ] ✅ Mot de passe Gmail d'application créé
- [ ] ✅ Backend uploadé sur Hostinger (`public_html/api/`)
- [ ] ✅ Mot de passe configuré dans `send_mail.php`
- [ ] ✅ Code poussé sur GitHub (`git push`)
- [ ] ✅ Site importé dans Netlify
- [ ] ✅ Variable `REACT_APP_API_URL` ajoutée dans Netlify
- [ ] ✅ URL Netlify ajoutée dans le CORS du backend (Hostinger)
- [ ] ✅ Test : email reçu après clic "Vérifier" ✉️
