<?php

// Function to render the CSS/JS editor and save the values
function render_calculator_css_js_editor($config) {
    ?>
    <div class="ukpa-editor-field">
        <label for="ukpa-custom-css">Custom CSS</label>
        <textarea id="ukpa-custom-css" class="ukpa-input" placeholder="Enter custom CSS here..."><?= esc_textarea($config['custom_css'] ?? '') ?></textarea>
    </div>

    <div class="ukpa-editor-field">
        <label for="ukpa-custom-js">Custom JavaScript</label>
        <textarea id="ukpa-custom-js" class="ukpa-input" placeholder="Enter custom JavaScript here..."><?= esc_textarea($config['custom_js'] ?? '') ?></textarea>
    </div>

    <script>
        // Listen for changes to the CSS/JS fields
        document.getElementById('ukpa-custom-css').addEventListener('input', function() {
            updateCalculatorConfig('custom_css', this.value);
        });

        document.getElementById('ukpa-custom-js').addEventListener('input', function() {
            updateCalculatorConfig('custom_js', this.value);
        });

        // Save the updated CSS/JS to the calculator config
        function updateCalculatorConfig(key, value) {
            // Get the current config data
            let config = <?php echo json_encode($config); ?>;
            config[key] = value;

            // Make an AJAX request to save the updated config
            fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save_calculator_config',
                    config: config
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Config saved successfully');
                } else {
                    console.error('Error saving config');
                }
            });
        }
    </script>
    <?php
}
?>
