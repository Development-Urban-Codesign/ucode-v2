from functools import lru_cache
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


# def get_buildings_from_osm(wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom):
#   connection = connect()
#   cursor = connection.cursor()
  
#   insert_query_building= '''
#         INSERT INTO building (wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));

#   '''
#   cursor.execute(insert_query_building, (wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom,))

#   connection.commit()
#   cursor.close()
#   connection.close()
#   return "ok"

@lru_cache
def get_buildings_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_building_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(building.*)::json)
        )
        from building
        where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_building_query)
  building = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return building

def add_comment(projectId, comment, lng, lat):
  connection = connect()
  cursor = connection.cursor()
  
  insert_query_comment= '''
    INSERT INTO comment (project_id,comment, geom) VALUES (%s,%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326));

  '''
  cursor.execute(insert_query_comment, (projectId, comment, lng, lat,))
  connection.commit()
  cursor.close()
  connection.close()

# TH Hier wird die Zahl der Fulfillments aus der db gelesen und hochgesetzt und dieser Wert zurückgesendet

def add_fulfillment(quest_id, projectId):
  connection = connect()
  cursor = connection.cursor()

  ## Setup table
  # insert_query_setup_table ='''
  #   create table if not exists quests (id serial primary key, fulfillment integer);
  # '''
  # cursor.execute(insert_query_setup_table)

  insert_query_quests_fulfillment= f'''
    
    update quests set fulfillment = fulfillment + 1 where id={quest_id} and project_id='{projectId}';
  '''
  
  cursor.execute(insert_query_quests_fulfillment, ())
  connection.commit()
  cursor.close()
  connection.close()




# def store_greenery_from_osm(greentag, geom): #TODO  delete or refactor? is not beeing used atm because of loop from osm data.
#   connection = connect()
#   cursor = connection.cursor()
#   insert_query_greenery= '''
#         INSERT INTO greenery (greentag, geom) VALUES (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));

#   '''
#   cursor.execute(insert_query_greenery, (greentag, geom,))

#   connection.commit()
#   cursor.close()
#   connection.close()
#   return "ok"

def get_greenery_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_greenery_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(greenery.*)::json)
        )
        from greenery where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_greenery_query)
  greenery = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return greenery


def get_trees_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_trees_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(tree.*)::json)
        )
        from tree where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_trees_query)
  trees = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return trees


def add_drawn_line(projectId,comment, width, color, geom):
  connection = connect()
  cursor = connection.cursor()
  
  insert_query_drawn_line= '''
    INSERT INTO drawnline (project_id, comment, width, color, geom) VALUES (%s,%s,%s, ST_SetSRID(st_astext(st_geomfromgeojson(%s)), 4326));

  '''
  cursor.execute(insert_query_drawn_line, (projectId, comment, width, color, geom,))
  connection.commit()
  cursor.close()
  connection.close()


def get_comments(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_comment_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(comment.*)::json)
        )
        from comment where project_id='{projectId}'
      ;
  '''
  cursor.execute(get_comment_query)
  comments = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return comments

def like_comment(commentid, projectId):
  connection = connect()
  cursor = connection.cursor()
  add_like_query =f''' UPDATE comment SET likes = likes + 1 where id = {commentid} and project_id='{projectId}';'''
  cursor.execute(add_like_query, ())
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def unlike_comment(commentid, projectId):
  connection = connect()
  cursor = connection.cursor()
  add_unlike_query =f''' UPDATE comment SET likes = likes - 1 where id = {commentid} and project_id='{projectId}';'''
  cursor.execute(add_unlike_query, ())
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def dislike_comment(commentid, projectId):
  connection = connect()
  cursor = connection.cursor()
  add_dislike_query =f''' UPDATE comment SET dislikes = dislikes + 1 where id = {commentid} and project_id='{projectId}';'''
  cursor.execute(add_dislike_query, ())
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def undislike_comment(commentid, projectId):
  connection = connect()
  cursor = connection.cursor()
  add_undislike_query =f''' UPDATE comment SET dislikes = dislikes - 1 where id = {commentid} and project_id='{projectId}';'''
  cursor.execute(add_undislike_query, ())
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

# def init_driving_lane_table(): # Not used
#   connection = connect()
#   cursor = connection.cursor()
#   create_driving_lane_table_query =''' 
#         drop table if exists driving_lane;
#         drop table if exists driving_lane_polygon;
#         create table driving_lane (id SERIAL PRIMARY KEY, lanes text, length float, maxspeed text, width text null,highway text, geom geometry(LINESTRING, 4326));
#         create table driving_lane_polygon (id SERIAL PRIMARY KEY, lanes text, length float, maxspeed text, width text null,highway text, geom geometry(Geometry, 4326));
#   '''
#   cursor.execute(create_driving_lane_table_query)

#   connection.commit()
#   cursor.close()
#   connection.close()
#   return "ok"

def get_driving_lane_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_driving_lane_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(driving_lane.*)::json)
        )
        from driving_lane where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_driving_lane_query)
  driving_lane = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return driving_lane

def get_driving_lane_polygon_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_driving_lane_polygon_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(driving_lane_polygon.*)::json)
        )
        from driving_lane_polygon where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_driving_lane_polygon_query)
  driving_lane_polygon = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return driving_lane_polygon

def get_quests_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_quests_from_db_query=f'''
  select * from quests where project_id = '{projectId}';
  '''
  cursor.execute(get_quests_from_db_query)
  quests = cursor.fetchall()
  
  cursor.close()
  connection.close()
  return quests

def drop_greenery_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_greenery_table_query =f''' delete from greenery where project_id='{projectId}';'''
  cursor.execute(drop_greenery_table_query)
  connection.commit()
  cursor.close()
  connection.close()
  
def drop_building_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_building_table_query =f''' delete from building where project_id='{projectId}';'''
  cursor.execute(drop_building_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_tree_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_tree_table_query =f''' delete from tree where project_id='{projectId}';'''
  cursor.execute(drop_tree_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_driving_lane_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_driving_lane_table_query =f''' delete from driving_lane where project_id='{projectId}'; delete from driving_lane_polygon where project_id='{projectId}';'''
  cursor.execute(drop_driving_lane_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_traffic_signal_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_traffic_signal_table_query =f''' delete from traffic_signal where project_id='{projectId}';'''
  cursor.execute(drop_traffic_signal_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def get_traffic_signal_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_traffic_signal_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(traffic_signal.*)::json)
        )
        from traffic_signal where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_traffic_signal_query)
  traffic_signal = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return traffic_signal

def get_project_specification_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_project_specification_from_db_query =f''' 
      select json_agg(project.*) from project where project_id = '{projectId}';
  '''
  cursor.execute(get_project_specification_from_db_query)
  bbox = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return bbox

def get_routes_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_routes_query = f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(routes.*)::json)
        )
        from routes
        where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_routes_query)
  routes = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return routes