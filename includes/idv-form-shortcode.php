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
        filemtime(UKPA_CALC_PATH . 'public/idvform/css/idvformstyle.css')
    );

    wp_enqueue_script(
        'ukpa-idv-form-js',
        UKPA_CALC_URL . 'public/idvform/idvform-modular-testing/index.js',
        [],
        filemtime(UKPA_CALC_PATH . 'public/idvform/idvform-modular-testing/index.js'),
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
  <div id="setupStep">
    <h2>UK Identity Verification Form</h2>
    <div class="requirement-box" style="padding:1em;margin-bottom:1.5em;background:#e3e3e354;">
      <b>About UK ID Verification</b>
      <p>The Identity Verification process brought up the Companies house requires the users to confirm their identity with them. This has been brought by the Companies house to maintain security and prevent fraud.</p>
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
    <div class="consent-box">
      <input type="checkbox" id="consentCheckbox" name="consentCheckbox" required />
      <label style="cursor:pointer;" for="consentCheckbox">I hereby confirm that the engagement letter and invoice will be sent to the email address provided. The individual completing this form will be considered the primary contact and will assume responsibility for the roles, actions, and information of any additional users included in this submission.</label>
    </div>
    <button id="startFilingBtn" type="button">Start Filing</button>
  </div>
  <div id="formContainer">
    <form id="dynamicForm">
      <div id="livenessContainer"></div>
    </form>
    <div id="pagination">
      <button id="prevBtn" class="navigationBtn" disabled>Previous</button>
      <button id="nextBtn" class="navigationBtn" disabled>Next</button>
      <button id="submitBtn" class="navigationBtn" style="display:none;">Submit</button>
      <div id="submitLoader" class="loader" style="display:none;vertical-align:middle;"></div>
      <span id="submitLoaderText" style="display:none;vertical-align:middle;margin-left:8px;font-weight:500;color:#ff3d00;">Validating and uploading documents...</span>
    </div>
  </div>
  <div id="submitOverlay" style="display:none;position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.85);backdrop-filter:blur(2px);">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
      <div class="loader" style="margin:auto;"></div>
      <div id="submitOverlayText" style="margin-top:24px;font-size:1.2em;font-weight:600;color:#ff3d00;">Validating and uploading documents...</div>
      <div id="submitOverlayText" style="margin-top:24px;font-size:1em;font-weight:400;color:#000000;">You will be redirected to the payment method. Please hold on...</div>
    </div>
  </div>
</div>
<?php
return ob_get_clean();
} 