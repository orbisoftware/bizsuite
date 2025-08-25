<?php
namespace App\Service;

use Symfony\Component\Yaml\Yaml;

class AddonManager
{
    private string $addonsDir;

    public function __construct(string $projectDir)
    {
        $this->addonsDir = $projectDir . '/addons';
    }

    public function getAddons(): array
    {
        $addons = [];
        if (!is_dir($this->addonsDir)) return $addons;

        $dirs = scandir($this->addonsDir);
        foreach ($dirs as $dir) {
            if ($dir === '.' || $dir === '..') continue;
            $manifestFile = $this->addonsDir . '/' . $dir . '/manifest.yaml';
            if (!file_exists($manifestFile)) continue;
            $manifest = Yaml::parseFile($manifestFile);
            $manifest['folder'] = $dir;
            $addons[] = $manifest;
        }

        return $addons;
    }
}
