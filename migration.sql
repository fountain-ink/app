-- 1. Add is_collaborative column to the drafts table
-- This column will store a boolean indicating whether a draft is collaborative or not.
-- Defaults to FALSE for existing and new non-collaborative drafts.
ALTER TABLE drafts
ADD COLUMN is_collaborative BOOLEAN DEFAULT FALSE;

-- Update existing rows to have a default value for is_collaborative if they don't already.
-- For rows where y_doc IS NULL, is_collaborative will be FALSE (due to DEFAULT FALSE).
-- For rows where y_doc IS NOT NULL, we might assume they were intended to be collaborative.
-- However, since the application logic for setting is_collaborative=true is new,
-- it's safer to leave existing rows as FALSE unless explicitly updated by the application.
-- If a blanket update was desired for existing y_docs:
-- UPDATE drafts SET is_collaborative = TRUE WHERE y_doc IS NOT NULL AND is_collaborative IS DISTINCT FROM TRUE;
-- For now, relying on the DEFAULT FALSE and future application updates is preferred.


-- 2. Ensure y_doc column is nullable
-- This column stores the Yjs document state for collaborative drafts.
-- It should be nullable to support drafts that are not (yet) collaborative.
-- If the column was initially created as NOT NULL, the following command would make it nullable.
-- If it's already nullable, this command might result in an error or do nothing, depending on the RDBMS.
-- It's often better to ensure this during table creation or via a conditional check if possible.
-- Assuming 'y_doc' is the snake_case name for the 'bytea' column.
-- ALTER TABLE drafts ALTER COLUMN y_doc DROP NOT NULL;
-- Note: This step is often handled during initial table setup or a previous migration.
-- If 'y_doc' was created as nullable, no action is needed here. The default for ADD COLUMN is nullable unless specified.


-- 3. Add content_markdown column to the drafts table
-- This column will store the markdown representation of the draft's content.
-- It is nullable as markdown generation might be optional or done on demand.
ALTER TABLE drafts
ADD COLUMN content_markdown TEXT NULL;

-- Notes on column naming and Supabase:
-- The JavaScript application uses camelCase (e.g., isCollaborative, contentMarkdown, yDoc).
-- Supabase client libraries typically map these to snake_case column names in PostgreSQL
-- (e.g., is_collaborative, content_markdown, y_doc) by default.
-- The SQL commands above use snake_case, which is standard.
-- If columns were created with quoted camelCase names (e.g., "contentMarkdown"),
-- then the ALTER TABLE statements would need to use those exact quoted names.
-- It is assumed that `title`, `subtitle`, and `cover_url` (TEXT) already exist and are nullable.
-- It is assumed that `content_json` (JSONB) and `y_doc` (BYTEA, nullable) already exist.
-- The `published_id` column is also assumed to exist.
-- The `author` column (TEXT or UUID, referencing users/profiles) is assumed to exist.
-- Timestamps `created_at` and `updated_at` (TIMESTAMPTZ) are assumed to exist.
```
