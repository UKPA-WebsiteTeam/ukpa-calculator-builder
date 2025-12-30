<?php
/**
 * UKPA Calculator Builder - Iframe Calculator Shortcode
 * 
 * This file handles the [ukpa_calculator] shortcode for embedding
 * external UKPA calculators via iframe.
 * 
 * @package UKPA_Calculator_Builder
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get calculator URL by type
 * 
 * @param string $type Calculator type identifier
 * @return string|null Calculator URL or null if not found
 */
function ukpa_get_calculator_url($type) {
    $calculators = array(
        'cgt' => 'https://apps.ukpa.co.uk/capitalGainsTax',
        'incomeTax' => 'https://apps.ukpa.co.uk/incomeTax',
        'sdlt' => 'https://apps.ukpa.co.uk/sdlt',
        'rentalIncome' => 'https://apps.ukpa.co.uk/rentalIncomeTax',
        'salary' => 'https://apps.ukpa.co.uk/salaryTax',
        'corporation' => 'https://apps.ukpa.co.uk/corporationTax',
        'mortgageRepayment' => 'https://apps.ukpa.co.uk/mortgageRepayment',
        'mortgageInterest' => 'https://apps.ukpa.co.uk/mortgageInterest',
        'cis' => 'https://apps.ukpa.co.uk/constructionIndustryScheme',
        'rentalYield' => 'https://apps.ukpa.co.uk/rentalYield',
        'firstTimeBuyer' => 'https://apps.ukpa.co.uk/firstTimeBuyer',
        'shortTermPropertyLettingsPenalty' => 'https://apps.ukpa.co.uk/shortTermPropertyLettingsPenalty',
        'lpcPenalty' => 'https://apps.ukpa.co.uk/lpcPenalty',
        'capitalAllowance' => 'https://apps.ukpa.co.uk/capitalAllowance',
        'ated' => 'https://apps.ukpa.co.uk/ated',
        'ltt' => 'https://apps.ukpa.co.uk/lttCalculator',
        'lrr' => 'https://apps.ukpa.co.uk/landRemediationRelief',
        'ltv' => 'https://apps.ukpa.co.uk/loanToValue',
        'indVsCorp' => 'https://apps.ukpa.co.uk/individualVsCorporate',
        'mileage' => 'https://apps.ukpa.co.uk/mileageAllowance',
        'buyToLetCompanyTax' => 'https://apps.ukpa.co.uk/buyToLetCompanyTax',
        'multipleDwellingsRelief' => 'https://apps.ukpa.co.uk/multipleDwellingsRelief',
        'corporationFigsFlow' => 'https://apps.ukpa.co.uk/FigsFlow/corporationTax',
        'chargeOutRateUK' => 'https://apps.ukpa.co.uk/FigsFlow/chargeOutRateUK',
        'chargeOutRateUS' => 'https://apps.ukpa.co.uk/FigsFlow/chargeOutRateUS',
        'chargeOutRateAU' => 'https://apps.ukpa.co.uk/FigsFlow/chargeOutRateAU',
        'vatFigsFlow' => 'https://apps.ukpa.co.uk/FigsFlow/vat',
        'exchangeRate' => 'https://apps.ukpa.co.uk/exchangeRate',
        'childBenefit' => 'https://apps.ukpa.co.uk/childBenefit',
        'prr' => 'https://apps.ukpa.co.uk/privateResidenceRelief',
        'inheritance' => 'https://apps.ukpa.co.uk/inheritance',
        'nationalInsurance' => 'https://apps.ukpa.co.uk/nationalInsurance',
        'sideHustle' => 'https://apps.ukpa.co.uk/sideHustle',
        'propertyDevelopment' => 'https://apps.ukpa.co.uk/propertyDevelopment',
        'mansionTax' => 'https://apps.ukpa.co.uk/mansionTax',
    );

    return isset($calculators[$type]) ? $calculators[$type] : null;
}

/**
 * Shortcode to embed a UKPA calculator via iframe
 * 
 * Usage: [ukpa_calculator type="cgt"]
 * 
 * @param array $atts Shortcode attributes
 * @return string HTML output for the iframe
 */
function ukpa_embed_calculator_iframe($atts) {
    // Shortcode attributes
    $atts = shortcode_atts(
        array(
            'type' => '', // Type of calculator
            'height' => '600', // Iframe height in pixels
        ),
        $atts,
        'ukpa_calculator'
    );

    // Get the URL of the specified calculator
    $url = ukpa_get_calculator_url($atts['type']);

    if (!$url) {
        return '<p style="color: red;">Invalid calculator type specified. Please check the calculator type and try again.</p>';
    }

    // Sanitize height attribute
    $height = absint($atts['height']);
    if ($height < 100) {
        $height = 600; // Default minimum height
    }

    // Embed the calculator using an iframe
    return '<iframe class="iframeForReact" src="' . esc_url($url) . '" width="100%" style="border: none; height:' . esc_attr($height) . 'px;"></iframe>';
}

// Register the shortcode
add_shortcode('ukpa_calculator', 'ukpa_embed_calculator_iframe');

