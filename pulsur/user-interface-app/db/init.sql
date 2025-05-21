-- Database schema for the User Interface Application (user-interface-app)
-- This schema will store data relevant to user dashboards, saved visualizations,
-- user-specific settings, and potentially data related to the client-specific IAM.

-- The specific tables are yet to be fully defined based on the MVP features
-- for data visualization, user preferences, and client-side user management (IAM by 'Principal' role).

-- Potential tables might include:
-- - user_dashboards (to save customized dashboard layouts)
-- - saved_filters (for recurring data views)
-- - client_users (if the 'Principal' user can create sub-accounts managed by this app)
-- - user_preferences (display settings, notification preferences linked to UI)

COMMENT ON SCHEMA public IS 'Schema for user-interface-app. Specific tables to be defined based on MVP data visualization and IAM features.';
