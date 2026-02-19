#!/bin/bash
# ═══════════════════════════════════════════════
#  Script de déploiement Recharge-Check
#  Pour hébergement Hostinger (ou tout Apache/PHP)
# ═══════════════════════════════════════════════

set -e

echo "🔨 Build du frontend React..."
npm run build

echo ""
echo "📁 Préparation du dossier de déploiement..."
rm -rf deploy
mkdir -p deploy

# Copier le build React
cp -r build/* deploy/

# Créer le dossier API pour le backend PHP
mkdir -p deploy/api
cp backend/send_mail.php deploy/api/
cp -r backend/vendor deploy/api/
mkdir -p deploy/api/logs

# Protéger le dossier logs
cat > deploy/api/logs/.htaccess << 'EOF'
Deny from all
EOF

# .htaccess racine pour router React (SPA) + API
cat > deploy/.htaccess << 'HTACCESS'
RewriteEngine On

# Ne pas réécrire les fichiers existants (JS, CSS, images, API)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Rediriger toutes les routes vers index.html (React Router)
RewriteRule ^(?!api/)(.*)$ /index.html [L,QSA]
HTACCESS

echo ""
echo "✅ Déploiement prêt dans le dossier ./deploy/"
echo ""
echo "📋 Structure :"
find deploy -type f | head -30 | sed 's/^/   /'
echo ""
echo "═══════════════════════════════════════════════"
echo "  📌 ÉTAPES SUIVANTES :"
echo "═══════════════════════════════════════════════"
echo ""
echo "  1. Ouvre backend/send_mail.php et remplace"
echo "     VOTRE_MOT_DE_PASSE_APP par ton App Password Gmail"
echo ""
echo "  2. Upload le contenu de ./deploy/ dans"
echo "     le dossier public_html de ton Hostinger"
echo ""
echo "  3. C'est tout ! 🚀"
echo ""
