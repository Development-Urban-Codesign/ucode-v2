create table if not exists water (id SERIAL PRIMARY KEY, project_id TEXT, geom geometry(Geometry, 4326));