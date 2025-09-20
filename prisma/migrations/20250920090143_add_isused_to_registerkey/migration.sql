-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegisterKey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_RegisterKey" ("createdAt", "expiresAt", "id", "key") SELECT "createdAt", "expiresAt", "id", "key" FROM "RegisterKey";
DROP TABLE "RegisterKey";
ALTER TABLE "new_RegisterKey" RENAME TO "RegisterKey";
CREATE UNIQUE INDEX "RegisterKey_key_key" ON "RegisterKey"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
