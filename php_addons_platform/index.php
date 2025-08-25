<?php
// Core dashboard: lists addons by reading manifest.xml in each addon folder

$addonsDir = __DIR__ . '/addons';
$addons = [];

if (is_dir($addonsDir)) {
    $dirs = scandir($addonsDir);
    foreach ($dirs as $dir) {
        if ($dir === '.' || $dir === '..') continue;
        $path = $addonsDir . '/' . $dir;
        if (is_dir($path)) {
            $manifest = $path . '/manifest.xml';
            if (file_exists($manifest)) {
                $xml = simplexml_load_file($manifest);
                $addons[] = [
                    'id' => (string)$xml->id,
                    'name' => (string)$xml->name,
                    'description' => (string)$xml->description,
                    'view' => (string)$xml->view,
                    'folder' => $dir
                ];
            }
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PHP Addons Platform</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .grid { display: flex; flex-wrap: wrap; gap: 12px; }
        .card { border: 1px solid #ccc; padding: 12px; border-radius: 8px; width: 200px; }
        .card button { margin-top: 8px; }
    </style>
</head>
<body>
    <h1>Apps</h1>
    <div class="grid">
        <?php foreach ($addons as $addon): ?>
            <div class="card">
                <strong><?= htmlspecialchars($addon['name']) ?></strong>
                <div style="font-size:12px;color:#555"><?= htmlspecialchars($addon['description']) ?></div>
                <form method="get" action="addons/<?= urlencode($addon['folder']) ?>/<?= urlencode($addon['view']) ?>">
                    <button type="submit">Open</button>
                </form>
            </div>
        <?php endforeach; ?>
        <?php if (empty($addons)): ?>
            <p>No addons installed.</p>
        <?php endif; ?>
    </div>
</body>
</html>
