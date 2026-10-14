-- CreateEnum
CREATE TYPE "meal_rate_type" AS ENUM ('dynamic', 'fixed');

-- CreateEnum
CREATE TYPE "meal_status" AS ENUM ('active', 'closed');

-- CreateEnum
CREATE TYPE "mess_role" AS ENUM ('owner', 'manager', 'member');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin', 'moderator');

-- CreateTable
CREATE TABLE "meal_deposits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meal_month_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "added_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meal_month_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "phase_id" UUID NOT NULL,
    "day_number" SMALLINT NOT NULL,
    "count" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_months" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sub_mess_id" UUID NOT NULL,
    "meal_year" SMALLINT NOT NULL,
    "meal_month" SMALLINT NOT NULL,
    "meal_status" "meal_status" NOT NULL DEFAULT 'active',
    "rate_type" "meal_rate_type" NOT NULL DEFAULT 'dynamic',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_months_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_phases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meal_month_id" UUID NOT NULL,
    "phase_name" TEXT NOT NULL,
    "phase_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "edit_start" TIME(6) NOT NULL DEFAULT '00:00:00'::time without time zone,
    "edit_end" TIME(6) NOT NULL DEFAULT '23:59:59'::time without time zone,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_shopping" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meal_month_id" UUID NOT NULL,
    "day_number" SMALLINT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "shopped_by" UUID NOT NULL,
    "added_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_shopping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fname" TEXT NOT NULL,
    "images" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "sub_mess_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "payment_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "fname" TEXT,
    "images" JSONB DEFAULT '[]',
    "phone" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_migrations" (
    "version" VARCHAR NOT NULL,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "sub_mess" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mess_id" UUID NOT NULL,
    "fname" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_mess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_mess_infos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sub_mess_id" UUID NOT NULL,
    "total_rent" DECIMAL(10,2),
    "total_utility" DECIMAL(10,2),
    "no_of_seats" INTEGER DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_mess_infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_mess_managers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "mess_id" UUID NOT NULL,
    "sub_mess_id" UUID NOT NULL,
    "is_owner" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_mess_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_mess_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "sub_mess_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "monthly_rent" DECIMAL(10,2),
    "total_due" DECIMAL(10,2),
    "total_paid" DECIMAL(10,2),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_mess_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "ban" BOOLEAN DEFAULT false,
    "ban_reason" TEXT,
    "mess_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "mess_role" "mess_role",
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sub_mess_id" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_join_request" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "mess_id" UUID NOT NULL,
    "sub_mess_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_join_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_meal_deposits_member" ON "meal_deposits"("meal_month_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_entries_meal_month_id_member_id_day_number_phase_id_key" ON "meal_entries"("meal_month_id", "member_id", "day_number", "phase_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_months_sub_mess_id_meal_year_meal_month_key" ON "meal_months"("sub_mess_id", "meal_year", "meal_month");

-- CreateIndex
CREATE INDEX "idx_meal_phases_month" ON "meal_phases"("meal_month_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_meal_shopping_month" ON "meal_shopping"("meal_month_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_mess_infos_sub_mess_id_key" ON "sub_mess_infos"("sub_mess_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_mess_managers_user_id_sub_mess_id_key" ON "sub_mess_managers"("user_id", "sub_mess_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_member_sub_mess" ON "sub_mess_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_join_request" ON "users_join_request"("user_id", "sub_mess_id");

-- AddForeignKey
ALTER TABLE "meal_deposits" ADD CONSTRAINT "meal_deposits_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_deposits" ADD CONSTRAINT "meal_deposits_meal_month_id_fkey" FOREIGN KEY ("meal_month_id") REFERENCES "meal_months"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_deposits" ADD CONSTRAINT "meal_deposits_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "sub_mess_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_meal_month_id_fkey" FOREIGN KEY ("meal_month_id") REFERENCES "meal_months"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "sub_mess_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "meal_phases"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_months" ADD CONSTRAINT "meal_months_sub_mess_id_fkey" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_phases" ADD CONSTRAINT "meal_phases_meal_month_id_fkey" FOREIGN KEY ("meal_month_id") REFERENCES "meal_months"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_shopping" ADD CONSTRAINT "meal_shopping_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_shopping" ADD CONSTRAINT "meal_shopping_meal_month_id_fkey" FOREIGN KEY ("meal_month_id") REFERENCES "meal_months"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meal_shopping" ADD CONSTRAINT "meal_shopping_shopped_by_fkey" FOREIGN KEY ("shopped_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_histories" ADD CONSTRAINT "payment_histories_sub_mess_id_fkey" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_histories" ADD CONSTRAINT "payment_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_mess" ADD CONSTRAINT "sub_mess_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_mess_infos" ADD CONSTRAINT "fk_sub_mess_infos_sub_mess" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_mess_managers" ADD CONSTRAINT "sub_mess_managers_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_mess_managers" ADD CONSTRAINT "sub_mess_managers_sub_mess_id_fkey" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_mess_managers" ADD CONSTRAINT "sub_mess_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_mess_members" ADD CONSTRAINT "sub_mess_members_sub_mess_id_fkey" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_mess_members" ADD CONSTRAINT "sub_mess_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_mess" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sub_mess_id_fkey" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_join_request" ADD CONSTRAINT "users_join_request_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_join_request" ADD CONSTRAINT "users_join_request_sub_mess_id_fkey" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_join_request" ADD CONSTRAINT "users_join_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
