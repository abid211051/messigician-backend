/*
  Warnings:

  - You are about to drop the column `fname` on the `mess` table. All the data in the column will be lost.
  - You are about to drop the column `fname` on the `sub_mess` table. All the data in the column will be lost.
  - You are about to drop the column `mess_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mess_role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `sub_mess_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `meal_deposits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meal_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meal_months` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meal_phases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meal_shopping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schema_migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sub_mess_infos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sub_mess_managers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sub_mess_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_join_request` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[join_code]` on the table `mess` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,mess_id]` on the table `sub_mess` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `join_code` to the `mess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `mess` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `mess` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `profiles` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `sub_mess` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `sub_mess` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ban` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "membership_status" AS ENUM ('active', 'left', 'removed');

-- CreateEnum
CREATE TYPE "join_request_status" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- DropForeignKey
ALTER TABLE "meal_deposits" DROP CONSTRAINT "meal_deposits_added_by_fkey";

-- DropForeignKey
ALTER TABLE "meal_deposits" DROP CONSTRAINT "meal_deposits_meal_month_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_deposits" DROP CONSTRAINT "meal_deposits_member_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_entries" DROP CONSTRAINT "meal_entries_meal_month_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_entries" DROP CONSTRAINT "meal_entries_member_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_entries" DROP CONSTRAINT "meal_entries_phase_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_months" DROP CONSTRAINT "meal_months_sub_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_phases" DROP CONSTRAINT "meal_phases_meal_month_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_shopping" DROP CONSTRAINT "meal_shopping_added_by_fkey";

-- DropForeignKey
ALTER TABLE "meal_shopping" DROP CONSTRAINT "meal_shopping_meal_month_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_shopping" DROP CONSTRAINT "meal_shopping_shopped_by_fkey";

-- DropForeignKey
ALTER TABLE "payment_histories" DROP CONSTRAINT "payment_histories_sub_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_histories" DROP CONSTRAINT "payment_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_mess" DROP CONSTRAINT "sub_mess_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_mess_infos" DROP CONSTRAINT "fk_sub_mess_infos_sub_mess";

-- DropForeignKey
ALTER TABLE "sub_mess_managers" DROP CONSTRAINT "sub_mess_managers_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_mess_managers" DROP CONSTRAINT "sub_mess_managers_sub_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_mess_managers" DROP CONSTRAINT "sub_mess_managers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_mess_members" DROP CONSTRAINT "sub_mess_members_sub_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_mess_members" DROP CONSTRAINT "sub_mess_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "fk_users_mess";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_sub_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "users_join_request" DROP CONSTRAINT "users_join_request_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "users_join_request" DROP CONSTRAINT "users_join_request_sub_mess_id_fkey";

-- DropForeignKey
ALTER TABLE "users_join_request" DROP CONSTRAINT "users_join_request_user_id_fkey";

-- AlterTable
ALTER TABLE "mess" DROP COLUMN "fname",
ADD COLUMN     "join_code" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "sub_mess" DROP COLUMN "fname",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "no_of_seats" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "total_rent" DECIMAL(10,2),
ADD COLUMN     "total_utility" DECIMAL(10,2),
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "mess_id",
DROP COLUMN "mess_role",
DROP COLUMN "sub_mess_id",
ALTER COLUMN "ban" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- DropTable
DROP TABLE "meal_deposits";

-- DropTable
DROP TABLE "meal_entries";

-- DropTable
DROP TABLE "meal_months";

-- DropTable
DROP TABLE "meal_phases";

-- DropTable
DROP TABLE "meal_shopping";

-- DropTable
DROP TABLE "payment_histories";

-- DropTable
DROP TABLE "schema_migrations";

-- DropTable
DROP TABLE "sub_mess_infos";

-- DropTable
DROP TABLE "sub_mess_managers";

-- DropTable
DROP TABLE "sub_mess_members";

-- DropTable
DROP TABLE "users_join_request";

-- DropEnum
DROP TYPE "meal_rate_type";

-- DropEnum
DROP TYPE "meal_status";

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "mess_id" UUID NOT NULL,
    "sub_mess_id" UUID,
    "role" "mess_role" NOT NULL,
    "status" "membership_status" NOT NULL DEFAULT 'active',
    "monthly_rent" DECIMAL(10,2),
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "join_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "mess_id" UUID NOT NULL,
    "sub_mess_id" UUID NOT NULL,
    "status" "join_request_status" NOT NULL DEFAULT 'pending',
    "decided_by" UUID,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");

-- CreateIndex
CREATE INDEX "memberships_mess_id_sub_mess_id_status_idx" ON "memberships"("mess_id", "sub_mess_id", "status");

-- CreateIndex
CREATE INDEX "join_requests_mess_id_status_idx" ON "join_requests"("mess_id", "status");

-- CreateIndex
CREATE INDEX "join_requests_user_id_idx" ON "join_requests"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mess_join_code_key" ON "mess"("join_code");

-- CreateIndex
CREATE INDEX "sub_mess_mess_id_idx" ON "sub_mess"("mess_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_mess_id_mess_id_key" ON "sub_mess"("id", "mess_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_mess" ADD CONSTRAINT "sub_mess_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_sub_mess_id_fkey" FOREIGN KEY ("sub_mess_id") REFERENCES "sub_mess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_sub_mess_id_mess_id_fkey" FOREIGN KEY ("sub_mess_id", "mess_id") REFERENCES "sub_mess"("id", "mess_id") ON DELETE CASCADE ON UPDATE CASCADE;
