-- Database schema for the Admin Interface Application (admin-interface-app)
-- This schema will store data relevant to the administration of the platform,
-- such as client management, global settings, user account validation flags (if managed here),
-- and potentially aggregated analytics or platform health metrics.

-- The specific tables are yet to be fully defined based on the MVP features.
-- The brief mentions: "Permet de voir l'ensemble des données de chaque clients et de les gérer."
-- "Elle stoke les information dans la base de données"

-- Potential tables might include:
-- - clients (details of client organizations)
-- - platform_settings (global configurations)
-- - data_upload_logs (if admin manages or monitors data uploads)
-- - admin_users (if admin users are distinct from 'identification-app' users or have extended attributes here)

COMMENT ON SCHEMA public IS 'Schema for admin-interface-app. Specific tables to be defined. Manages client data, platform settings, etc.';
