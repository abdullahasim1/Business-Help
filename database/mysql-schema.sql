-- AI Chat + Call Widget: simple five-table MySQL schema.
-- Run this as a MySQL administrator only for a new, empty database.
-- Change the password before running this file.

CREATE DATABASE IF NOT EXISTS ai_widget_mvp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'widget_user'@'localhost'
  IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
CREATE USER IF NOT EXISTS 'widget_user'@'127.0.0.1'
  IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

GRANT ALL PRIVILEGES ON ai_widget_mvp.* TO 'widget_user'@'localhost';
GRANT ALL PRIVILEGES ON ai_widget_mvp.* TO 'widget_user'@'127.0.0.1';
FLUSH PRIVILEGES;

USE ai_widget_mvp;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'BUSINESS_ADMIN') NOT NULL,
    `businessId` INTEGER NULL,
    `sessionTokenHash` VARCHAR(191) NULL,
    `sessionExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_sessionTokenHash_key`(`sessionTokenHash`),
    INDEX `User_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `agentName` VARCHAR(191) NOT NULL,
    `agentInstructions` TEXT NOT NULL,
    `agentLanguage` VARCHAR(191) NOT NULL DEFAULT 'English',
    `agentTone` VARCHAR(191) NOT NULL DEFAULT 'Helpful',
    `agentStatus` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `voiceAgentId` VARCHAR(191) NULL,
    `knowledgeText` LONGTEXT NULL,
    `welcomeMessage` VARCHAR(191) NOT NULL DEFAULT 'Hi! How can I help today?',
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#0f766e',
    `callEnabled` BOOLEAN NOT NULL DEFAULT true,
    `chatEnabled` BOOLEAN NOT NULL DEFAULT true,
    `publicKey` VARCHAR(191) NOT NULL,
    `allowedOrigins` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Business_publicKey_key`(`publicKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `interestedService` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'QUALIFIED', 'WON', 'LOST') NOT NULL DEFAULT 'NEW',
    `source` VARCHAR(191) NOT NULL DEFAULT 'AI Widget',
    `visitorToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Contact_visitorToken_key`(`visitorToken`),
    INDEX `Contact_businessId_idx`(`businessId`),
    INDEX `Contact_email_idx`(`email`),
    INDEX `Contact_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `contactId` INTEGER NULL,
    `channel` ENUM('WIDGET', 'DASHBOARD') NOT NULL DEFAULT 'WIDGET',
    `visitorToken` VARCHAR(191) NULL,
    `messagesJson` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Conversation_businessId_idx`(`businessId`),
    INDEX `Conversation_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Call` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerCallId` VARCHAR(191) NULL,
    `businessId` INTEGER NOT NULL,
    `contactId` INTEGER NULL,
    `duration` INTEGER NULL,
    `transcript` LONGTEXT NULL,
    `summary` TEXT NULL,
    `recordingUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Call_providerCallId_key`(`providerCallId`),
    INDEX `Call_businessId_idx`(`businessId`),
    INDEX `Call_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Call` ADD CONSTRAINT `Call_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Call` ADD CONSTRAINT `Call_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
