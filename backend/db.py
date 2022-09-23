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

# TH Hier wird die Zahl der Fulfillments aus der db gelesen und hochgesetzt und dieser Wert zurückgesendet

def add_fulfillment(quest_id):

  connection = connect()
  cursor = connection.cursor()

  ## Setup table
  insert_query_setup_table ='''
    create table if not exists quests (id serial primary key, fulfillment integer);
  '''
  cursor.execute(insert_query_setup_table)

  insert_query_quests_fulfillment= f'''
    
    update quests set fulfillment = fulfillment + 1 where id={quest_id};
  '''
  
  cursor.execute(insert_query_quests_fulfillment, (quest_id,))
  connection.commit()
  cursor.close()
  connection.close()




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


def get_trees_from_db():
  connection = connect()
  cursor = connection.cursor()
  get_trees_query =''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(tree.*)::json)
        )
        from tree
      ;
  '''
  cursor.execute(get_trees_query)
  trees = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return trees


def add_drawn_line(comment, width, color, geom):
  connection = connect()
  cursor = connection.cursor()
  
  insert_query_drawn_line= '''
    INSERT INTO drawnline (comment, width, color, geom) VALUES (%s,%s,%s, ST_SetSRID(st_astext(st_geomfromgeojson(%s)), 4326));

  '''
  cursor.execute(insert_query_drawn_line, (comment, width, color, geom,))
  connection.commit()
  cursor.close()
  connection.close()


def get_comments():
  connection = connect()
  cursor = connection.cursor()
  get_comment_query =''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(comment.*)::json)
        )
        from comment
      ;
  '''
  cursor.execute(get_comment_query)
  comments = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return comments

def like_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_like_query =''' UPDATE comment SET likes = likes + 1 where id = %s  ;'''
  cursor.execute(add_like_query, (commentid,))
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def unlike_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_unlike_query =''' UPDATE comment SET likes = likes - 1 where id = %s  ;'''
  cursor.execute(add_unlike_query, (commentid,))
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def dislike_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_dislike_query =''' UPDATE comment SET dislikes = dislikes + 1 where id = %s  ;'''
  cursor.execute(add_dislike_query, (commentid,))
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def undislike_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_undislike_query =''' UPDATE comment SET dislikes = dislikes - 1 where id = %s  ;'''
  cursor.execute(add_undislike_query, (commentid,))
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def init_driving_lane_table():
  connection = connect()
  cursor = connection.cursor()
  create_driving_lane_table_query =''' 
        drop table if exists driving_lane;
        drop table if exists driving_lane_polygon;
        create table driving_lane (id SERIAL PRIMARY KEY, lanes text, length float, maxspeed text, width text null,highway text, geom geometry(LINESTRING, 4326));
        create table driving_lane_polygon (id SERIAL PRIMARY KEY, lanes text, length float, maxspeed text, width text null,highway text, geom geometry(Geometry, 4326));
  '''
  cursor.execute(create_driving_lane_table_query)

  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def get_driving_lane_from_db():
  connection = connect()
  cursor = connection.cursor()
  get_driving_lane_query =''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(driving_lane.*)::json)
        )
        from driving_lane
      ;
  '''
  cursor.execute(get_driving_lane_query)
  driving_lane = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return driving_lane

def get_driving_lane_polygon_from_db():
  connection = connect()
  cursor = connection.cursor()
  get_driving_lane_polygon_query =''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(driving_lane_polygon.*)::json)
        )
        from driving_lane_polygon
      ;
  '''
  cursor.execute(get_driving_lane_polygon_query)
  driving_lane_polygon = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return driving_lane_polygon

def get_quests_from_db():
  connection = connect()
  cursor = connection.cursor()
  get_quests_from_db_query='''
  select * from quests;
  '''
  cursor.execute(get_quests_from_db_query)
  quests = cursor.fetchall()
  
  cursor.close()
  connection.close()
  return quests

def drop_greenery_table():
  connection = connect()
  cursor = connection.cursor()
  drop_greenery_table_query =''' delete from greenery;'''
  cursor.execute(drop_greenery_table_query)
  connection.commit()
  cursor.close()
  connection.close()
  
def drop_building_table():
  connection = connect()
  cursor = connection.cursor()
  drop_building_table_query =''' delete from building;'''
  cursor.execute(drop_building_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_tree_table():
  connection = connect()
  cursor = connection.cursor()
  drop_tree_table_query =''' delete from tree;'''
  cursor.execute(drop_tree_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_driving_lane_table():
  connection = connect()
  cursor = connection.cursor()
  drop_driving_lane_table_query =''' delete from driving_lane tree; delete from driving_lane_polygon'''
  cursor.execute(drop_driving_lane_table_query)
  connection.commit()
  cursor.close()
  connection.close()