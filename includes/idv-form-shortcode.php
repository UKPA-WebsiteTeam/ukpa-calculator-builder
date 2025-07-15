<?php
/**
 * ID Verification Form Shortcode Handler
 * Separate from the main calculator system to avoid conflicts
 */

add_shortcode('ukpa_idv_form', 'render_ukpa_idv_form_shortcode');

function render_ukpa_idv_form_shortcode($atts = []) {
    $atts = shortcode_atts([
        'id' => 'default'
    ], $atts);

    $form_id = sanitize_text_field($atts['id']);
    
    // Enqueue the specific assets for this form
    wp_enqueue_style(
        'ukpa-idv-form-css',
        UKPA_CALC_URL . 'public/css/idvformstyle.css',
        [],
        filemtime(UKPA_CALC_PATH . 'public/css/idvformstyle.css')
    );

    wp_enqueue_script(
        'ukpa-idv-form-js',
        UKPA_CALC_URL . 'public/js/idv-form.js',
        [],
        filemtime(UKPA_CALC_PATH . 'public/js/idv-form.js'),
        true
    );

    // Add module type to script tag
    add_filter('script_loader_tag', function ($tag, $handle) {
        if ($handle === 'ukpa-idv-form-js') {
            return str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }, 10, 2);

    // Localize script with AJAX data
    wp_localize_script('ukpa-idv-form-js', 'ukpa_idv_form_data', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('ukpa_idv_form_nonce'),
    ]);

    ob_start();
    ?>
    <div id="ukpa-idv-form-container" data-form-id="<?php echo esc_attr($form_id); ?>">
        <!-- First Fold: Setup Step -->
        <div id="setupStep">
            <h2>UK Identity Verification Form</h2>
            <div class="requirement-box" style="padding:1em;margin-bottom:1.5em;background:#e3e3e354;">
                <b>About UK ID Verification</b>
                <p>The UK Identity Verification Service helps ensure your identity is securely validated for compliance and access to essential services. Your information is handled with strict confidentiality and in accordance with UK regulations.</p>
                <b>Document Submission Requirement</b>
                <p>To complete the verification process, <b>you must provide a total of two identity documents</b>.
            </div>

            <div class="inputContainer">
                <label for="filerFullName">Your Full Name:</label>
                <input type="text" id="filerFullName" name="filerFullName" required />
            </div>
            <div class="inputContainer">
                <label for="filerEmail">Official Email:
                    <info-tooltip>This email will be the official point of contact between the user and UKPA team.</info-tooltip>
                </label>
                <input type="email" id="filerEmail" name="filerEmail" required placeholder="Enter your email address" />
            </div>
            <div class="inputContainer">
                <label for="setupNumUsers">Number of users you are filing for:</label>
                <select id="setupNumUsers">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
            </div>
            <div id="userNamesContainer"></div>
            <button id="startFilingBtn" type="button">Start Filing</button>
        </div>

        <div id="formContainer">
            <form id="dynamicForm">
                
            </form>

            <!-- Pagination Controls -->
            <div id="pagination">
                <button id="prevBtn" class="navigationBtn" disabled>Previous</button>
                <button id="nextBtn" class="navigationBtn" disabled>Next</button>
                <button id="submitBtn" class="navigationBtn" style="display:none;">Submit</button>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
} 