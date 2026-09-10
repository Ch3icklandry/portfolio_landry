<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$DATA_FILE = __DIR__ . '/data.json';


$ADMIN_PASSWORD_HASH = '$2y$12$uvTARKWCyNYMTVafi2xYjeerSlyvRpADChMwwxUUqyUSE7ZyWCNKS';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

function sendJson($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function isAuth() {
    return isset($_SESSION['admin']) && $_SESSION['admin'] === true;
}

function requireAuth() {
    if (!isAuth()) sendJson(['error' => 'Non autorisé'], 401);
}

switch ($action) {

    case 'login':
        $body = json_decode(file_get_contents('php://input'), true);
        $password = $body['password'] ?? '';
        global $ADMIN_PASSWORD_HASH;
        if (password_verify($password, $ADMIN_PASSWORD_HASH)) {
            $_SESSION['admin'] = true;
            sendJson(['success' => true]);
        }
        sendJson(['error' => 'Mot de passe incorrect'], 403);
        break;

    case 'logout':
        session_destroy();
        sendJson(['success' => true]);
        break;

    case 'check':
        sendJson(['authenticated' => isAuth()]);
        break;

    case 'get_data':
        if (!file_exists($DATA_FILE)) sendJson(['error' => 'data.json introuvable'], 404);
        sendJson(json_decode(file_get_contents($DATA_FILE), true));
        break;

    case 'save_section':
        requireAuth();
        $body = json_decode(file_get_contents('php://input'), true);
        $section = $body['section'] ?? '';
        $content = $body['content'] ?? null;
        if (!$section || $content === null) sendJson(['error' => 'Paramètres manquants'], 400);

        $data = json_decode(file_get_contents($DATA_FILE), true) ?: [];
        $data[$section] = $content;

        if (file_put_contents($DATA_FILE, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) === false) {
            sendJson(['error' => 'Écriture impossible (vérifie les permissions du dossier)'], 500);
        }
        sendJson(['success' => true]);
        break;

    case 'upload':
        requireAuth();
        if (!isset($_FILES['file'])) sendJson(['error' => 'Aucun fichier envoyé'], 400);

        $target = $_POST['target'] ?? 'certificats'; // 'logo', 'photo', 'certificats'
        $allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExt)) sendJson(['error' => 'Type de fichier non autorisé'], 400);
        if ($file['size'] > 5 * 1024 * 1024) sendJson(['error' => 'Fichier trop volumineux (max 5 Mo)'], 400);
        if ($file['error'] !== UPLOAD_ERR_OK) sendJson(['error' => 'Erreur upload'], 400);

        if ($target === 'logo') {
            $destDir = __DIR__ . '/img/';
            $destName = 'logo.' . $ext;
        } elseif ($target === 'photo') {
            $destDir = __DIR__ . '/img/';
            $destName = 'photo.' . $ext;
        } else {
            $destDir = __DIR__ . '/certificats/';
            $destName = uniqid('cert_') . '.' . $ext;
        }

        if (!is_dir($destDir)) mkdir($destDir, 0755, true);
        $destPath = $destDir . $destName;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            sendJson(['error' => 'Échec de l\'upload'], 500);
        }

        $publicPath = ($target === 'logo' || $target === 'photo') ? 'img/' . $destName : 'certificats/' . $destName;
        sendJson(['success' => true, 'path' => $publicPath]);
        break;

    default:
        sendJson(['error' => 'Action inconnue'], 400);
}