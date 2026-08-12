-- CreateTable: Explicit ComboItem join model
CREATE TABLE "ComboItem" (
    "comboId" TEXT NOT NULL,
    "ebookId" TEXT NOT NULL,

    CONSTRAINT "ComboItem_pkey" PRIMARY KEY ("comboId","ebookId")
);

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Ebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_ebookId_fkey" FOREIGN KEY ("ebookId") REFERENCES "Ebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate data from implicit _ComboItems join table to explicit ComboItem
INSERT INTO "ComboItem" ("comboId", "ebookId")
SELECT "A", "B" FROM "_ComboItems"
ON CONFLICT DO NOTHING;

-- DropForeignKey (implicit relation)
ALTER TABLE "_ComboItems" DROP CONSTRAINT IF EXISTS "_ComboItems_A_fkey";
ALTER TABLE "_ComboItems" DROP CONSTRAINT IF EXISTS "_ComboItems_B_fkey";

-- DropTable (implicit join table)
DROP TABLE IF EXISTS "_ComboItems";
