-- pulsur/admin-interface-app/db/init.sql

-- Database schema for the Admin Interface Application (admin-interface-app)
-- This schema will store data relevant to the administration of the platform,
-- such as tracking uploaded data, managing persona algorithm parameters (future), 
-- and logging persona refinements.

-- Table to track uploaded data files/batches
CREATE TABLE IF NOT EXISTS data_uploads (
    id SERIAL PRIMARY KEY,
    upload_id VARCHAR(255) UNIQUE NOT NULL, -- Could be the uploadId from DataUploadResponse
    file_name VARCHAR(255) NOT NULL,
    data_source_name VARCHAR(255), -- User-defined name for the source
    data_type VARCHAR(50) NOT NULL, -- e.g., 'survey', 'social_media_twitter', 'external_dataset'
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_user_id INTEGER, -- Link to the admin user who performed the upload (from identification-app)
    processing_status VARCHAR(50) DEFAULT 'received', -- e.g., 'received', 'validating', 'processing', 'completed', 'failed'
    record_count INTEGER,
    error_details TEXT, -- To store any error messages during processing
    storage_path VARCHAR(1024) -- Path to where the file is stored, if applicable
);

COMMENT ON TABLE data_uploads IS 'Tracks metadata and status of manually uploaded data files/batches.';
COMMENT ON COLUMN data_uploads.processing_status IS 'Current status of the uploaded file processing pipeline.';

-- Table to log persona refinement actions
-- This provides an audit trail of changes made by administrators.
CREATE TABLE IF NOT EXISTS persona_refinement_log (
    id SERIAL PRIMARY KEY,
    persona_id_affected VARCHAR(255) NOT NULL, -- The ID of the persona that was refined
    admin_user_id INTEGER NOT NULL, -- Link to the admin user who made the change
    refinement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action_taken TEXT NOT NULL, -- Description of the refinement (e.g., merged, split, criteria_changed)
    details_before JSONB, -- Optional: Persona details before refinement (conceptual)
    details_after JSONB, -- Optional: Persona details after refinement (conceptual)
    notes TEXT -- Admin notes about why the refinement was made
);

COMMENT ON TABLE persona_refinement_log IS 'Logs actions taken by administrators to refine persona classifications.';

-- Future tables might include:
-- - application_settings (for global settings managed by admin)
-- - client_management (if admin directly manages client accounts/subscriptions here)
