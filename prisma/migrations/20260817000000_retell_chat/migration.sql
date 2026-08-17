-- AlterTable
ALTER TABLE `Business` ADD COLUMN `chatAgentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Conversation` ADD COLUMN `providerChatId` VARCHAR(191) NULL;
