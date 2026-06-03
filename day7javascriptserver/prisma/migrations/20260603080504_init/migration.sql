/*
  Warnings:

  - Added the required column `roll_no` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roll_no" TEXT NOT NULL;
