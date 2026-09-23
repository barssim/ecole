ALTER TABLE tb_user
    ADD COLUMN firstname_en VARCHAR(255) NULL AFTER firstname,
    ADD COLUMN firstname_fr VARCHAR(255) NULL AFTER firstname_en,
    ADD COLUMN firstname_ar VARCHAR(255) NULL AFTER firstname_fr;

UPDATE tb_user
SET firstname_en = COALESCE(firstname_en, firstname),
    firstname_fr = COALESCE(firstname_fr, firstname),
    firstname_ar = COALESCE(firstname_ar, firstname);
