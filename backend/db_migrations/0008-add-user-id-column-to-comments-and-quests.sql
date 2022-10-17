alter table comment 
ADD COLUMN IF NOT EXISTS user_id TEXT;
update comment set user_id = '0';
alter table quests 
ADD COLUMN IF NOT EXISTS user_id TEXT;
update quests set user_id = '0';
