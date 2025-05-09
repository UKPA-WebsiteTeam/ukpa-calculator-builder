<?php 

require_once plugin_dir_path(__FILE__) . 'export.php';

add_action('admin_init', 'export_calculators', 10);
