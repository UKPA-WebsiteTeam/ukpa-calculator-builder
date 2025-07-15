# UKPA Calculator Builder - License Management Guide

This guide explains how to set up and manage licenses for your UKPA Calculator Builder plugin.

## **License System Overview**

The license system supports three types of licenses:

### **1. Single Domain License**
- Valid for one domain only
- First domain that uses the license becomes the authorized domain
- Cannot be transferred to another domain

### **2. Multi Domain License**
- Valid for multiple domains (up to the specified limit)
- Each domain must be explicitly authorized
- Can add/remove domains as needed

### **3. Unlimited License**
- Valid for unlimited domains
- No domain restrictions
- Typically used for enterprise customers

## **Database Setup**

### **1. Create Database Tables**

Run this SQL to create the required tables:

```sql
CREATE TABLE ukpa_licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    license_type ENUM('single', 'multi', 'unlimited') DEFAULT 'single',
    status ENUM('active', 'expired', 'suspended', 'cancelled') DEFAULT 'active',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_date DATETIME NULL,
    max_domains INT DEFAULT 1,
    authorized_domains JSON,
    last_check DATETIME,
    check_count INT DEFAULT 0
);

CREATE TABLE ukpa_request_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(255),
    site_url VARCHAR(255),
    action VARCHAR(50),
    request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    INDEX idx_license_time (license_key, request_time),
    INDEX idx_action_time (action, request_time)
);
```

### **2. Configure Update Server**

Update the database configuration in `production-update-server.php`:

```php
define('DB_HOST', 'your_database_host');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
```

## **License Key Format**

License keys follow this format: `UKPA-XXXXXXXXXXXXXXX`

Where `X` represents alphanumeric characters (A-Z, 0-9).

### **Generating License Keys**

You can generate license keys using this PHP function:

```php
function generate_license_key() {
    $prefix = 'UKPA-';
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $key = '';
    
    for ($i = 0; $i < 16; $i++) {
        $key .= $chars[random_int(0, strlen($chars) - 1)];
    }
    
    return $prefix . $key;
}
```

## **License Management Workflow**

### **1. Creating a License**

1. **Customer purchases** your plugin
2. **You create a license** in your admin panel:
   - Generate a unique license key
   - Set customer information
   - Choose license type (single/multi/unlimited)
   - Set expiration date (if applicable)
   - Set maximum domains (for multi licenses)

3. **Send license key** to customer

### **2. Customer Activation**

1. **Customer enters license key** in WordPress admin
2. **Plugin validates license** with your server
3. **Server checks** if domain is authorized
4. **If single license and no domains authorized**: Automatically authorizes the domain
5. **If multi license**: Requires explicit activation
6. **If unlimited license**: No domain restrictions

### **3. Ongoing Validation**

- **Plugin checks license** every 12 hours
- **Server validates** license status and domain authorization
- **Updates are provided** only to valid licenses

## **Admin Interface**

### **License Management Dashboard**

The admin interface provides:

- **License List**: View all licenses with status and domain count
- **Create License**: Generate new licenses for customers
- **Edit License**: Modify existing licenses
- **Statistics**: View usage statistics and analytics

### **Key Features**

- **Bulk Operations**: Create multiple licenses at once
- **Domain Management**: Add/remove authorized domains
- **Status Management**: Activate, suspend, or cancel licenses
- **Analytics**: Track usage patterns and requests

## **Security Features**

### **1. Rate Limiting**
- Maximum 100 requests per hour per license
- Prevents abuse and excessive server load
- Configurable limits

### **2. Request Logging**
- All license checks are logged
- Track which domains are using licenses
- Monitor for suspicious activity

### **3. Domain Validation**
- Strict domain authorization for single/multi licenses
- Prevents license sharing between domains
- Automatic domain locking for single licenses

### **4. License Expiration**
- Automatic expiration handling
- Grace period for expired licenses
- Easy renewal process

## **Customer Experience**

### **1. License Entry**
Customers enter their license key in the WordPress admin:
```
Settings → UKPA Calculator Builder → License Key
```

### **2. Automatic Updates**
- Updates appear automatically in WordPress admin
- No manual intervention required
- Seamless update process

### **3. License Status**
Customers can see their license status:
- Valid/Invalid
- Expiration date
- Number of authorized domains

## **Business Models**

### **1. Single Domain Pricing**
- **Price**: $X per domain
- **Use Case**: Small businesses, individual developers
- **Limitation**: One domain per license

### **2. Multi Domain Pricing**
- **Price**: $Y for up to N domains
- **Use Case**: Agencies, larger businesses
- **Flexibility**: Add/remove domains as needed

### **3. Unlimited Pricing**
- **Price**: $Z for unlimited domains
- **Use Case**: Enterprise customers, resellers
- **Freedom**: No domain restrictions

## **Integration with E-commerce**

### **1. WooCommerce Integration**
You can integrate with WooCommerce for automatic license generation:

```php
// Hook into WooCommerce order completion
add_action('woocommerce_order_status_completed', 'generate_license_on_purchase');

function generate_license_on_purchase($order_id) {
    $order = wc_get_order($order_id);
    
    // Check if this order includes your plugin
    foreach ($order->get_items() as $item) {
        if ($item->get_product_id() == YOUR_PLUGIN_PRODUCT_ID) {
            // Generate license for customer
            $license_key = generate_license_key();
            $customer_email = $order->get_billing_email();
            $customer_name = $order->get_billing_first_name() . ' ' . $order->get_billing_last_name();
            
            // Save to database
            create_license_in_database($license_key, $customer_name, $customer_email);
            
            // Send email to customer
            send_license_email($customer_email, $license_key);
            break;
        }
    }
}
```

### **2. Manual License Generation**
For manual sales, use the admin interface to create licenses.

## **Monitoring and Analytics**

### **1. Usage Statistics**
Track important metrics:
- Total licenses sold
- Active vs inactive licenses
- Most popular license types
- Domain usage patterns

### **2. Revenue Tracking**
Monitor your business:
- Monthly recurring revenue
- License renewal rates
- Customer churn
- Average revenue per customer

### **3. Support Metrics**
Identify support needs:
- Most common issues
- License validation problems
- Update adoption rates

## **Troubleshooting**

### **Common Issues**

1. **License not validating**
   - Check if license exists in database
   - Verify license status is 'active'
   - Check if domain is authorized
   - Verify expiration date

2. **Updates not showing**
   - Check license validation
   - Verify update server is responding
   - Check WordPress update cache
   - Review server logs

3. **Domain authorization failed**
   - Check license type (single/multi/unlimited)
   - Verify domain count limits
   - Check authorized domains list

### **Debug Information**

Enable detailed logging:
```php
define('UKPA_DEBUG', true);
```

Check logs for detailed error information.

## **Best Practices**

### **1. License Management**
- Use strong, unique license keys
- Implement proper expiration handling
- Monitor for license abuse
- Provide clear customer support

### **2. Security**
- Use HTTPS for all communications
- Implement rate limiting
- Log all license checks
- Regular security audits

### **3. Customer Support**
- Clear documentation
- Easy license activation process
- Quick support response
- Proactive license renewal reminders

## **Scaling Considerations**

### **1. Database Optimization**
- Index frequently queried columns
- Archive old request logs
- Regular database maintenance
- Consider read replicas for high traffic

### **2. Server Performance**
- Use caching for license validation
- Implement CDN for update files
- Monitor server resources
- Scale horizontally as needed

### **3. Business Growth**
- Plan for increased license volume
- Consider automated license generation
- Implement customer self-service portal
- Develop partner/reseller program

## **Next Steps**

1. **Set up the database** with the provided schema
2. **Configure the update server** with your database credentials
3. **Test the system** with a few sample licenses
4. **Deploy to production** and start selling licenses
5. **Monitor and optimize** based on usage patterns

The license management system is now ready to help you monetize your plugin effectively! 