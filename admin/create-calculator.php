<?php
// 📌 Handle form submission
if (isset($_POST['ukpa_create_calculator'])) {
    // 🔐 Security check
    if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'ukpa_create_calc_nonce')) {
        die('Permission denied');
    }

    // 📝 Get calculator title
    $calculator_title = sanitize_text_field($_POST['calculator_title']);

    // ❌ Title cannot be empty
    if (empty($calculator_title)) {
        wp_redirect(add_query_arg('error', 'empty', $_SERVER['REQUEST_URI']));
        exit;
    }

    // 🆔 Generate unique calculator ID
    $calc_id = sanitize_title_with_dashes($calculator_title) . '-' . uniqid();

    // 📦 Default calculator structure
    $calculator_data = array(
        'title' => $calculator_title,
        'elements' => array() // empty element list
    );

    // 💾 Save to options table
    update_option('ukpa_calc_' . $calc_id, $calculator_data);

    // ↪️ Redirect to edit mode
    wp_safe_redirect(admin_url('admin.php?page=ukpa-calculator-add-new&calc_id=' . urlencode($calc_id)));
    exit;
}
?>

<div class="wrap">
  <h1>Add New Calculator</h1>

  <?php if (isset($_GET['error']) && $_GET['error'] === 'empty'): ?>
    <div class="notice notice-error"><p>⚠️ Please enter a calculator name before saving.</p></div>
  <?php endif; ?>

  <form method="POST">
    <?php wp_nonce_field('ukpa_create_calc_nonce'); ?>

    <table class="form-table">
      <tr>
        <th><label for="calculator_title">Calculator Name</label></th>
        <td>
          <input type="text" name="calculator_title" id="calculator_title" class="regular-text" placeholder="e.g. Property Tax Estimator" required />
        </td>
      </tr>
    </table>

    <p class="submit">
      <input type="submit" name="ukpa_create_calculator" class="button button-primary" value="➕ Create Calculator" />
    </p>
  </form>
</div>
