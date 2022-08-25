import psycopg2
from os import getenv

dbConfig = {
    'host': getenv('DB_HOST', 'localhost'),
    'port': getenv('DB_PORT', 5432),
    'dbname': getenv('DB_NAME', 'ucode'),
    'user': getenv('DB_USER', 'postgres'),
    'password': getenv('DB_PASSWORD', 'postgres')
}

def connect():
  return psycopg2.connect(
    host=dbConfig['host'],
    port=dbConfig['port'], 
    dbname=dbConfig['dbname'], 
    user=dbConfig['user'], 
    password=dbConfig['password'])

def get_table_names():
  conn = connect()
  cur = conn.cursor()
  cur.execute(""" select table_name from information_schema.columns where column_name = 'geom' """)
  tables = cur.fetchall()
  cur.close()
  conn.close()
  return tables


def init_building_table():
  connection = connect()
  cursor = connection.cursor()
  create_building_table_query =''' 
        drop table if exists building;
        create table building (id SERIAL PRIMARY KEY, wallcolor CHAR(7), wallmaterial VARCHAR(20), roofcolor CHAR(7), roofmaterial VARCHAR(20), roofshape VARCHAR(20), roofheight FLOAT(4), height FLOAT(4), floors FLOAT, estimatedheight FLOAT(4), geom geometry(Geometry, 4326));
  '''
  cursor.execute(create_building_table_query)

  connection.commit()
  cursor.close()
  connection.close()
  return "ok"


def get_buildings_from_osm(wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom):
  connection = connect()
  cursor = connection.cursor()
  
  insert_query_building= '''
        INSERT INTO building (wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));

  '''
  cursor.execute(insert_query_building, (wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom,))

  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def get_buildings_from_db():
  connection = connect()
  cursor = connection.cursor()
  get_building_query =''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(building.*)::json)
        )
        from building
      ;
  '''
  cursor.execute(get_building_query)
  building = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return building

def add_comment(comment, lng, lat):
  connection = connect()
  cursor = connection.cursor()
  
  insert_query_comment= '''
    INSERT INTO comment (comment, geom) VALUES (%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326));

  '''
  cursor.execute(insert_query_comment, (comment, lng, lat,))
  connection.commit()
  cursor.close()
  connection.close()

def init_greenery_table():
  connection = connect()
  cursor = connection.cursor()
  create_greenery_table_query =''' 
        drop table if exists greenery;
        create table greenery (id SERIAL PRIMARY KEY, greentag VARCHAR(20), geom geometry(Geometry, 4326));
  '''
  cursor.execute(create_greenery_table_query)

  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def store_greenery_from_osm(greentag, geom):
  connection = connect()
  cursor = connection.cursor()
  insert_query_greenery= '''
        INSERT INTO greenery (greentag, geom) VALUES (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));

  '''
  cursor.execute(insert_query_greenery, (greentag, geom,))

  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def get_greenery_from_db():
  connection = connect()
  cursor = connection.cursor()
  get_greenery_query =''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(greenery.*)::json)
        )
        from greenery
      ;
  '''
  cursor.execute(get_greenery_query)
  greenery = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return greenery


def add_drawn_line(comment, width, color, geom):
  connection = connect()
  cursor = connection.cursor()
  
  insert_query_drawn_line= '''
    create table if not exists drawnline (id SERIAL PRIMARY KEY, comment VARCHAR (300), color CHAR(7), width FLOAT(2),geom geometry(LINESTRING, 4326));
    INSERT INTO drawnline (comment, width, color, geom) VALUES (%s,%s,%s, ST_SetSRID(st_astext(st_geomfromgeojson(%s)), 4326));

  '''
  cursor.execute(insert_query_drawn_line, (comment, width, color, geom,))
  connection.commit()
  cursor.close()
  connection.close()
  