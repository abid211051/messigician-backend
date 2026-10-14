-- This is an empty migration.

-- =========================================================
-- 1. Shared function: automatically update updated_at
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- =========================================================
-- 2. Function: clear user mess membership on member deletion
-- =========================================================

CREATE OR REPLACE FUNCTION public.cleanup_user_mess_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.users
    SET mess_id = NULL,
        sub_mess_id = NULL
    WHERE id = OLD.user_id;

    RETURN OLD;
END;
$$;


-- =========================================================
-- 3. Function: reset mess_role when mess_id becomes NULL
-- =========================================================

CREATE OR REPLACE FUNCTION public.reset_mess_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.mess_id IS NULL THEN
        NEW.mess_role = NULL;
    END IF;

    RETURN NEW;
END;
$$;


-- =========================================================
-- 4. updated_at triggers
-- =========================================================

CREATE TRIGGER trg_meal_deposits_updated_at
BEFORE UPDATE ON public.meal_deposits
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER trg_meal_entries_updated_at
BEFORE UPDATE ON public.meal_entries
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER trg_meal_months_updated_at
BEFORE UPDATE ON public.meal_months
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER trg_meal_shopping_updated_at
BEFORE UPDATE ON public.meal_shopping
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER update_payment_histories_updated_at
BEFORE UPDATE ON public.payment_histories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER update_sub_mess_infos_updated_at
BEFORE UPDATE ON public.sub_mess_infos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER update_sub_mess_members_updated_at
BEFORE UPDATE ON public.sub_mess_members
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- =========================================================
-- 5. Reset mess_role when mess_id is NULL
-- =========================================================

CREATE TRIGGER trigger_reset_mess_role
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.reset_mess_role();


-- =========================================================
-- 6. Clean up user membership after deleting a membership
-- =========================================================

CREATE TRIGGER cleanup_user_mess_membership_trigger
AFTER DELETE ON public.sub_mess_members
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_user_mess_membership();