alter table comment 
ADD COLUMN project_id TEXT;

alter table drawnline 
ADD COLUMN project_id TEXT;

alter table building 
ADD COLUMN project_id TEXT;

alter table greenery 
ADD COLUMN project_id TEXT;

alter table tree 
ADD COLUMN project_id TEXT;

alter table driving_lane 
ADD COLUMN project_id TEXT;

alter table driving_lane_polygon 
ADD COLUMN project_id TEXT;

alter table routes 
ADD COLUMN project_id TEXT;

alter table traffic_signal 
ADD COLUMN project_id TEXT;
