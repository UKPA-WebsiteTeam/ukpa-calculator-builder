<?php 

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function ukpa_calculator_add_main_menu() {
    add_menu_page(
        'Calculator Builder',
        'Calculator Builder',
        'manage_options',
        'ukpa-calculator-builder',
        'ukpa_calculator_list_page',
        'dashicons-calculator',
        35
    );

    add_submenu_page(
        'ukpa-calculator-builder',
        'All Calculators',
        'All Calculators',
        'manage_options',
        'ukpa-calculator-builder',
        'ukpa_calculator_list_page'
    );

    add_submenu_page(
        'ukpa-calculator-builder',
        'Add New Calculator',
        'Add New Calculator',
        'manage_options',
        'ukpa-calculator-add-new',
        'ukpa_calculator_add_new_page'
    );

    add_submenu_page(
        'ukpa-calculator-builder',
        'Calculator Settings',
        'Settings',
        'manage_options',
        'ukpa-calculator-settings',
        'ukpa_calculator_settings_page'
    );
}