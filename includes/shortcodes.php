<?php
add_shortcode('ukpa_calculator', 'render_ukpa_calculator_shortcode');

function render_ukpa_calculator_shortcode($atts = []) {
    $atts = shortcode_atts([
        'id' => ''
    ], $atts);

    $calc_id = sanitize_text_field($atts['id']);
    $option_key = 'ukpa_calc_' . $calc_id;
    $data = get_option($option_key);

    // ✅ Register calculator ID for wp_head injection
    global $ukpa_calc_ids_to_inject;
    if (!isset($ukpa_calc_ids_to_inject)) $ukpa_calc_ids_to_inject = [];
    $ukpa_calc_ids_to_inject[] = $calc_id;

    if (!$data || !isset($data['elements']) || !is_array($data['elements'])) {
        return '<div class="ukpa-calculator-error">⚠️ Calculator not found. Please contact the admin: ' . esc_html($option_key) . '</div>';
    }

    $backend_route = esc_js($data['route'] ?? '');

    ob_start();

    // ✅ Inject custom CSS and JS saved in builder
    if (!empty($data['ukpa_builder_css'])) {
        echo '<style id="ukpa-custom-css">' . esc_html($data['ukpa_builder_css']) . '</style>';
    }
    if (!empty($data['ukpa_builder_js'])) {
        echo '<script id="ukpa-custom-js">' . wp_kses_post($data['ukpa_builder_js']) . '</script>';
    }
    ?>

    <!-- ✅ Inject calc ID and backend route for JS to access -->
    <script>
        window.ukpaCalculatorId = "<?php echo esc_js($calc_id); ?>";
        window.ukpa_api_data = window.ukpa_api_data || {};
        window.ukpa_api_data.backend_route = "<?php echo $backend_route; ?>";
    </script>

    <div class="ab-main-wrapper">
        <div class="ab-wrapper">
            <!-- LEFT: Informative content section -->
            <div class="ab-content" id="ab-content-section">
                <?php foreach ($data['elements'] as $el): ?>
                    <?php if ($el['section'] === 'content'): ?>
                        <?php
                            $config = $el['config'] ?? [];
                            $id = esc_attr($el['id']);
                            $style = (!empty($config['conditions']['rules'])) ? 'display:none;' : '';
                        ?>
                        <div class="ukpa-element"
                             data-id="<?= $id ?>"
                             data-type="<?= esc_attr($el['type']) ?>"
                             data-config='<?= esc_attr(json_encode($config)) ?>'
                             style="<?= esc_attr($style) ?>">
                            <?= $el['html'] ?>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>

            <div class="ab-input" id="ab-input-box">
                <!-- Scrollable Input Form -->
                <div class="ab-input-scrollable">
                    <form onsubmit="return false;">
                        <?php foreach ($data['elements'] as $el): ?>
                            <?php if ($el['section'] === 'inputs'): ?>
                                <?php
                                    $config = $el['config'] ?? [];
                                    $id = esc_attr($el['id']);
                                    $style = (!empty($config['conditions']['rules'])) ? 'display:none;' : '';
                                    $html = preg_replace('/<div class="ukpa-admin-id-label">.*?<\/div>/', '', $el['html']);
                                    $html = preg_replace('/<(input|select|textarea)([^>]+)>/i', '<$1 name="' . $id . '"$2>', $html);
                                ?>
                                <div class="ukpa-element"
                                    data-id="<?= $id ?>"
                                    data-type="<?= esc_attr($el['type']) ?>"
                                    data-config='<?= esc_attr(json_encode($config)) ?>'
                                    style="<?= esc_attr($style) ?>">
                                    <?= $html ?>
                                </div>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </form>
                </div>
                

                <!-- Sticky Reset Button -->
                <div class="ab-btn-div">
                    <div class="input-bottom-container">
                        <div id="ukpa-error-message" class="ukpa-error-message"></div>
                        <button type="button" class="ab-reset-button" onclick="resetForm()">Reset</button>
                    </div>
                </div>
            </div>



            <!-- RIGHT: Result section -->
            <div class="main-result-container" id="main-result-container" style="display: none;">
                <div class="ab-result-wrapper">
                    <div class="ab-result" id="ab-result-container">
                        <!-- 🔵 Main Result Section -->
                        <div class="ab-main-result-wrapper">
                            <?php foreach ($data['elements'] as $el): ?>
                            <?php if ($el['section'] === 'results' && $el['type'] === 'mainResult'): ?>
                                <?php
                                $config = $el['config'] ?? [];
                                $id = esc_attr($el['id']);
                                $style = (!empty($config['conditions']['rules'])) ? 'display:none;' : '';
                                $html = preg_replace('/<div class="ukpa-admin-id-label">.*?<\/div>/', '', $el['html']);
                                $html = preg_replace('/<(input|select|textarea)([^>]+)>/i', '<$1 name="' . $id . '"$2>', $html);
                                ?>
                                <div class="ukpa-element"
                                    data-id="<?= $id ?>"
                                    data-type="<?= esc_attr($el['type']) ?>"
                                    data-config='<?= esc_attr(json_encode($config)) ?>'
                                    style="<?= esc_attr($style) ?>">
                                <?= $html ?>
                                </div>
                            <?php endif; ?>
                            <?php endforeach; ?>
                        </div>

                    <!-- 🟢 Combined Results Wrapper -->
                    <div class="ukpa-element ab-secondary-result-wrapper"
                        data-id="secondary-result-wrapper"
                        data-type="wrapper"
                        data-config='<?= json_encode(["layout" => "wrap", "columnWidths" => []]) ?>'>


                    <!-- 🔷 Chart Section -->
                    <div class="ab-chart-results">
                        <?php foreach ($data['elements'] as $el): ?>
                        <?php if ($el['section'] === 'results' && $el['type'] === 'barChart'): ?>
                            <?php
                            $config = $el['config'] ?? [];
                            $id = esc_attr($el['id']);
                            $style = (!empty($config['conditions']['rules'])) ? 'display:none;' : '';
                            $html = preg_replace('/<div class="ukpa-admin-id-label">.*?<\/div>/', '', $el['html']);
                            $html = preg_replace('/<(input|select|textarea)([^>]+)>/i', '<$1 name="' . $id . '"$2>', $html);
                            ?>
                            <div class="ukpa-element"
                                data-id="<?= $id ?>"
                                data-type="<?= esc_attr($el['type']) ?>"
                                data-config='<?= esc_attr(json_encode($config)) ?>'
                                style="<?= esc_attr($style) ?>">
                            <?= $html ?>
                            </div>
                        <?php endif; ?>
                        <?php endforeach; ?>
                    </div>

                    <!-- 🔶 Other Result Section -->
                    <div class="ab-other-results">
                        <?php foreach ($data['elements'] as $el): ?>
                        <?php if ($el['section'] === 'results' && $el['type'] === 'otherResult'): ?>
                            <?php
                            $config = $el['config'] ?? [];
                            $id = esc_attr($el['id']);
                            $style = (!empty($config['conditions']['rules'])) ? 'display:none;' : '';
                            $html = preg_replace('/<div class="ukpa-admin-id-label">.*?<\/div>/', '', $el['html']);
                            $html = preg_replace('/<(input|select|textarea)([^>]+)>/i', '<$1 name="' . $id . '"$2>', $html);
                            ?>
                            <div class="ukpa-element"
                                data-id="<?= $id ?>"
                                data-type="<?= esc_attr($el['type']) ?>"
                                data-config='<?= esc_attr(json_encode($config)) ?>'
                                style="<?= esc_attr($style) ?>">
                            <?= $html ?>
                            </div>
                        <?php endif; ?>
                        <?php endforeach; ?>
                    </div>

                    </div>



                        </div>


                    <!-- Lead form -->
                    <form class="ab-lead-form" onsubmit="handleLeadSubmit(event)">
                        <span></span>
                            <small class="leadform-title">Enter contact details below to receive more detailed result in your email.</small>
                        <div class="ab-lead-fields">
                            <div class="ab-lead-input-group">
                                <label for="ab-fullName">Full Name</label>
                                <input type="text" id="ab-fullName" name="fullName" placeholder="Type your full name..." required>
                            </div>
                            <div class="ab-lead-input-group">
                                <label for="ab-email">Email Address</label>
                                <input type="email" id="ab-email" name="email" placeholder="Type your email..." required>
                            </div>
                            <button type="submit" class="ab-send-btn">
                                <img src="https://www.ukpropertyaccountants.co.uk/wp-content/uploads/2025/03/paper-send.svg" alt="Send">
                            </button>
                        </div>
                        <div class="ab-lead-consent">
                            <input type="checkbox" id="ab-consent" required>
                            <label for="ab-consent">
                                I consent to having my information processed to receive personalised marketing material in accordance with the
                                <a href="/privacy-policy" target="_blank">Privacy Policy</a>.
                            </label>
                        </div>
                        <div id="ab-lead-status" class="ab-lead-status"></div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Footer disclaimer -->
        <?php foreach ($data['elements'] as $el): ?>
            <?php if ($el['section'] === 'disclaimer'): ?>
                <?php
                    $config = $el['config'] ?? [];
                    $id = esc_attr($el['id']);
                    $style = (!empty($config['conditions']['rules'])) ? 'display:none;' : '';
                    $html = preg_replace('/<div class="ukpa-admin-id-label">.*?<\/div>/', '', $el['html']);
                    $html = preg_replace('/<(input|select|textarea)([^>]+)>/i', '<$1 name="' . $id . '"$2>', $html);
                ?>
                <p class="ab-disclaimer ukpa-element"
                   data-id="<?= $id ?>"
                   data-type="<?= esc_attr($el['type']) ?>"
                   data-config='<?= esc_attr(json_encode($config)) ?>'
                   style="<?= esc_attr($style) ?>">
                    <?= $html ?>
                </p>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
    <?php
    return ob_get_clean();
}
