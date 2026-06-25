# Deployment Guide for Karur Build Expo 2026

Follow these steps to deploy the Karur Build Expo 2026 Stall Booking System on Hostinger Shared Hosting (cPanel).

## 1. Database Setup
1. Log in to your Hostinger cPanel / hPanel.
2. Go to **MySQL Databases** and create a new database (e.g., `build_expo_2026`).
3. Create a new database user and assign it to the database with all privileges.
4. Note down the Database Name, Username, and Password.
5. Open phpMyAdmin, select your database, and import the `database/schema.sql` file provided in this repository.

## 2. Backend API Deployment
1. Go to **File Manager**.
2. Upload the contents of the `backend/` folder to a designated API directory, for example, `public_html/api/`.
3. Before deploying, you need to install the dependencies:
   - Option A (SSH): If you have SSH access to Hostinger, navigate to `public_html/api/` and run `composer install`.
   - Option B (Local): If no SSH access, install dependencies locally by running `composer install` in your `backend/` folder on your PC, then upload the entire `backend/` folder including the `vendor/` directory to Hostinger.
4. Edit `public_html/api/config/Database.php` to match the Hostinger MySQL credentials you created in Step 1.
5. Edit `public_html/api/utils/EmailSender.php` and uncomment the SMTP configuration lines. Update them with your Hostinger Email credentials for `info@karurbuildexpo.com`.
6. Edit `public_html/api/controllers/AuthController.php` and change the `secret_key` to a strong random string for production.

## 3. Frontend Deployment
1. On your local machine, navigate to the `frontend/` folder.
2. Open `src/services/api.js` and change the `baseURL` from `http://localhost:8000/index.php` to your actual Hostinger API URL (e.g., `https://yourdomain.com/api/index.php`).
3. Run the following command to build the React application:
   ```bash
   npm run build
   ```
4. This will create a `dist/` folder inside `frontend/`.
5. Upload the contents of the `dist/` folder directly to the `public_html/` folder on Hostinger (or whatever folder serves your main domain).
6. Ensure that an `.htaccess` file exists in `public_html/` to handle React Router navigation:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

## 4. Admin Initialization
The `database/schema.sql` file includes a query to create a default admin user. 
To create a secure password, create a temporary PHP file `hash.php` on your server:
```php
<?php
echo password_hash("YOUR_SECURE_PASSWORD", PASSWORD_BCRYPT);
?>
```
Run this file to get the hash, and update the `password_hash` column in the `admins` table in phpMyAdmin for the username `admin`.

## 5. Directory Permissions
Ensure that the `uploads/pdfs` and `uploads` directories in your API folder have `755` permissions so that PHP can write generated PDF files and save uploaded logos/profiles.

Congratulations! Your system is now deployed.
