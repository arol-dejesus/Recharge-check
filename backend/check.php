<?php
// Script de diagnostic — À supprimer après utilisation !
header("Content-Type: text/html; charset=UTF-8");

echo "<h1>🔍 Diagnostic Backend</h1>";

// 1. Version PHP
echo "<h3>1. PHP Version</h3>";
echo "<p>PHP " . phpversion() . "</p>";

// 2. Vérifier le dossier vendor
echo "<h3>2. Dossier vendor/</h3>";
if (is_dir(__DIR__ . '/vendor')) {
    echo "<p style='color:green'>✅ Le dossier vendor/ existe</p>";
    
    // Vérifier autoload
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        echo "<p style='color:green'>✅ vendor/autoload.php existe</p>";
    } else {
        echo "<p style='color:red'>❌ vendor/autoload.php MANQUANT !</p>";
    }
    
    // Vérifier PHPMailer
    if (file_exists(__DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php')) {
        echo "<p style='color:green'>✅ PHPMailer trouvé</p>";
    } else {
        echo "<p style='color:red'>❌ PHPMailer MANQUANT !</p>";
    }
} else {
    echo "<p style='color:red'>❌ Le dossier vendor/ N'EXISTE PAS !</p>";
    echo "<p>C'est la cause de l'erreur 500. Tu dois uploader le dossier vendor/ complet.</p>";
}

// 3. Vérifier send_mail.php
echo "<h3>3. send_mail.php</h3>";
if (file_exists(__DIR__ . '/send_mail.php')) {
    echo "<p style='color:green'>✅ send_mail.php existe</p>";
} else {
    echo "<p style='color:red'>❌ send_mail.php MANQUANT !</p>";
}

// 4. Vérifier les permissions
echo "<h3>4. Permissions</h3>";
echo "<p>Dossier courant : " . __DIR__ . "</p>";
echo "<p>Permissions : " . decoct(fileperms(__DIR__) & 0777) . "</p>";

// 5. Dossier logs
echo "<h3>5. Dossier logs/</h3>";
if (is_dir(__DIR__ . '/logs')) {
    echo "<p style='color:green'>✅ logs/ existe</p>";
    if (is_writable(__DIR__ . '/logs')) {
        echo "<p style='color:green'>✅ logs/ est accessible en écriture</p>";
    } else {
        echo "<p style='color:orange'>⚠️ logs/ n'est PAS accessible en écriture</p>";
    }
} else {
    echo "<p style='color:orange'>⚠️ logs/ n'existe pas (sera créé automatiquement)</p>";
}

// 6. Extensions PHP
echo "<h3>6. Extensions PHP requises</h3>";
$extensions = ['openssl', 'mbstring', 'curl'];
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<p style='color:green'>✅ $ext chargée</p>";
    } else {
        echo "<p style='color:red'>❌ $ext MANQUANTE</p>";
    }
}

// 7. Lister les fichiers du dossier
echo "<h3>7. Contenu du dossier api/</h3>";
echo "<pre>";
$files = scandir(__DIR__);
foreach ($files as $file) {
    $type = is_dir(__DIR__ . '/' . $file) ? '📁' : '📄';
    echo "$type $file\n";
}
echo "</pre>";

echo "<hr><p style='color:red'><strong>⚠️ SUPPRIME ce fichier (check.php) après utilisation !</strong></p>";
?>
