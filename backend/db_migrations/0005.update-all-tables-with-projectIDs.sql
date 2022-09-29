alter table comment 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update comment set project_id = '0';


alter table drawnline 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update drawnline set project_id = '0';

alter table building 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update building set project_id = '0';

alter table greenery 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update greenery set project_id = '0';

alter table tree 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update tree set project_id = '0';

alter table driving_lane 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update driving_lane set project_id = '0';

alter table driving_lane_polygon 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update driving_lane_polygon set project_id = '0';

alter table routes 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update routes set project_id = '0';

alter table traffic_signal 
ADD COLUMN IF NOT EXISTS project_id TEXT;
update traffic_signal set project_id = '0';
