<?php
/**
 * Auto Updater for UKPA Calculator Builder
 * Handles checking for updates and downloading them from a custom server
 */

if (!defined('ABSPATH')) exit;

class UKPA_Auto_Updater {
    
    private $plugin_slug;
    private $plugin_file;
    private $plugin_name;
    private $version;
    private $update_url;
    private $license_key;
    
    public function __construct($plugin_file) {
        $this->plugin_file = $plugin_file;
        $this->plugin_slug = 'ukpa-calculator-builder';
        $this->plugin_name = 'UKPA Calculator Builder';
        $this->version = '1.1.4';
        $this->update_url = 'https://ukpacalculator.com/api/plugin-updates';
        $this->license_key = get_option('ukpa_license_key', '');
        
        // Only add filters if we're in the admin area
        if (is_admin()) {
            add_filter('pre_set_site_transient_update_plugins', array($this, 'check_for_updates'));
            add_filter('plugins_api', array($this, 'plugin_info'), 10, 3);
            add_action('upgrader_process_complete', array($this, 'after_update'), 10, 2);
        }
    }
    
    /**
     * Check for plugin updates
     */
    public function check_for_updates($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }
        
        try {
            $plugin_data = get_plugin_data($this->plugin_file);
            if (!$plugin_data || !isset($plugin_data['Version'])) {
                return $transient;
            }
            
            $current_version = $plugin_data['Version'];
            
            // Get update info from server
            $update_info = $this->get_update_info();
            
            if ($update_info && version_compare($current_version, $update_info['version'], '<')) {
                $transient->response[$this->plugin_slug . '/' . basename($this->plugin_file)] = (object) array(
                    'slug' => $this->plugin_slug,
                    'new_version' => $update_info['version'],
                    'url' => $update_info['homepage'],
                    'package' => $update_info['download_url'],
                    'requires' => $update_info['requires'],
                    'requires_php' => $update_info['requires_php'],
                    'tested' => $update_info['tested'],
                    'last_updated' => $update_info['last_updated'],
                    'sections' => array(
                        'description' => $update_info['description'],
                        'changelog' => $update_info['changelog']
                    )
                );
            }
        } catch (Exception $e) {
            // Log error but don't break the update system
            error_log('UKPA Auto Updater Error: ' . $e->getMessage());
        }
        
        return $transient;
    }
    
    /**
     * Get plugin information for the update screen
     */
    public function plugin_info($result, $action, $args) {
        if ($action !== 'plugin_information') {
            return $result;
        }
        
        if (!isset($args->slug) || $args->slug !== $this->plugin_slug) {
            return $result;
        }
        
        $update_info = $this->get_update_info();
        
        if ($update_info) {
            $result = (object) array(
                'name' => $this->plugin_name,
                'slug' => $this->plugin_slug,
                'version' => $update_info['version'],
                'author' => $update_info['author'],
                'author_profile' => $update_info['author_profile'],
                'last_updated' => $update_info['last_updated'],
                'homepage' => $update_info['homepage'],
                'sections' => array(
                    'description' => $update_info['description'],
                    'changelog' => $update_info['changelog'],
                    'installation' => $update_info['installation'],
                    'screenshots' => $update_info['screenshots']
                ),
                'download_link' => $update_info['download_url'],
                'requires' => $update_info['requires'],
                'requires_php' => $update_info['requires_php'],
                'tested' => $update_info['tested']
            );
        }
        
        return $result;
    }
    
    /**
     * Get update information from server
     */
    private function get_update_info() {
        try {
            $cache_key = 'ukpa_plugin_update_info';
            $cached_info = get_transient($cache_key);
            
            if ($cached_info !== false) {
                return $cached_info;
            }
            
            $response = wp_remote_post($this->update_url, array(
                'body' => array(
                    'action' => 'get_update_info',
                    'plugin_slug' => $this->plugin_slug,
                    'current_version' => $this->version,
                    'license_key' => $this->license_key,
                    'site_url' => get_site_url(),
                    'wp_version' => get_bloginfo('version')
                ),
                'timeout' => 15
            ));
            
            if (is_wp_error($response)) {
                return false;
            }
            
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (!$data || !isset($data['success']) || !$data['success']) {
                return false;
            }
            
            // Cache for 12 hours
            set_transient($cache_key, $data['data'], 12 * HOUR_IN_SECONDS);
            
            return $data['data'];
        } catch (Exception $e) {
            error_log('UKPA Auto Updater Error in get_update_info: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Actions to perform after update
     */
    public function after_update($upgrader, $hook_extra) {
        if ($hook_extra['action'] === 'update' && $hook_extra['type'] === 'plugin') {
            foreach ($hook_extra['plugins'] as $plugin) {
                if ($plugin === $this->plugin_slug . '/' . basename($this->plugin_file)) {
                    // Clear any cached data
                    delete_transient('ukpa_plugin_update_info');
                    
                    // Log the update
                    error_log('UKPA Calculator Builder updated successfully');
                    
                    // You can add custom actions here, like:
                    // - Sending update notification to admin
                    // - Running database migrations
                    // - Clearing caches
                    break;
                }
            }
        }
    }
    

}

// Initialize the auto updater - we'll do this from the main plugin file
// new UKPA_Auto_Updater(__FILE__); 