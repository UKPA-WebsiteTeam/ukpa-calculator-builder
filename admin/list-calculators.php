<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['quick_edit_calc_id'], $_POST['quick_edit_title'])) {
  $calc_id = sanitize_text_field($_POST['quick_edit_calc_id']);
  $new_title = sanitize_text_field($_POST['quick_edit_title']);
  $option_key = 'ukpa_calc_' . $calc_id;

  if (wp_verify_nonce($_POST['_wpnonce'], 'ukpa_quick_edit_title_' . $calc_id)) {
    $data = get_option($option_key, []);
    if (is_array($data)) {
      $data['title'] = $new_title;
      update_option($option_key, $data);
      wp_safe_redirect(admin_url('admin.php?page=ukpa-calculator-builder&title_updated=1'));
      exit;
    }
  }
}

global $wpdb;
$prefix = 'ukpa_calc_';
$query = $wpdb->prepare(
  "SELECT option_name, option_value FROM $wpdb->options WHERE option_name LIKE %s",
  $wpdb->esc_like($prefix) . '%'
);
$results = $wpdb->get_results($query);
?>

<div class="wrap">
  <h1>All Calculators</h1>

  <?php if (isset($_GET['title_updated'])): ?>
    <div class="notice notice-success is-dismissible"><p>✅ Calculator title updated successfully!</p></div>
  <?php endif; ?>
  <?php if (isset($_GET['imported'])): ?>
    <div class="notice notice-success is-dismissible"><p>✅ Calculators imported successfully!</p></div>
  <?php endif; ?>
  <?php if (isset($_GET['error'])): ?>
    <div class="notice notice-error is-dismissible"><p>⚠️ Error: <?php echo esc_html($_GET['error']); ?></p></div>
  <?php endif; ?>
  <?php if (isset($_GET['deleted'])): ?>
    <div class="notice notice-success is-dismissible"><p>✅ Selected calculators deleted.</p></div>
  <?php endif; ?>

  <h2>📤 Export / 📥 Import Calculators</h2>

  <!-- Export Form -->
  <form method="GET" action="" style="margin-bottom: 20px;">
    <input type="hidden" name="page" value="ukpa-calculator-builder" />
    <select name="export_calc_id">
      <option value="all">Export All Calculators</option>
      <?php foreach ($results as $row): ?>
        <?php
        $calc_id = str_replace($prefix, '', $row->option_name);
        $data = maybe_unserialize($row->option_value);
        $title = isset($data['title']) ? esc_html($data['title']) : '(Untitled)';
        ?>
        <option value="<?php echo esc_attr($calc_id); ?>"><?php echo $title; ?></option>
      <?php endforeach; ?>
    </select>
    <button class="button">📤 Export</button>
  </form>

  <!-- Import Form -->
  <form method="POST" enctype="multipart/form-data" style="margin-bottom: 40px;">
    <?php wp_nonce_field('ukpa_import_calculator'); ?>
    <input type="file" name="import_file" accept=".json" required />
    <input type="submit" name="ukpa_import_calc" class="button button-primary" value="📥 Import Calculator" />
  </form>

  <!-- Table of Calculators -->
  <form method="POST">
    <?php wp_nonce_field('ukpa_bulk_delete_action', 'ukpa_bulk_nonce'); ?>

    <table class="wp-list-table widefat fixed striped">
      <thead>
        <tr>
          <td style="width:30px;"><input type="checkbox" id="check-all" /></td>
          <th>Title</th>
          <th>Shortcodes</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($results)): ?>
          <tr><td colspan="4">No calculators found.</td></tr>
        <?php else: ?>
          <?php foreach ($results as $row): ?>
            <?php
              $data = maybe_unserialize($row->option_value);
              $title = isset($data['title']) ? esc_html($data['title']) : '(Untitled)';
              $calc_id = str_replace($prefix, '', $row->option_name);
              $edit_url = admin_url('admin.php?page=ukpa-calculator-add-new&calc_id=' . urlencode($calc_id));
            ?>
            <tr>
              <td><input type="checkbox" name="selected_calcs[]" value="<?php echo esc_attr($calc_id); ?>" /></td>
              <td>
                <strong class="calc-title-label"><?php echo $title; ?></strong>

                <div class="quick-edit-form" style="display: none; margin-top: 5px;">
                  <form method="POST">
                    <?php wp_nonce_field('ukpa_quick_edit_title_' . $calc_id); ?>
                    <input type="hidden" name="quick_edit_calc_id" value="<?php echo esc_attr($calc_id); ?>">
                    <input type="text" name="quick_edit_title" value="<?php echo $title; ?>" class="regular-text" style="width: 90%;" />
                    <div style="margin-top: 5px;">
                      <button type="submit" class="button button-primary button-small">Save</button>
                      <button type="button" class="button cancel-quick-edit" data-calc="<?php echo esc_attr($calc_id); ?>">Cancel</button>
                    </div>
                  </form>
                </div>

                <div style="margin-top: 6px;">
                  <a href="#" class="toggle-quick-edit" data-calc="<?php echo esc_attr($calc_id); ?>">Quick Edit</a> |
                  <a href="<?php echo esc_url($edit_url); ?>" class="builder-edit-button-all-calculators">Edit with Calculator Builder</a>
                </div>
              </td>

              <td><code>[ukpa_calculator_ana id="<?php echo esc_html($calc_id); ?>"]</code></td>
              <!-- <td>
                <a href="<?php echo esc_url($edit_url); ?>" class="button">Edit</a>
              </td> -->
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>

    <p>
      <input type="submit" name="ukpa_bulk_delete" class="button button-danger" value="🗑 Delete Selected"
             onclick="return confirm('Are you sure you want to delete the selected calculators?');" />
    </p>
  </form>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function () {
    const checkAll = document.getElementById('check-all');
    const checkboxes = document.querySelectorAll('input[name="selected_calcs[]"]');

    if (checkAll) {
      checkAll.addEventListener('change', function () {
        checkboxes.forEach(cb => cb.checked = checkAll.checked);
      });
    }

    document.querySelectorAll('.toggle-quick-edit').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const row = this.closest('tr');
        row.querySelector('.calc-title-label').style.display = 'none';
        row.querySelector('.quick-edit-form').style.display = 'block';
        this.style.display = 'none';
      });
    });

    document.querySelectorAll('.cancel-quick-edit').forEach(btn => {
      btn.addEventListener('click', function () {
        const row = this.closest('tr');
        row.querySelector('.quick-edit-form').style.display = 'none';
        row.querySelector('.calc-title-label').style.display = 'inline';
        row.querySelector('.toggle-quick-edit').style.display = 'inline';
      });
    });
  });
</script>
