# ID Verification Form Shortcode

This plugin now includes a separate ID verification form that can be rendered using a shortcode without interfering with the main calculator functionality.

## Usage

### Basic Usage
```
[ukpa_idv_form]
```

### With Custom ID
```
[ukpa_idv_form id="custom-form-id"]
```

## Features

- **Separate from Calculator System**: The ID verification form is completely independent of the main calculator builder
- **Reuses Existing Modules**: Uses the existing form modules from `public/js/modules/formPlugins/`
- **WordPress AJAX Integration**: Form submissions are handled through WordPress AJAX for security
- **Responsive Design**: Mobile-friendly form layout
- **Multi-user Support**: Can handle 1-4 users per submission
- **Document Upload**: Supports file uploads for identity documents
- **Form Validation**: Client-side and server-side validation
- **Email Notifications**: Admin receives email notifications for new submissions

## File Structure

```
includes/
├── idv-form-shortcode.php          # Shortcode handler
└── ajax.php                        # AJAX handlers (updated)

public/
├── css/
│   └── idvformstyle.css            # Form-specific styles
├── js/
│   ├── idv-form.js                 # Main form JavaScript
│   └── modules/
│       └── formPlugins/            # Existing form modules (reused)
└── html/
    └── modularidvform.html         # Original HTML template
```

## Form Flow

1. **Setup Step**: User enters their name, email, and number of users
2. **User Forms**: Dynamic forms are generated for each user
3. **Personal Details**: Name, date of birth, nationality, etc.
4. **Address Details**: Street address, city, postal code, etc.
5. **Document Details**: Document type selection and file uploads
6. **Submission**: Data is sent to WordPress AJAX endpoint

## Data Storage

Form submissions are stored in WordPress options with the prefix `ukpa_idv_submission_` followed by a unique ID. Each submission includes:

- Filer information (name, email)
- User details (personal, address, documents)
- Timestamp and submission ID

## Customization

### Styling
Modify `public/css/idvformstyle.css` to customize the form appearance.

### Form Logic
The form uses the existing modules in `public/js/modules/formPlugins/`:
- `personalDetails.js` - Personal information fields
- `addressDetails.js` - Address fields
- `documentDetails.js` - Document upload fields
- `samePersonLogic.js` - Logic for same person scenarios
- `collectAndSendFormData.js` - Form submission handling

### Backend Integration
To integrate with your Node.js backend instead of WordPress storage:

1. Modify the AJAX handler in `includes/ajax.php`
2. Update the `collectAndSendFormData.js` function
3. Add your API endpoints and authentication

## Security

- Nonce verification for all AJAX requests
- Input sanitization and validation
- File upload restrictions (can be customized)
- CSRF protection through WordPress nonces

## Browser Support

- Modern browsers with ES6 module support
- Responsive design for mobile devices
- Graceful degradation for older browsers

## Troubleshooting

### Form Not Loading
- Check browser console for JavaScript errors
- Verify all required files are accessible
- Ensure WordPress AJAX is working

### Submission Issues
- Check browser network tab for AJAX errors
- Verify nonce is being generated correctly
- Check server error logs

### Styling Issues
- Clear browser cache
- Check CSS file paths
- Verify CSS is being loaded

## Example Implementation

```php
// In a WordPress page or post
[ukpa_idv_form id="main-verification"]

// Or in a PHP template
<?php echo do_shortcode('[ukpa_idv_form id="template-form"]'); ?>
```

## Notes

- The form is completely separate from the calculator system
- No conflicts with existing calculator functionality
- Can be used on any page or post
- Supports multiple instances on the same page
- Form data is stored locally in WordPress (can be modified for external storage) 