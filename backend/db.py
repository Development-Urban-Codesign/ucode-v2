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

def add_comment(userId, projectId, comment, lng, lat):
  connection = connect()
  cursor = connection.cursor()
  
  insert_query_comment= '''
    INSERT INTO comment (user_id,project_id,comment, geom) VALUES (%s,%s,%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326));

  '''
  cursor.execute(insert_query_comment, (userId, projectId, comment, lng, lat,))
  connection.commit()
  cursor.close()
  connection.close()

def add_fulfillment(questId, userId):
  connection = connect()
  cursor = connection.cursor()
  insert_query_quests_fulfillment= f'''  
    update quests_user set fulfillment = fulfillment + 1 where quest_id={questId} and user_id='{userId}';
  '''
  cursor.execute(insert_query_quests_fulfillment, ())

  get_fulfillment_value = f'''  
    select fulfillment from quests_user where quest_id={questId} and user_id='{userId}';
  '''
  cursor.execute(get_fulfillment_value)
  updated_fulfillment_tuple = cursor.fetchall()
  updated_fulfillment =  int(updated_fulfillment_tuple[0][0]) 
  connection.commit()
  cursor.close()
  connection.close()
  return updated_fulfillment

@lru_cache
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

@lru_cache
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

def delete_comments(projectId):
  connection = connect()
  cursor = connection.cursor()
  delete_comments_query =f''' delete from comment where project_id='{projectId}';'''
  cursor.execute(delete_comments_query)
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
  connection.close
  return comments


def get_filtered_comments_with_status(projectId,userId):
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

  # rename all usernames with "anonymous" when not the current user
  for f in comments["features"]:
        currentUser = f["properties"]["user_id"]
        if str(userId) != str(currentUser):
          f["properties"]["user_id"] = "anonymous"

  cursor.close()
  connection.close()
  return comments


def get_filtered_comments(projectId,userId):
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

  # rename all usernames with "anonymous" when not the current user
  for f in comments["features"]:
        currentUser = f["properties"]["user_id"]
        if str(userId) != str(currentUser):
          f["properties"]["user_id"] = "anonymous"

  cursor.close()
  connection.close()
  return comments


def update_comment_voting(comment_id, user_id, voting_status):
  
  connection = connect()
  cursor = connection.cursor()

  ## check, ob es überhaupt schon ein Voting zu diesem Kommentare gibt. wenn nicht, wird ein neuer erstellt, wenn ja, dann update

  get_votings_for_comment_query=f'''
    SELECT COUNT(voting_status) FROM comment_voting where comment_id = {comment_id} and user_id='{user_id}';
  '''
  cursor.execute(get_votings_for_comment_query)
  votings_for_comment_tuple = cursor.fetchall()
  votings_for_comment = int(votings_for_comment_tuple[0][0]) 
  if votings_for_comment < 1:
    set_voting_status_query =f''' INSERT INTO comment_voting (comment_id, user_id,voting_status) VALUES ('{comment_id}', '{user_id}','{voting_status}');'''
  else:
    set_voting_status_query =f''' UPDATE comment_voting SET voting_status = '{voting_status}' where comment_id = {comment_id} and user_id='{user_id}';'''
    
  cursor.execute(set_voting_status_query)
  connection.commit()
  cursor.close()
  connection.close()  


def update_voting_status(comment_id, user_id, action, previous_state):

  if previous_state == "neutral":
    
    if action == "like":
      result = "status:like, like +"
      like_comment(comment_id)
      update_comment_voting(comment_id, user_id, "like")

    elif action == "dislike":
      result = "status:unlike, dislike +"
      dislike_comment(comment_id)
      update_comment_voting(comment_id, user_id, "dislike")
    else:
      result = "Error"

  elif previous_state == "like":
	  
    if action == "unlike":
      result = "status:neutral, like -"
      unlike_comment(comment_id)
      update_comment_voting(comment_id, user_id, "neutral")

    elif action == "dislike":
      result = "status:dislike, like -, dislike +"
      dislike_comment(comment_id)
      unlike_comment(comment_id)
      update_comment_voting(comment_id, user_id, "dislike")
    else:
      result = "Error"
	 
  elif previous_state == "dislike":
	
    if action == "like":
      result = "status:like, like +, unlike -"
      like_comment(comment_id)
      undislike_comment(comment_id)
      update_comment_voting(comment_id, user_id, "like")

      
    elif action == "undislike":
      result = "status:neutral, dislike -"
      undislike_comment(comment_id)
      update_comment_voting(comment_id, user_id, "neutral")

    else:
      result = "Error"
  else:
    result = "Error"
   
  # connection = connect()
  # cursor = connection.cursor()
  # add_like_query =f''' UPDATE comment SET likes = likes + 1 where id = {commentid} and project_id='{projectId}';'''
  # cursor.execute(add_like_query, ())
  
  # connection.commit()
  # cursor.close()
  # connection.close()

  return result



def like_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_like_query =f''' UPDATE comment SET likes = likes + 1 where id = {commentid};'''
  cursor.execute(add_like_query, ())
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def unlike_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_unlike_query =f''' UPDATE comment SET likes = likes - 1 where id = {commentid};'''
  cursor.execute(add_unlike_query, ())
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def dislike_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_dislike_query =f''' UPDATE comment SET dislikes = dislikes + 1 where id = {commentid};'''
  cursor.execute(add_dislike_query, ())
  
  connection.commit()
  cursor.close()
  connection.close()
  return "ok"

def undislike_comment(commentid):
  connection = connect()
  cursor = connection.cursor()
  add_undislike_query =f''' UPDATE comment SET dislikes = dislikes - 1 where id = {commentid};'''
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
@lru_cache
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

@lru_cache
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


def prepare_quests_user_table(projectId,userId):
  connection = connect()
  cursor = connection.cursor()

# 1. If and how many quests are defined for this project?

  get_quests_from_db_query=f'''
    SELECT COUNT(quest_id) FROM quests WHERE project_id='{projectId}';
  '''
  cursor.execute(get_quests_from_db_query)
  number_of_quests_tuple = cursor.fetchall()
  number_of_quests = int(number_of_quests_tuple[0][0]) 
  if number_of_quests < 1:
    return "No quests available for this project" 

# 2. Are there any quests with fulfimments stored for the current user?

  get_fulfillments_from_db_query=f'''
    SELECT COUNT(fulfillment) FROM quests_user WHERE user_id='{userId}' and project_id='{projectId}';
  '''
  cursor.execute(get_fulfillments_from_db_query)
  number_of_fulfillments_tuple = cursor.fetchall()
  number_of_fulfillments = int(number_of_fulfillments_tuple[0][0]) 

# 3. If there are no stored fulfillments, then create new rows with fulfillment = 0 

  if number_of_fulfillments < 1: 
    # jetzt die Tabelle mit den Questfulfillments updaten
    get_quests_from_db_query=f'''
      SELECT * FROM quests WHERE project_id='{projectId}';
      '''
    cursor.execute(get_quests_from_db_query)
    quests = cursor.fetchall()
    
    # iterate over quest list
    for f in quests:
      quest_id = int(f[0])
      add_quest_user_query = f'''
      insert into quests_user (quest_id, project_id, user_id,fulfillment) values ('{quest_id}','{projectId}','{userId}',0);
      '''
      cursor.execute(add_quest_user_query)
    
    feedback = "New entries created"
  else:
    feedback = "Entries existed before"

  connection.commit()
  cursor.close()
  connection.close()
  return feedback

def get_quests_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  # get_quests_from_db_query=f'''
  # select * from quests where project_id = '{projectId}';
  # '''

  get_quests_from_db_query=f'''
  select json_build_object('quest_id', quest_id, 'content',content, 'type',type,'goal',goal, 'order_id', order_id, 'project_id',project_id) from quests where project_id = '{projectId}';
  '''
  cursor.execute(get_quests_from_db_query)
  quests = cursor.fetchall()
  ## BUG: die einzelnen quests sind doppelt indented: wieso?
  cursor.close()
  connection.close()
  return quests

#  Returns a JSON with the combined descritions of the quests for the cuurent project and the fulfillemt values for the current user
# This is important for creating a UI qwhich shows the user, how many quests his still has to do 
def get_quests_and_fulfillment_from_db(projectId,userId):
  connection = connect()
  cursor = connection.cursor()
  get_quests_from_db_query=f'''
  select json_build_object('quest_id',quest_id, 'content',content,'type',type,'goal',goal,'order_id',order_id,'project_id',project_id) from quests where project_id = '{projectId}' order by order_id;
  '''
  cursor.execute(get_quests_from_db_query)
  quests = cursor.fetchall()

  get_fulfillment_query=f'''
    select quest_id,fulfillment from quests_user where user_id = '{userId}' and project_id='{projectId}';
    '''
  cursor.execute(get_fulfillment_query)
  fulfillment_tuple = cursor.fetchall()
  fulfillment_dict= dict(fulfillment_tuple)
  cursor.close()
  connection.close()
  counter = 0
  quest_with_fulfillment = {} 
  for f in quests:
    quest_entry= f[0]
    quest_with_fulfillment[counter] = quest_entry
    quest_id = quest_with_fulfillment[counter]["quest_id"]
    fulfillment_value = fulfillment_dict[quest_id]
    quest_with_fulfillment[counter]["fulfillment"] = fulfillment_value
    counter = counter + 1

  return quest_with_fulfillment


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

def drop_tram_line_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_tram_line_table_query =f''' delete from tram_line where project_id='{projectId}';'''
  cursor.execute(drop_tram_line_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_water_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_water_table_query =f''' delete from water where project_id='{projectId}';'''
  cursor.execute(drop_water_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_sidewalk_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_sidewalk_table_query =f''' delete from sidewalk where project_id='{projectId}';'''
  cursor.execute(drop_sidewalk_table_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_sidewalk_polygon(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_sidewalk_polygon_query =f''' delete from sidewalk_polygon where project_id='{projectId}';'''
  cursor.execute(drop_sidewalk_polygon_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_bike_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_bike_query =f''' delete from bike where project_id='{projectId}';'''
  cursor.execute(drop_bike_query)
  connection.commit()
  cursor.close()
  connection.close()

def drop_bike_polygon_table(projectId):
  connection = connect()
  cursor = connection.cursor()
  drop_bike_polygon_query =f''' delete from bike_polygon where project_id='{projectId}';'''
  cursor.execute(drop_bike_polygon_query)
  connection.commit()
  cursor.close()
  connection.close()

@lru_cache
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

@lru_cache
def get_tram_line_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_tram_line_query = f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(tram_line.*)::json)
        )
        from tram_line
        where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_tram_line_query)
  routes = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return routes

@lru_cache
def get_water_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_routes_query = f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(water.*)::json)
        )
        from water
        where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_routes_query)
  routes = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return routes

@lru_cache
def get_sidewalk_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_sidewalk_query = f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(sidewalk_polygon.*)::json)
        )
        from sidewalk_polygon
        where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_sidewalk_query)
  sidewalk = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return sidewalk

@lru_cache
def get_bike_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_bike_query = f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(bike_polygon.*)::json)
        )
        from (
          select id, (ST_Dump(bike_polygon.geom)).geom::geometry(Polygon,4326) from bike_polygon where project_id = '{projectId}'
        ) as bike_polygon
        
      ;
  '''
  cursor.execute(get_bike_query)
  bike_lanes = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return bike_lanes

@lru_cache
def get_bike_lane_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_bike_lane_query = f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(bike.*)::json)
        )
        from bike
        where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_bike_lane_query)
  lane = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return lane