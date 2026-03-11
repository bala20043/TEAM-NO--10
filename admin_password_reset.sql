-- ==========================================================
-- ADMIN PASSWORD RESET TOOL SETUP
-- ==========================================================
-- Run this script in the Supabase SQL Editor to enable 
-- administrative password resets via the app dashboard.

-- 1. Enable pgcrypto extension (required for crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the password reset function
CREATE OR REPLACE FUNCTION public.admin_reset_password(target_email TEXT, new_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges
SET search_path = auth, public
AS $$
DECLARE
    target_user_id UUID;
    caller_role TEXT;
BEGIN
    -- A. Security Check: Is the caller an admin?
    SELECT role INTO caller_role 
    FROM public.users 
    WHERE auth_id = auth.uid();

    IF caller_role != 'admin' OR caller_role IS NULL THEN
        RETURN json_build_object('error', 'Unauthorized: Only administrators can reset passwords.');
    END IF;

    -- B. Find the Auth ID for the target email
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RETURN json_build_object('error', 'User not found in authentication system.');
    END IF;

    -- C. Update the password
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = target_user_id;

    RETURN json_build_object('message', 'Password reset successfully for ' || target_email);
END;
$$;

-- 3. Grant access to the function
GRANT EXECUTE ON FUNCTION public.admin_reset_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_password(TEXT, TEXT) TO service_role;

-- 4. Verification Note
-- You can now call this function from the frontend using:
-- supabase.rpc('admin_reset_password', { target_email: '...', new_password: '...' })
