drop table if exists project;
create table project (project_id TEXT unique, project_name TEXT, aoi jsonb);
insert into project (project_id, project_name, aoi) values ('0','Mainz', '{"xmin": 8.24287, "ymin": 49.992401, "xmax": 8.29617, "ymax": 50.018199}');