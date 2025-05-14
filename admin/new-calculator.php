<?php
// Route and Title Save Logic BEFORE output
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['calc_id'])) {
  if (wp_verify_nonce($_POST['_wpnonce'], 'ukpa_update_calc_settings')) {
    $backend_route = sanitize_text_field($_POST['backend_route']);
    $update_id = sanitize_text_field($_POST['calc_id']);
    $new_title = sanitize_text_field($_POST['calc_title'] ?? 'Untitled Calculator');

    $old = get_option('ukpa_calc_' . $update_id, []);
    $old['route'] = $backend_route;
    $old['title'] = $new_title;

    update_option('ukpa_calc_' . $update_id, $old);
    wp_redirect(admin_url("admin.php?page=ukpa-calculator-add-new&calc_id={$update_id}&updated=1"));
    exit;
  }
}

$calc_id = isset($_GET['calc_id']) ? sanitize_text_field($_GET['calc_id']) : '';
$data = get_option('ukpa_calc_' . $calc_id, []);
$title = $data['title'] ?? 'Untitled Calculator';
$elements = $data['elements'] ?? [];
$route = $data['route'] ?? '';
?>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("ukpa-fullscreen-builder");

    <?php if (!empty($route_saved)): ?>
      document.getElementById('ukpa-route-status').textContent = '✅ Route and title updated successfully!';
    <?php endif; ?>
  });
</script>
<script>
  window.ukpa_dynamic_result_keys = <?php echo json_encode($data['dynamicResultKeys'] ?? []); ?>;
</script>

<div class="ukpa-builder-header">
  <h1>Edit Calculator: <?php echo esc_html($title); ?></h1>
  <a href="<?php echo esc_url(admin_url('admin.php?page=ukpa-calculator-builder')); ?>" class="ukpa-builder-exit">✖ Exit Builder</a>
</div>

<div class="wrap ukpa-builder-wrap">
  <div class="ukpa-header-bar">
    <form id="ukpa-calc-settings" method="post" class="ukpa-calc-settings-form">
      <?php wp_nonce_field('ukpa_update_calc_settings'); ?>
      <input type="hidden" name="calc_id" value="<?php echo esc_attr($calc_id); ?>">
      <label for="ukpa-calc-title"><strong>📝 Calculator Name</strong></label>
      <input type="text" name="calc_title" id="ukpa-calc-title" class="regular-text" value="<?php echo esc_attr($title); ?>" style="min-width: 200px;">
      
      <div style="display: flex; flex-direction:row; align-items: center; gap: 10px;">
        <label for="ukpa-backend-route" class="ukpa-label">Backend Route</label>
        <div style="display: flex; flex-direction:row; gap: 10px; align-items: center;">
          <select name="backend_route" id="ukpa-backend-route" class="ukpa-backend-dropdown">
            <option value="">-- Select Route --</option>
            <option value="ltt/calculate" <?php selected($route, 'ltt/calculate'); ?>>LTT Calculator</option>
            <option value="sdlt/calculate" <?php selected($route, 'sdlt/calculate'); ?>>SDLT Calculator</option>
            <option value="ated/calculate" <?php selected($route, 'ated/calculate'); ?>>ATED Calculator</option>
            <option value="cgt/calculate" <?php selected($route, 'cgt/calculate'); ?>>CGT Calculator</option>
            <option value="prr/calculate" <?php selected($route, 'prr/calculate'); ?>>PRR Calculator</option>
            <option value="Salary" <?php selected($route, 'Salary'); ?>>Salary Tax Calculator</option>
          </select>
        </div>
      </div>
      <button type="submit" id="ukpa-save-builder" class="button button-primary save-calculator">✅ Save Calculator</button>
</form>
    
  </div>

  <div class="ukpa-builder-layout">
    <div class="ukpa-toolbox">
      <h3>Elements</h3>
      <p>Drag and drop elements into the sections below to build.</p>
      <div class="ukpa-toolbox-buttons">
        <div class="ukpa-tool-group">
          <div class="draggable button" data-type="header">Header</div>
          <div class="draggable button" data-type="textBlock">Text Block</div>
          <div class="draggable button" data-type="image">Image</div>
          <div class="draggable button" data-type="video">Video</div>
          <div class="draggable button" data-type="button">Button</div>
          <div class="draggable button" data-type="link">Link</div>
          <div class="draggable button" data-type="contentBlock">Content Block</div>
        </div>
        <hr />
        <div class="ukpa-tool-group">
          <div class="draggable button" data-type="number">Number</div>
          <div class="draggable button" data-type="text">Text</div>
          <div class="draggable button" data-type="email">Email</div>
          <div class="draggable button" data-type="dropdown">Dropdown</div>
          <div class="draggable button" data-type="radio">Radio</div>
          <div class="draggable button" data-type="checkbox">Checkbox</div>
          <div class="draggable button" data-type="date">Date Picker</div>
        </div>
        <hr />
        <div class="ukpa-tool-group">
          <div class="draggable button" data-type="mainResult">Main Result</div>
          <div class="draggable button" data-type="breakdown">Breakdown Table</div>
          <div class="draggable button" data-type="barChart">Bar Chart</div>
          <div class="draggable button" data-type="disclaimer">Disclaimer</div>
        </div>
      </div>
    </div>

    <div class="ukpa-preview">
      <!-- Input + Result in a row -->
      <div style="display: flex; flex-direction: row; gap: 20px; align-items: flex-start;">
        <div class="ukpa-section ukpa-drop-zone" id="inputs-preview" data-section="inputs" style="width: 35%;">
          <h3>Input Section</h3>
          <?php foreach ($elements as $el): ?>
            <?php if ($el['section'] === 'inputs'): ?>
              <div class="ukpa-element"
                  data-id="<?php echo esc_attr($el['id']); ?>"
                  data-type="<?php echo esc_attr($el['type']); ?>"
                  data-config='<?php echo esc_attr(json_encode($el['config'])); ?>'>
                  
                <div class="ukpa-admin-id-label">
                  🆔 <strong><?php echo esc_html($el['id']); ?></strong>
                </div>

                <?php echo $el['html']; ?>
              </div>

            <?php endif; ?>
          <?php endforeach; ?>
        </div>

        <div class="ukpa-section ukpa-drop-zone" id="results-preview" data-section="results" style="width: 65%;">
          <h3>Result Section</h3>
          <?php foreach ($elements as $el): ?>
            <?php if ($el['section'] === 'results'): ?>
              <div class="ukpa-element"
                  data-id="<?php echo esc_attr($el['id']); ?>"
                  data-type="<?php echo esc_attr($el['type']); ?>"
                  data-config='<?php echo esc_attr(json_encode($el['config'])); ?>'>
                  
                <div class="ukpa-admin-id-label">
                  🆔 <strong><?php echo esc_html($el['id']); ?></strong>
                </div>

                <?php echo $el['html']; ?>
              </div>

            <?php endif; ?>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Minimizable Disclaimer Section -->
      <div class="ukpa-section ukpa-drop-zone" id="disclaimer-preview" data-section="disclaimer">
        <div class="ukpa-settings-header disclaimer" onclick="toggleBox('disclaimer-body')">
          <h3>Disclaimer Section</h3>
          <span class="toggle-indicator">↰</span>
        </div>
        <div id="disclaimer-body" class="ukpa-settings-body">
          <?php foreach ($elements as $el): ?>
            <?php if ($el['section'] === 'disclaimer'): ?>
              <div class="ukpa-element"
                   data-id="<?php echo esc_attr($el['id']); ?>"
                   data-type="<?php echo esc_attr($el['type']); ?>"
                   data-config='<?php echo esc_attr(json_encode($el['config'])); ?>'>
                <?php echo $el['html']; ?>
              </div>
            <?php endif; ?>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Minimizable Content Section (moved to last) -->
      <div class="ukpa-section ukpa-drop-zone" id="content-preview" data-section="content">
        <div class="ukpa-settings-header content" onclick="toggleBox('content-body')">
          <h3>Content Section</h3>
          <span class="toggle-indicator">↰</span>
        </div>
        <div id="content-body" class="ukpa-settings-body">
          <?php foreach ($elements as $el): ?>
            <?php if ($el['section'] === 'content'): ?>
              <div class="ukpa-element"
                   data-id="<?php echo esc_attr($el['id']); ?>"
                   data-type="<?php echo esc_attr($el['type']); ?>"
                   data-config='<?php echo esc_attr(json_encode($el['config'])); ?>'>
                <?php echo $el['html']; ?>
              </div>
            <?php endif; ?>
          <?php endforeach; ?>
        </div>
      </div>

      <div id="ukpa-save-status" class="ukpa-save-status"></div>
    </div>

    <!-- Settings Panels remain untouched -->
    <?php /* everything below this remains unchanged */ ?>
    <div class="ukpa-settings">
      <div class="ukpa-settings-box">
        <div class="ukpa-settings-header" onclick="toggleBox('ukpa-element-settings')">
          <h3 id="ukpa-editor-title">🛠️ Element Settings</h3>
          <span class="toggle-indicator">↰</span>
        </div>
        <div id="ukpa-element-settings" class="ukpa-settings-body">
          <div id="ukpa-element-editor-body">
            <p>Select an element to edit</p>
          </div>
        </div>
      </div>

      <div class="ukpa-settings-box">
        <div class="ukpa-settings-header" onclick="toggleBox('ukpa-route-param-box')">
          <h3>🔗 Backend Settings</h3>
          <span class="toggle-indicator">↰</span>
        </div>
        <div id="ukpa-route-param-box" class="ukpa-settings-body">

        </div>
      </div>

      <div class="ukpa-settings-box">
        <div class="ukpa-settings-header" onclick="toggleBox('ukpa-custom-code-box')">
          <h3>🎨 Custom CSS / JS</h3>
          <span class="toggle-indicator">↰</span>
        </div>

        <div id="ukpa-custom-code-box" class="ukpa-settings-body">
          <div class="ukpa-settings-subbox" style="margin-bottom: 20px;">
            <label for="ukpa_custom_css">Custom CSS:</label>
            <textarea
              name="custom_css"
              id="ukpa_custom_css"
              rows="6"
              style="width: 100%; font-family: monospace; min-height: 120px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;"
            ><?php echo esc_textarea($data['ukpa_builder_css'] ?? ''); ?></textarea>
          </div>

          <div class="ukpa-settings-subbox">
            <label for="ukpa_custom_js">Custom JS:</label>
            <textarea
              name="custom_js"
              id="ukpa_custom_js"
              rows="6"
              style="width: 100%; font-family: monospace; min-height: 120px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;"
            ><?php echo esc_textarea($data['ukpa_builder_js'] ?? ''); ?></textarea>
          </div>
        </div>
      </div>



    </div>

    <!-- Unsaved Exit Modal -->
    <div id="ukpa-exit-warning-modal" class="ukpa-modal" style="display: none;">
      <div class="ukpa-modal-overlay"></div>
      <div class="ukpa-modal-content">
        <h2>⚠️ Unsaved Changes</h2>
        <p>You have unsaved changes. Do you really want to leave without saving?</p>
        <div class="ukpa-modal-actions">
          <button type="button" class="button button-secondary" id="ukpa-cancel-exit">Cancel</button>
          <a href="<?php echo esc_url(admin_url('admin.php?page=ukpa-calculator-builder')); ?>" class="button button-primary" id="ukpa-confirm-exit">Yes, Exit</a>
        </div>
      </div>
    </div>
  </div>

<script type="module">
  window.ukpaCalculatorId = '<?php echo esc_js($calc_id); ?>';
  window.ukpaSaveNonce = '<?php echo wp_create_nonce("ukpa_save_calc_nonce"); ?>';

  import('<?php echo plugins_url('assets/js/builder.js', dirname(__FILE__)); ?>?ver=<?php echo time(); ?>');

  function toggleBox(id) {
    const body = document.getElementById(id);
    const icon = body.previousElementSibling.querySelector('.toggle-indicator');
    if (body.style.display === 'none') {
      body.style.display = 'block';
      icon.textContent = '⇩';
    } else {
      body.style.display = 'none';
      icon.textContent = '↰';
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("ukpa-calc-settings");
    const saveBtn = document.getElementById("ukpa-save-builder");

    function fullSaveHandler(e) {
      if (e) e.preventDefault();
      if (saveBtn) saveBtn.click();
      if (typeof saveCalculatorLayout === "function") {
        saveCalculatorLayout();
      }
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        window.isDirty = false;
      });
    }

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        fullSaveHandler(e);
      }
    });

    const formElements = document.querySelectorAll("#ukpa-calc-settings input, #ukpa-calc-settings select, .ukpa-element");
    formElements.forEach(el => {
      el.addEventListener("input", () => {
        window.isDirty = true;
      });
    });

    const exitBtn = document.querySelector(".ukpa-builder-exit");
    const modal = document.getElementById("ukpa-exit-warning-modal");
    const cancelExit = document.getElementById("ukpa-cancel-exit");
    const confirmExit = document.getElementById("ukpa-confirm-exit");

    if (exitBtn && modal) {
      exitBtn.addEventListener("click", function (e) {
        if (window.isDirty) {
          e.preventDefault();
          modal.style.display = "block";
        }
      });
    }

    if (cancelExit) {
      cancelExit.addEventListener("click", () => {
        document.getElementById("ukpa-exit-warning-modal").style.display = "none";
      });
    }

    // 🧪 Add "Test API" button
    const testButton = document.createElement("button");
    testButton.textContent = "🧪 Test API";
    testButton.className = "button button-secondary";
    testButton.style.marginLeft = "12px";
    saveBtn.parentNode.insertBefore(testButton, saveBtn.nextSibling);

    testButton.addEventListener("click", async (e) => {
      e.preventDefault(); // ✅ Prevent page reload

      if (typeof ukpa_api_data === 'undefined') {
        console.error("❌ ukpa_api_data is not defined. Ensure wp_localize_script is working.");
        alert("API config missing. Please reload the page or contact admin.");
        return;
      }

      const route = document.getElementById("ukpa-backend-route")?.value;
      if (!route) return alert("Please select a backend route first.");

      const fullUrl = `${ukpa_api_data.base_url}/routes/mainRouter/${route}`;

      // 🔁 Build payload using config.name or config.label
      const inputs = document.querySelectorAll("#inputs-preview .ukpa-element input, #inputs-preview .ukpa-element select, #inputs-preview .ukpa-element textarea");
      const payload = {};

      inputs.forEach(el => {
        const wrapper = el.closest('.ukpa-element');
        if (!wrapper) return;

        const config = wrapper.dataset.config ? JSON.parse(wrapper.dataset.config) : {};
        const paramName = config.name?.trim() || config.label?.trim();
        const value = el.type === 'checkbox' ? el.checked : el.value;

        if (paramName && value !== '') {
          payload[paramName] = value;
        }
      });

      console.log("📤 Sending to backend:", payload);
      console.log("📡 Backend Route:", fullUrl);

      try {
        const response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Plugin-Auth": ukpa_api_data.plugin_token
          },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        console.log("📥 Raw response:", response);

        const result = await response.json();
        console.log("✅ Parsed response:", result);

        if (!response.ok) {
          console.warn("🟡 Backend returned error:", result.message || result);
          return;
        }

        // ✅ Only handle if result.result exists
        if (result.result && typeof result.result === 'object') {
          const keys = Object.keys(result.result);

          // ✅ Update all result element dropdowns
          const resultDropdowns = document.querySelectorAll(".ukpa-element[data-type='mainResult'] select.dynamic-result-options, .ukpa-element[data-type='breakdown'] select.dynamic-result-options, .ukpa-element[data-type='barChart'] select.dynamic-result-options");
          resultDropdowns.forEach(dropdown => {
            dropdown.innerHTML = `<option value="">-- Select --</option>`;
            keys.forEach(key => {
              const option = document.createElement("option");
              option.value = key;
              option.textContent = key;
              dropdown.appendChild(option);
            });
          });

          // ✅ Update settings panel dropdown (editor)
          const editorDropdown = document.getElementById('ukpa-dynamic-result');
          if (editorDropdown) {
            editorDropdown.innerHTML = `<option value="">-- Select --</option>`;
            keys.forEach(key => {
              const option = document.createElement("option");
              option.value = key;
              option.textContent = key;
              editorDropdown.appendChild(option);
            });
          }

          // ✅ Save keys to DB for this calculator
          const metaPayload = new FormData();
          metaPayload.append('action', 'ukpa_save_result_keys');
          metaPayload.append('calc_id', window.ukpaCalculatorId);
          metaPayload.append('keys', JSON.stringify(keys));
          metaPayload.append('_wpnonce', ukpa_api_data.nonce);

          fetch(ukpa_api_data.ajaxurl, {
            method: 'POST',
            body: metaPayload
          })
          .then(res => res.json())
          .then(json => {
            if (json.success) {
              console.log('🧠 Result keys saved to DB:', json.data.saved);
            } else {
              console.warn('⚠️ Failed to save result keys to DB:', json.data.message);
            }
          })
          .catch(err => {
            console.error('❌ AJAX save error:', err);
          });
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        alert("Test API request failed. See console for details.");
      }
    });



  });
</script>


</div>
