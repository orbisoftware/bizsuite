<?php
// src/Controller/AddonController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use App\Service\AddonManager;

class AddonController extends AbstractController
{
    private AddonManager $addonManager;

    public function __construct(AddonManager $addonManager)
    {
        $this->addonManager = $addonManager;
    }

    // Dashboard with addon list
    public function index(): Response
    {
        $addons = $this->addonManager->getAddons();
        return $this->render('addons/index.html.twig', [
            'addons' => $addons
        ]);
    }

    // Open a specific addon
    public function view(string $addon): Response
    {
        $addons = $this->addonManager->getAddons();
        $addonData = null;

        foreach ($addons as $a) {
            if ($a['folder'] === $addon) {
                $addonData = $a;
                break;
            }
        }

        if (!$addonData) {
            throw $this->createNotFoundException('Addon not found');
        }

        // Render the addon's Twig template
        // Make sure the template path is relative to templates/
        return $this->render('addons/' . $addon . '/' . $addonData['view']);
    }
}
