create table if not exists comment (id SERIAL NOT NULL PRIMARY KEY, comment TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), likes integer DEFAULT 0, dislikes integer DEFAULT 0, geom geometry(Point, 4326));

create table if not exists drawnline (id SERIAL PRIMARY KEY, comment VARCHAR (300), color CHAR(7), width FLOAT(2),geom geometry(LINESTRING, 4326));

create table if not exists building (id SERIAL PRIMARY KEY, wallcolor CHAR(70), wallmaterial VARCHAR(20), roofcolor CHAR(70), roofmaterial VARCHAR(20), roofshape VARCHAR(20), roofheight FLOAT(4), height FLOAT(4), floors FLOAT, estimatedheight FLOAT(4), geom geometry(Geometry, 4326));

create table if not exists greenery (id SERIAL PRIMARY KEY, greentag VARCHAR(20), geom geometry(Geometry, 4326));

create table if not exists tree (id SERIAL PRIMARY KEY, geom geometry(Point, 4326));