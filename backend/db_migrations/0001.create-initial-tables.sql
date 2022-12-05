create table if not exists comment (id SERIAL NOT NULL PRIMARY KEY, comment TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), likes integer DEFAULT 0, dislikes integer DEFAULT 0, geom geometry(Point, 4326));

create table if not exists drawnline (id SERIAL PRIMARY KEY, comment VARCHAR (300), color CHAR(7), width FLOAT(2),geom geometry(LINESTRING, 4326));

create table if not exists building (id SERIAL PRIMARY KEY, wallcolor CHAR(70), wallmaterial VARCHAR(20), roofcolor CHAR(70), roofmaterial VARCHAR(20), roofshape VARCHAR(20), roofheight FLOAT(4), height FLOAT(4), floors FLOAT, estimatedheight FLOAT(4), geom geometry(Geometry, 4326));
ALTER TABLE building ADD COLUMN IF NOT EXISTS amenity VARCHAR(100) NULL;

create table if not exists greenery (id SERIAL PRIMARY KEY, greentag VARCHAR(20), geom geometry(Geometry, 4326));

create table if not exists tree (id SERIAL PRIMARY KEY, geom geometry(Point, 4326));

create table if not exists driving_lane (id SERIAL PRIMARY KEY, lanes text, length float, maxspeed text, width text null,highway text, geom geometry(LINESTRING, 4326));

create table if not exists driving_lane_polygon (id SERIAL PRIMARY KEY, lanes text, length float, maxspeed text, width text null,highway text, geom geometry(Geometry, 4326));

create table if not exists routes (id SERIAL PRIMARY KEY, title VARCHAR (300), color CHAR(7), width FLOAT(2),geom geometry(LINESTRING, 4326));

create table if not exists traffic_signal (id SERIAL PRIMARY KEY, geom geometry(Point, 4326));

create table if not exists tram_line (id SERIAL PRIMARY KEY, project_id TEXT, lane_name text, starts_from text, arrives_to text, geom geometry(Geometry, 4326));

create table if not exists sidewalk (id SERIAL PRIMARY KEY, project_id TEXT, highway TEXT, geom geometry(LINESTRING, 4326));

create table if not exists sidewalk_polygon (id SERIAL PRIMARY KEY, project_id TEXT, geom geometry(Geometry, 4326));

create table if not exists bike (id SERIAL PRIMARY KEY, project_id TEXT, oneway TEXT null, highway TEXT null, service_type TEXT null, lanes TEXt null, geom geometry(LINESTRING, 4326));
