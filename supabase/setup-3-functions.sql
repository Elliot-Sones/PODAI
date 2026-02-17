-- Part 3: Functions

CREATE OR REPLACE FUNCTION "public"."episode_state"("status" "jsonb") RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    started_at TIMESTAMP;
    completed_at TIMESTAMP;
    message TEXT;
BEGIN
    started_at := (status ->> 'startedAt')::TIMESTAMP;
    completed_at := (status ->> 'completedAt')::TIMESTAMP;
    message := status ->> 'message';
    IF started_at IS NULL THEN
        RETURN 'pending';
    ELSIF started_at IS NOT NULL AND completed_at IS NOT NULL AND message IS NOT NULL AND message LIKE 'Error%' THEN
        RETURN 'error';
    ELSIF started_at IS NOT NULL AND completed_at IS NULL THEN
        RETURN 'processing';
    ELSE
        RETURN 'ready';
    END IF;
END;
$$;
