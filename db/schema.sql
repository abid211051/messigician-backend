\restrict dbmate

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: mess_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.mess_role AS ENUM (
    'owner',
    'manager',
    'member'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin',
    'moderator'
);


--
-- Name: cleanup_user_mess_membership(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_user_mess_membership() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE users
    SET mess_id = null, sub_mess_id = null
    WHERE users.id = OLD.user_id;

    RETURN OLD;
END;
$$;


--
-- Name: reset_mess_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reset_mess_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.mess_id IS NULL THEN
        NEW.mess_role = NULL;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: mess; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mess (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fname text NOT NULL,
    images jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: payment_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_histories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    sub_mess_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    note text,
    payment_date timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_histories_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    fname text,
    images jsonb DEFAULT '[]'::jsonb,
    phone character varying(20),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: sub_mess; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_mess (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mess_id uuid NOT NULL,
    fname text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sub_mess_infos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_mess_infos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sub_mess_id uuid NOT NULL,
    total_rent numeric(10,2),
    total_utility numeric(10,2),
    no_of_seats integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sub_mess_managers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_mess_managers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mess_id uuid NOT NULL,
    sub_mess_id uuid NOT NULL,
    is_owner boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sub_mess_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_mess_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    sub_mess_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    monthly_rent numeric(10,2),
    total_due numeric(10,2),
    total_paid numeric(10,2),
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    mess_role public.mess_role,
    ban boolean DEFAULT false,
    ban_reason text,
    mess_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sub_mess_id uuid
);


--
-- Name: users_join_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_join_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mess_id uuid NOT NULL,
    sub_mess_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mess mess_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mess
    ADD CONSTRAINT mess_pkey PRIMARY KEY (id);


--
-- Name: payment_histories payment_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_histories
    ADD CONSTRAINT payment_histories_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sub_mess_infos sub_mess_infos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_infos
    ADD CONSTRAINT sub_mess_infos_pkey PRIMARY KEY (id);


--
-- Name: sub_mess_infos sub_mess_infos_sub_mess_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_infos
    ADD CONSTRAINT sub_mess_infos_sub_mess_id_key UNIQUE (sub_mess_id);


--
-- Name: sub_mess_managers sub_mess_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_managers
    ADD CONSTRAINT sub_mess_managers_pkey PRIMARY KEY (id);


--
-- Name: sub_mess_members sub_mess_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_members
    ADD CONSTRAINT sub_mess_members_pkey PRIMARY KEY (id);


--
-- Name: sub_mess sub_mess_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess
    ADD CONSTRAINT sub_mess_pkey PRIMARY KEY (id);


--
-- Name: users_join_request unique_join_request; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_join_request
    ADD CONSTRAINT unique_join_request UNIQUE (user_id, sub_mess_id);


--
-- Name: sub_mess_managers unique_manager_sub_mess; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_managers
    ADD CONSTRAINT unique_manager_sub_mess UNIQUE (user_id, sub_mess_id);


--
-- Name: sub_mess_members unique_member_sub_mess; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_members
    ADD CONSTRAINT unique_member_sub_mess UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_join_request users_join_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_join_request
    ADD CONSTRAINT users_join_request_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: sub_mess_members cleanup_user_mess_membership_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cleanup_user_mess_membership_trigger AFTER DELETE ON public.sub_mess_members FOR EACH ROW EXECUTE FUNCTION public.cleanup_user_mess_membership();


--
-- Name: users trigger_reset_mess_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_reset_mess_role BEFORE UPDATE OF mess_id ON public.users FOR EACH ROW EXECUTE FUNCTION public.reset_mess_role();


--
-- Name: payment_histories update_payment_histories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_histories_updated_at BEFORE UPDATE ON public.payment_histories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sub_mess_infos update_sub_mess_infos_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sub_mess_infos_updated_at BEFORE UPDATE ON public.sub_mess_infos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sub_mess_members update_sub_mess_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sub_mess_members_updated_at BEFORE UPDATE ON public.sub_mess_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sub_mess_infos fk_sub_mess_infos_sub_mess; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_infos
    ADD CONSTRAINT fk_sub_mess_infos_sub_mess FOREIGN KEY (sub_mess_id) REFERENCES public.sub_mess(id) ON DELETE CASCADE;


--
-- Name: users fk_users_mess; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_mess FOREIGN KEY (mess_id) REFERENCES public.mess(id) ON DELETE SET NULL;


--
-- Name: payment_histories payment_histories_sub_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_histories
    ADD CONSTRAINT payment_histories_sub_mess_id_fkey FOREIGN KEY (sub_mess_id) REFERENCES public.sub_mess(id) ON DELETE CASCADE;


--
-- Name: payment_histories payment_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_histories
    ADD CONSTRAINT payment_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sub_mess_managers sub_mess_managers_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_managers
    ADD CONSTRAINT sub_mess_managers_mess_id_fkey FOREIGN KEY (mess_id) REFERENCES public.mess(id) ON DELETE CASCADE;


--
-- Name: sub_mess_managers sub_mess_managers_sub_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_managers
    ADD CONSTRAINT sub_mess_managers_sub_mess_id_fkey FOREIGN KEY (sub_mess_id) REFERENCES public.sub_mess(id) ON DELETE CASCADE;


--
-- Name: sub_mess_managers sub_mess_managers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_managers
    ADD CONSTRAINT sub_mess_managers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sub_mess_members sub_mess_members_sub_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_members
    ADD CONSTRAINT sub_mess_members_sub_mess_id_fkey FOREIGN KEY (sub_mess_id) REFERENCES public.sub_mess(id) ON DELETE CASCADE;


--
-- Name: sub_mess_members sub_mess_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess_members
    ADD CONSTRAINT sub_mess_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sub_mess sub_mess_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_mess
    ADD CONSTRAINT sub_mess_mess_id_fkey FOREIGN KEY (mess_id) REFERENCES public.mess(id) ON DELETE CASCADE;


--
-- Name: users_join_request users_join_request_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_join_request
    ADD CONSTRAINT users_join_request_mess_id_fkey FOREIGN KEY (mess_id) REFERENCES public.mess(id) ON DELETE CASCADE;


--
-- Name: users_join_request users_join_request_sub_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_join_request
    ADD CONSTRAINT users_join_request_sub_mess_id_fkey FOREIGN KEY (sub_mess_id) REFERENCES public.sub_mess(id) ON DELETE CASCADE;


--
-- Name: users_join_request users_join_request_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_join_request
    ADD CONSTRAINT users_join_request_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_sub_mess_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_sub_mess_id_fkey FOREIGN KEY (sub_mess_id) REFERENCES public.sub_mess(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260517133414'),
    ('20260517164233'),
    ('20260521185045'),
    ('20260525153325'),
    ('20260527155416');
