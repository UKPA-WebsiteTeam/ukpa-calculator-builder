<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// includes all the files needed for the plugin to work
require_once plugin_dir_path(__FILE__) . 'register_menu.php';

add_action('admin_menu', 'ukpa_calculator_add_main_menu', 10);