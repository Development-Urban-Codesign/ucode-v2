import json
from smtpd import DebuggingServer

import requests
import osmnx as ox
import geopandas
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from osmtogeojson import osmtogeojson

from db import (
    add_comment,
    add_drawn_line,
    dislike_comment,
    get_buildings_from_db,
    connect,
    delete_comments,
    get_comments,
    get_filtered_comments,
    get_greenery_from_db,
    get_table_names,
    get_trees_from_db,
    like_comment,
    dislike_comment,
    undislike_comment,
    unlike_comment,
    get_driving_lane_from_db,
    get_driving_lane_polygon_from_db,
    add_fulfillment,
    get_quests_from_db,
    get_driving_lane_polygon_from_db,
    drop_greenery_table,
    drop_building_table,
    drop_tree_table,
    drop_driving_lane_table,
    drop_traffic_signal_table,
    get_traffic_signal_from_db,
    get_project_specification_from_db,
    get_routes_from_db,
    drop_tram_line_table,
    get_tram_line_from_db,
    drop_water_table,
    get_water_from_db,
    drop_sidewalk_table,
    drop_sidewalk_polygon,
    get_sidewalk_from_db,
    drop_bike_table,
    drop_bike_polygon_table,
    get_bike_from_db,
    get_bike_lane_from_db

)
from db_migrations import run_database_migrations
try:
    run_database_migrations()
except Exception as err:
    print("Could not run database migrations", err)

app = FastAPI()
origins = [
    "https://api.v2.urban-codesign.com",
    "https://v2.urban-codesign.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    try:
        table_names = get_table_names()
        if table_names:
            result = []
            for table in table_names:
                d = dict()
                d["id"] = table_names.index(table)
                d["name"] = table[0]
                result.append(d)
            subjects = json.dumps(result)
            return json.loads(subjects)
    except BaseException as err:
        print(f"Unexpected {err=}, {type(err)=}")
        raise HTTPException(status_code=500, detail=f"Something went wrong: {err}")

@app.get("/project-specification")
async def get_project_specification_from_db_api(projectId: str = None):
    return get_project_specification_from_db(projectId)
   
@app.post("/add-quest-fulfillment")
async def add_fulfillment_api(request: Request):
    data = await request.json()
    add_fulfillment(data["questid"], data["projectId"])
    return "fulfillment has been updated"
    
@app.post("/get-greenery-from-osm")
async def get_greenery_from_osm_api(request: Request):
    data = await request.json()
    projectId = data["projectId"] 
    drop_greenery_table(projectId)
    xmin = data["bbox"]["xmin"]
    ymin = data["bbox"]["ymin"]
    xmax = data["bbox"]["xmax"]
    ymax = data["bbox"]["ymax"]
    tags = data["usedTagsForGreenery"]["tags"]
    _tags = ""
    for i in tags:
        _tags += "way.all[" + i.replace(":", "=") + "]" + ";\n"

    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query_greenery = """
        [out:json];
        way(%s,%s,%s,%s)->.all;
        (
            %s
        );
        convert item ::=::,::geom=geom(),_osm_type=type();
        out geom;
    """ % (
        ymin,
        xmin,
        ymax,
        xmax,
        _tags,
    )

    response_greenery = requests.get(
        overpass_url, params={"data": overpass_query_greenery}
    )
    data_greenery = response_greenery.json()

    connection = connect()
    cursor = connection.cursor()
    insert_query_greenery = """
        INSERT INTO greenery (project_id,greentag, geom) VALUES (%s,%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));

    """
    for f in data_greenery["elements"]:
        f["geometry"]["type"] = "Polygon"
        f["geometry"]["coordinates"] = [f["geometry"]["coordinates"]]
        greentag = None
        for i in tags:
            if i.split(":")[0] in f["tags"]:
                greentag = f["tags"][i.split(":")[0]]
        if greentag == None:
            greentag = "notFound"
        geom = json.dumps(f["geometry"])

        # store_greenery_from_osm(greentag, geom)
        cursor.execute(
            insert_query_greenery,
            (
                projectId,
                greentag,
                geom,
            ),
        )

    connection.commit()
    cursor.close()
    connection.close()
    return "gg"

@app.post("/get-greenery-from-db")
async def get_greenery_from_db_api(request: Request):
    data = await request.json()
    return get_greenery_from_db(data)


@app.post("/get-buildings-from-osm")
async def get_buildings_from_osm_api(request: Request):
    data = await request.json()
    projectId = data["projectId"]
    drop_building_table(projectId)
    bbox = f"""{data["bbox"]["ymin"]},{data["bbox"]["xmin"]},{data["bbox"]["ymax"]},{data["bbox"]["xmax"]}"""
    
    overpass_url = "http://overpass-api.de/api/interpreter"
    

    overpass_query_building_parts = f"""
        [out:json];
        (
            (
                way[building]({bbox});
                way["building:part"]({bbox});
            );
            -
            (
                rel(bw:"outline");
                way(r:"outline");
            );
        );
        convert item ::=::,::geom=geom(),_osm_type=type();
        out geom;
    """
    response_building = requests.get(
        overpass_url, params={"data": overpass_query_building_parts}
    )

    data_building = response_building.json()

    ###############
    overpass_query_building_with_hole = f"""
        [out:json];
           
                (
                    rel["building"]({bbox});
                   
                );
                
            (._;>;);
            out geom;

        """
    response_building_with_hole = requests.get(
        overpass_url, params={"data": overpass_query_building_with_hole}
    )
    results = response_building_with_hole.json()
    for f in results["elements"]:
        if "type" in f and f["type"] == "relation":
            if(f["members"][0]["role"] != "outer"):
                i = 0
                for x in f["members"]:
                    if x["role"] == "outer":
                        f["members"][0], f["members"][i] = f["members"][i],f["members"][0]
                        break
                    i += 1
                
    bhole = osmtogeojson.process_osm_json(results)
    # print(bhole)
    connectionn = connect()
    cursorr = connectionn.cursor()
    insert_query_buildingg = """
        INSERT INTO building (project_id,wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, amenity, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    """
    for f in bhole["features"]:
        
        if "type" in f["properties"] and f["properties"]["type"] == "multipolygon":
            
            wallcolor = None
            if "building:colour" in f["properties"]:
                wallcolor = f["properties"]["building:colour"]
            wallmaterial = None
            if "building:material" in f["properties"]:
                wallmaterial = f["properties"]["building:material"]
            roofcolor = None
            if "roof:colour" in f["properties"]:
                roofcolor = f["properties"]["roof:colour"]
            roofmaterial = None
            if "roof:material" in f["properties"]:
                roofmaterial = f["properties"]["roof:material"]
            roofshape = None
            if "roof:shape" in f["properties"]:
                roofshape = f["properties"]["roof:shape"]
            roofheight = None
            if "roof:height" in f["properties"]:
                roofheight = f["properties"]["roof:height"]
                if "," in roofheight:
                    roofheight = roofheight.replace(",", ".")
            height = None
            if "height" in f["properties"]:
                height = f["properties"]["height"]
                height = sure_float(height)
            floors = None
            if "building:levels" in f["properties"]:
                floors = f["properties"]["building:levels"]
                floors = sure_float(floors)

            estimatedheight = None
            if height is not None:
                estimatedheight = sure_float(height)
            elif floors is not None:
                estimatedheight = sure_float(floors) * 3.5
            else:
                estimatedheight = 15
            amenity = None
            if "amenity" in f["properties"]:
                amenity = f["properties"]["amenity"]  
            cursorr.execute(
                    insert_query_buildingg,
                    (
                        projectId,
                        wallcolor,
                        wallmaterial,
                        roofcolor,
                        roofmaterial,
                        roofshape,
                        roofheight,
                        height,
                        floors,
                        estimatedheight,
                        amenity,
                        json.dumps(f["geometry"]),
                    ),
            )
         
    connectionn.commit()
    cursorr.close()
    connectionn.close()

    
    
    
    connection = connect()
    cursor = connection.cursor()
       # INSERT INTO building (wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    insert_query_building = """
        INSERT INTO building (project_id,wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, amenity, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    """
    for f in data_building["elements"]:
        #print(f)
        f["geometry"]["type"] = "Polygon"
        f["geometry"]["coordinates"] = [f["geometry"]["coordinates"]]
    for f in data_building["elements"]:
       # print(f)
        wallcolor = None
        if "building:colour" in f["tags"]:
            wallcolor = f["tags"]["building:colour"]
        wallmaterial = None
        if "building:material" in f["tags"]:
            wallmaterial = f["tags"]["building:material"]
        roofcolor = None
        if "roof:colour" in f["tags"]:
            roofcolor = f["tags"]["roof:colour"]
        roofmaterial = None
        if "roof:material" in f["tags"]:
            roofmaterial = f["tags"]["roof:material"]
        roofshape = None
        if "roof:shape" in f["tags"]:
            roofshape = f["tags"]["roof:shape"]
        roofheight = None
        if "roof:height" in f["tags"]:
            roofheight = f["tags"]["roof:height"]
            if "," in roofheight:
                roofheight = roofheight.replace(",", ".")
        height = None
        if "height" in f["tags"]:
            height = f["tags"]["height"]
            height = sure_float(height)
        floors = None
        if "building:levels" in f["tags"]:
            floors = f["tags"]["building:levels"]
            floors = sure_float(floors)

        estimatedheight = None
        if height is not None:
            estimatedheight = sure_float(height)
        elif floors is not None:
            estimatedheight = sure_float(floors) * 3.5
        else:
            estimatedheight = 15

        amenity = None
        if "amenity" in f["tags"]:
            amenity = f["tags"]["amenity"]
        geom = json.dumps(f["geometry"])
        #print(geom)
        # get_buildings_from_osm(wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom)
        cursor.execute(
            insert_query_building,
            (
                projectId,
                wallcolor,
                wallmaterial,
                roofcolor,
                roofmaterial,
                roofshape,
                roofheight,
                height,
                floors,
                estimatedheight,
                amenity,
                geom,
            ),
        )

    connection.commit()
    cursor.close()
    connection.close()

    return "fine"


@app.post("/get-buildings-from-db")
async def get_buildings_from_db_api(request: Request):
    data = await request.json()
    return get_buildings_from_db(data)

@app.post("/get-quests-from-db")
async def get_quests_from_db_api(request: Request):
    projectId = await request.json()
    return get_quests_from_db(projectId)

@app.post("/get-trees-from-osm")
async def get_trees_from_osm_api(request: Request):
    data = await request.json()
    projectId = data["projectId"]
    drop_tree_table(projectId)
    xmin = data["bbox"]["xmin"]
    ymin = data["bbox"]["ymin"]
    xmax = data["bbox"]["xmax"]
    ymax = data["bbox"]["ymax"]
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query_trees = """
         [out:json];
         node["natural"="tree"](%s,%s,%s,%s);
         convert item ::=::,::geom=geom(),_osm_type=type();
         out geom;
     """ % (
        ymin,
        xmin,
        ymax,
        xmax,
    )

    response_tree = requests.get(overpass_url, params={"data": overpass_query_trees})

    data_tree = response_tree.json()
    connection = connect()
    cursor = connection.cursor()
    insert_query_tree = """
        INSERT INTO tree (project_id,geom) VALUES (%s,ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));

    """
    for f in data_tree["elements"]:

        geom = json.dumps(f["geometry"])
        cursor.execute(insert_query_tree, (projectId,geom,))

    connection.commit()
    cursor.close()
    connection.close()
    return "ok"


@app.post("/get-trees-from-db")
async def get_trees_from_db_api(request: Request):
    projectId = await request.json()
    return get_trees_from_db(projectId)


@app.post("/add-comment")
async def add_comment_api(request: Request):
    data = await request.json()
    add_comment(data["userId"],data["projectId"],data["comment"], sure_float(data["position"][0]), sure_float(data["position"][1]))
    return "added"


@app.post("/add-drawn-line")
async def add_drawn_line_api(request: Request):
    data = await request.json()
    add_drawn_line(
        data["projectId"],
        data["comment"],
        data["width"],
        data["color"],
        json.dumps(data["geometry"]["features"][0]["geometry"]),
    )
    return "added"

#delete-comments
@app.get("/delete-comments")
async def delete_comments_api(projectId: str):
    print(projectId)
    return delete_comments(projectId)

@app.post("/get-comments")
async def get_comments_api(request: Request):
    data = await request.json()
    return get_comments(data)

@app.get("/get-comments")
async def get_comments_api(projectId: str):
    return get_comments(projectId)

@app.get("/get-filtered-comments")
async def get_filtered_comments_api(projectId: str, userId: str):
        return get_filtered_comments(projectId,userId)

@app.post("/get-filtered-comments")
async def get_filtered_comments_api(request: Request):
    data = await request.json()
    print(data)
    projectId = data["projectId"]
    userId = data["userId"]
    return get_filtered_comments(projectId,userId)

@app.post("/like-comment")
async def like_comment_api(request: Request):
    data = await request.json()
    like_comment(data["id"],data["projectId"])
    return "added"


@app.post("/unlike-comment")
async def unlike_comment_api(request: Request):
    data = await request.json()
    unlike_comment(data["id"],data["projectId"])
    return "added"


@app.post("/dislike-comment")
async def dislike_comment_api(request: Request):
    data = await request.json()
    dislike_comment(data["id"],data["projectId"])
    return "added"


@app.post("/undislike-comment")
async def undislike_comment_api(request: Request):
    data = await request.json()
    undislike_comment(data["id"],data["projectId"])
    return "added"

@app.post("/get-driving-lane-from-osm")
async def get_driving_lane_from_osm_api(request: Request):
    data = await request.json()
    projectId = data["projectId"]
    drop_driving_lane_table(projectId)
    xmin = sure_float(data['bbox']["xmin"])
    ymin = sure_float(data['bbox']["ymin"])
    xmax = sure_float(data['bbox']["xmax"])
    ymax = sure_float(data['bbox']["ymax"]) 
    G = ox.graph_from_bbox(ymin, ymax, xmin, xmax, network_type='drive')
    gdf = ox.graph_to_gdfs(G, nodes=False, edges=True)
    road = json.loads(gdf.to_json())
    #print(road)
    """
    mylist =[]
    for i in road['features']: 
        if i["properties"]["highway"] in mylist: 
            continue
        else:
            mylist.append(i["properties"]["highway"])
    print(mylist)
    """
    
    connection = connect()
    cursor = connection.cursor()

    insert_query_driving_lane= '''
        INSERT INTO driving_lane (project_id,lanes,length,maxspeed,width, highway, geom) VALUES (%s,%s,%s,%s,%s,%s, ST_SetSRID(st_astext(st_geomfromgeojson(%s)), 4326));

    '''

    insert_query_driving_lane_polygon= '''
        
        INSERT INTO driving_lane_polygon (project_id,lanes,length,maxspeed,width,highway, geom) VALUES (%s,%s,%s,%s,%s,%s,
        st_buffer(
            ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)::geography,
            (%s::double precision)/2 ,
            'endcap=round join=round')::geometry
        );
        

    '''
    for f in road['features']:
        #print(f)
        geom = json.dumps(f['geometry'])
        lanes=None
        if 'lanes' in f['properties']: lanes =f['properties']['lanes']
        length=None
        if 'length' in f['properties']: length =f['properties']['length']
        maxspeed=None
        if 'maxspeed' in f['properties']: maxspeed =f['properties']['maxspeed']

        highway=None
        if 'highway' in f['properties']: highway =f['properties']['highway']

        width=None
        if 'width' in f['properties'] and f['properties']["width"] is not None and isinstance(f['properties']["width"], str):
            width =f['properties']['width']
            width = sure_float(width)
        elif f['properties']["highway"]== 'primary':
            width =10
        elif f['properties']["highway"]== 'secondary' or f['properties']["highway"]== 'secondary_link':
            width =8
        elif f['properties']["highway"]== 'tertiary' or f['properties']["highway"]== 'tertiary_link':
            width =6
        elif f['properties']["highway"]== 'residential' or f['properties']["highway"]== 'living_street':
            width =4
        else:
            width =4
        cursor.execute(insert_query_driving_lane, (projectId,lanes,length,maxspeed,width,highway, geom,))
        cursor.execute(insert_query_driving_lane_polygon, (projectId,lanes,length,maxspeed,width,highway, geom,width))
    
    connection.commit()
    cursor.close()
    connection.close()
    
    return "true"

@app.post("/get-driving-lane-from-db")
async def get_driving_lane_from_db_api(request: Request):
    projectId = await request.json()
    return {"lane": get_driving_lane_from_db(projectId), "polygon": get_driving_lane_polygon_from_db(projectId)}

def sure_float(may_be_number):  
    # function which extracts surely the integer or float inside a string
    # will handle strings like "23m" or "23,5 m" or "23.0 m" correctly
    my_sure_float = "0"
    try:
        my_sure_float = float(may_be_number)
    except:
        may_be_number = may_be_number.strip()
        may_be_number = may_be_number.replace(",", ".")
        may_be_number = may_be_number.replace("'", ".")
        for x in may_be_number:
            if x in "0123456789.":
                my_sure_float = my_sure_float + x
            elif x.isspace():
                break
        my_sure_float = float(my_sure_float)

    return my_sure_float

#TH:add projectId to insert command
@app.post("/get-traffic-lights-from-osm")
async def get_traffic_lights_from_osm_api(request: Request):
    projectId ="0"
    drop_traffic_signal_table(projectId)
    data = await request.json()
    projectId = data["projectId"]
    drop_traffic_signal_table(projectId)
    xmin = data["bbox"]["xmin"]
    ymin = data["bbox"]["ymin"]
    xmax = data["bbox"]["xmax"]
    ymax = data["bbox"]["ymax"]
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query_traffic_signals = """
         [out:json];
         node["crossing"="traffic_signals"](%s,%s,%s,%s);
         convert item ::=::,::geom=geom(),_osm_type=type();
         out geom;
     """ % (
        ymin,
        xmin,
        ymax,
        xmax,
    )

    response_traffic_signal = requests.get(overpass_url, params={"data": overpass_query_traffic_signals})

    data_traffic_signal = response_traffic_signal.json()

    connection = connect()
    cursor = connection.cursor()
    insert_query_traffic_signal = """
        With closestpolygon AS
        (SELECT geom
        FROM driving_lane_polygon
        ORDER BY geom <-> (ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326))
        LIMIT 1)
        INSERT INTO traffic_signal (project_id,geom) VALUES 
        ( 
            %s,
            (select 
                ST_ClosestPoint(
                    ST_Boundary((select geom from closestpolygon)),
                    ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)
                )
            )
        );

    """
    for f in data_traffic_signal["elements"]:

        geom = json.dumps(f["geometry"])
        cursor.execute(insert_query_traffic_signal, (geom, projectId, geom,))

    connection.commit()
    cursor.close()
    connection.close()
    return "ok"

@app.post("/get-traffic-signal-from-db")
async def get_traffic_lights_from_db_api(request: Request):
    projectId = await request.json()
    return get_traffic_signal_from_db(projectId)

@app.post("/get-routes-from-db")
async def get_routes_from_db_api(request: Request):
    projectId = await request.json()
    return get_routes_from_db(projectId)


@app.post("/get-water-from-db")
async def get_water_from_db_api(request: Request):
    projectId = await request.json()
    return get_water_from_db(projectId)

@app.post("/get-water-from-osm")
async def get_water_from_osm_api(request: Request):
    data = await request.json()
    projectId = data["projectId"] 
    drop_water_table(projectId)
    bbox = f"""{data["bbox"]["ymin"]},{data["bbox"]["xmin"]},{data["bbox"]["ymax"]},{data["bbox"]["xmax"]}"""
    
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    overpass_query_water = f"""
        [out:json];
        way["amenity"="fountain"]({bbox});
        relation["natural"="water"]({bbox});
        
        (._;>;);
        out geom;
    """
    overpass_query_fountain = f"""
        [out:json];
        way["natural"="water"]({bbox});
        (._;>;);
        out geom;
    """
    
    response_fountain = requests.get(
        overpass_url, params={"data": overpass_query_fountain}
    )
    response_water = requests.get(
        overpass_url, params={"data": overpass_query_water}
    )
    # print(response_water)
    
    data_fountain = osmtogeojson.process_osm_json(response_fountain.json())
    data_water = osmtogeojson.process_osm_json(response_water.json())
    # print(data_fountain)
    # print(data_water)
    connection = connect()
    cursor = connection.cursor()
    insert_query_water = """
        INSERT INTO water (project_id, geom) VALUES (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));

    """
    
    for f in data_fountain["features"]:
        geom = json.dumps(f["geometry"])
        cursor.execute(
        insert_query_water,
        (projectId,
        geom
        ))
    for f in data_water["features"]:
        if(f["geometry"]["type"]=="GeometryCollection"):
            polygon = {"type": "Polygon", "coordinates": []}
            outerPolygon = {"type": "Polygon", "coordinates": []}
            for g in f["geometry"]["geometries"]:
                if(g["type"]=="LineString"):
                    outerPolygon["coordinates"] += g["coordinates"]
                # if(g["type"]=="Polygon"):
                #     multipolygon["coordinates"].append(g["coordinates"])
            polygon["coordinates"] = [outerPolygon["coordinates"]]
            
            for g in f["geometry"]["geometries"]:
                if(g["type"]=="Polygon"):
                    polygon["coordinates"].append(g["coordinates"][0])

            # print(polygon)
            geom = json.dumps(polygon)
            cursor.execute(
            insert_query_water,
            (projectId,
            geom
            ))
        elif(f["geometry"]["type"]=="Polygon"):
            
            geom = json.dumps(f["geometry"])
            cursor.execute(
            insert_query_water,
            (projectId,
            geom
            ))
        else:
            print(f'''Some other type in Waterpolygons: {f["geometry"]["type"]}''')

    connection.commit()
    cursor.close()
    connection.close()
    return "gg"

@app.post("/get-tram-lines-from-osm")
async def get_tram_lines_from_osm_api(request: Request):
    
    data = await request.json()
    projectId = data["projectId"]
    drop_tram_line_table(projectId)
    xmin = sure_float(data['bbox']["xmin"])
    ymin = sure_float(data['bbox']["ymin"])
    xmax = sure_float(data['bbox']["xmax"])
    ymax = sure_float(data['bbox']["ymax"]) 

    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query_tram_lines = """
         [out:json];
         relation["type"="route"]["route"="tram"](%s,%s,%s,%s);
        
        convert item ::=::,::geom=geom(),_osm_type=type();
        out geom;
     """ % (
        ymin,
        xmin,
        ymax,
        xmax,
    )

    response_tram_lines = requests.get(overpass_url, params={"data": overpass_query_tram_lines})

    data_tram_lines = response_tram_lines.json()
   
    connection = connect()
    cursor = connection.cursor()

    insert_query_tram_lane= '''
        INSERT INTO tram_line (project_id,lane_name,starts_from,arrives_to, geom) VALUES (%s,%s,%s,%s, ST_SetSRID(st_astext(st_geomfromgeojson(%s)), 4326));

    '''

    for elem in data_tram_lines["elements"]:
       
        lane_name=None
        if 'name' in elem["tags"]: lane_name = elem["tags"]['name']
        starts_from=None
        if 'from' in elem["tags"]: starts_from = elem["tags"]['from']
        arrives_to=None
        if 'to' in elem["tags"]: arrives_to = elem["tags"]['to']
        
        for geom in elem["geometry"]['geometries']:
            
            if geom["type"]=='LineString':
                tram_geom = json.dumps(geom)
                
                cursor.execute(insert_query_tram_lane, (projectId,lane_name,starts_from,arrives_to, tram_geom,))

    connection.commit()
    cursor.close()
    connection.close()
    
    
    connection = connect()
    cursor = connection.cursor()
    
    delete_station_geometries_query= '''

        delete from tram_line where ST_IsClosed(geom);
        
        delete FROM tram_line a
        WHERE NOT EXISTS 
        (SELECT 1 FROM tram_line b 
        WHERE a.id != b.id
        AND ST_Intersects(a.geom, b.geom) AND ST_Touches(a.geom, b.geom));

        update tram_line set geom = st_astext(st_transform(st_setsrid(ST_Collect(
            ST_OffsetCurve(st_transform(ST_SetSRID(geom, 4326), 26986), 0.4, 'quad_segs=4 join=mitre mitre_limit=2.2'),
            ST_OffsetCurve(st_transform(ST_SetSRID(geom, 4326), 26986), -0.4, 'quad_segs=4 join=mitre mitre_limit=2.2')
        ),26986),4326));

       
    '''
    cursor.execute(delete_station_geometries_query)
    
    connection.commit()
    cursor.close()
    connection.close()
    
    return "tram lanes retrieved"

@app.post("/get-tram-line-from-db")
async def get_tram_line_from_db_api(request: Request):
    projectId = await request.json()
    return get_tram_line_from_db(projectId)

@app.post("/get-side-walk-from-osm")
async def get_side_walk_from_osm_api(request: Request):
    data = await request.json()
    
    projectId = data["projectId"]
    drop_sidewalk_table(projectId)

    drop_sidewalk_polygon(projectId)

    xmin = sure_float(data['bbox']["xmin"])
    ymin = sure_float(data['bbox']["ymin"])
    xmax = sure_float(data['bbox']["xmax"])
    ymax = sure_float(data['bbox']["ymax"]) 
    custom_walk = ('["highway"="footway"]{}').format(ox.settings.default_access)

    G = ox.graph_from_bbox(ymin, ymax, xmin, xmax, network_type='walk')
    gdf = ox.graph_to_gdfs(G, nodes=False, edges=True)
    walk = json.loads(gdf.to_json())

    connection = connect()
    cursor = connection.cursor()

    insert_query_sidewalk= '''
        INSERT INTO sidewalk (project_id, highway, geom) VALUES (%s, %s, ST_SetSRID(st_astext(st_geomfromgeojson(%s)), 4326));
    '''
    for f in walk['features']:
        geom = json.dumps(f['geometry'])
        highway=None
        if 'highway' in f['properties']: highway =f['properties']['highway']
        cursor.execute(insert_query_sidewalk, (projectId,highway, geom,))
    
    connection.commit()
    cursor.close()
    connection.close()

    
    connection = connect()
    cursor = connection.cursor()
    
    delete_query_sidewalk_if_are_inside_main_road= '''

        delete FROM sidewalk where highway SIMILAR TO %s;

        delete FROM sidewalk AS a
        USING driving_lane_polygon AS b
        WHERE a.project_id=%s AND st_contains(b.geom, a.geom);
    '''
    
    cursor.execute(delete_query_sidewalk_if_are_inside_main_road, ('%%secondary%%|%%tertiary%%|%%unclassified%%|%%corridor%%|%%trunk_link%%|%%elevato%r%|%%pedestrian%%|%%residential%%|%%primary%%|%%living_street%%', projectId, ))
    
    connection.commit()
    cursor.close()
    connection.close()

    connection = connect()
    cursor = connection.cursor()

    insert_query_driving_lane_polygon= '''
        
        INSERT INTO sidewalk_polygon(project_id, geom)
        SELECT project_id, st_buffer(
            ST_SetSRID(geom, 4326)::geography,
            1 ,
            'endcap=round join=round')::geometry FROM sidewalk where project_id=%s;
    '''
    
    cursor.execute(insert_query_driving_lane_polygon, (projectId, ))
    
    connection.commit()
    cursor.close()
    connection.close()
    
    return "okk"

@app.post("/get-bike-from-osm")
async def get_bike_from_osm_api(request: Request):
    data = await request.json()
    projectId = data["projectId"]
    drop_bike_table(projectId)
    drop_bike_polygon_table(projectId)
    xmin = sure_float(data['bbox']["xmin"])
    ymin = sure_float(data['bbox']["ymin"])
    xmax = sure_float(data['bbox']["xmax"])
    ymax = sure_float(data['bbox']["ymax"]) 

    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query_bike = """
         [out:json];
            way["bicycle"="designated"](%s,%s,%s,%s);
            convert item ::=::,::geom=geom(),_osm_type=type();
            out geom;
     """ % (
        ymin,
        xmin,
        ymax,
        xmax,
    )

    response_bike = requests.get(overpass_url, params={"data": overpass_query_bike})

    data_bike = response_bike.json()
    
    connection = connect()
    cursor = connection.cursor()

    insert_query_bike= '''
        INSERT INTO bike (project_id,oneway,highway,service_type,lanes, geom) VALUES (%s,%s,%s,%s,%s, ST_SetSRID(st_astext(st_geomfromgeojson(%s)), 4326));

    '''

    for elem in data_bike["elements"]:
       
        oneway=None
        if 'oneway' in elem["tags"]: oneway = elem["tags"]['oneway']
        highway=None
        if 'highway' in elem["tags"]: highway = elem["tags"]['highway']
        service_type=None
        if 'service_type' in elem["tags"]: service_type = elem["tags"]['service_type']
        lanes=None
        if 'lanes' in elem["tags"]: lanes = elem["tags"]['lanes']
        geom= json.dumps(elem['geometry'])
       
        cursor.execute(insert_query_bike, (projectId,oneway,highway,service_type,lanes, geom,))
    connection.commit()
    cursor.close()
    connection.close()

    connection = connect()
    cursor = connection.cursor()

    insert_query_bike_polygon= '''
    
        INSERT INTO bike_polygon(project_id, geom)
        SELECT project_id, st_buffer(
            ST_SetSRID(geom, 4326)::geography,
            0.5 ,
            'endcap=round join=round')::geometry FROM bike where project_id=%s;

    '''
        
    cursor.execute(insert_query_bike_polygon, (projectId, ))

    connection.commit()
    cursor.close()
    connection.close()

    return "okk"

@app.post("/get-sidewalk-from-db")
async def get_sidewalk_from_db_api(request: Request):
    projectId = await request.json()
    return get_sidewalk_from_db(projectId)

@app.post("/get-bike-from-db")
async def get_bike_from_db_api(request: Request):
    projectId = await request.json()
    bike_poly = get_bike_from_db(projectId)
    return bike_poly

@app.get("/admin/clear-cache")
async def clear_cache():
    print("Cache cleared!")
    get_buildings_from_db_cache_stats = get_buildings_from_db.cache_info()
    get_greenery_from_db_cache_stats = get_greenery_from_db.cache_info()
    get_trees_from_db_cache_stats = get_trees_from_db.cache_info()
    get_driving_lane_from_db_cache_stats = get_driving_lane_from_db.cache_info()
    get_driving_lane_polygon_from_db_cache_stats = get_driving_lane_polygon_from_db.cache_info()
    get_traffic_signal_from_db_cache_stats =get_traffic_signal_from_db.cache_info()
    get_tram_line_from_db_cache_stats = get_tram_line_from_db.cache_info()
    get_water_from_db_cache_stats = get_water_from_db.cache_info()
    get_sidewalk_from_db_cache_stats = get_sidewalk_from_db.cache_info()
    get_bike_from_db_cache_stats = get_bike_from_db.cache_info()
    get_bike_lane_from_db_cache_stats = get_bike_lane_from_db.cache_info()
    get_buildings_from_db.cache_clear()
    get_greenery_from_db.cache_clear()
    get_trees_from_db.cache_clear()
    get_driving_lane_from_db.cache_clear()
    get_driving_lane_polygon_from_db.cache_clear()
    get_traffic_signal_from_db.cache_clear()
    get_tram_line_from_db.cache_clear()
    get_water_from_db.cache_clear()
    get_sidewalk_from_db.cache_clear()
    get_bike_from_db.cache_clear()
    get_bike_lane_from_db.cache_clear()
    result = {
        "get_buildings_from_db_cache_stats": get_buildings_from_db_cache_stats,
        "get_greenery_from_db_cache_stats": get_greenery_from_db_cache_stats,
        "get_trees_from_db_cache_stats": get_trees_from_db_cache_stats,
        "get_driving_lane_from_db_cache_stats": get_driving_lane_from_db_cache_stats,
        "get_driving_lane_polygon_from_db_cache_stats": get_driving_lane_polygon_from_db_cache_stats,
        "get_traffic_signal_from_db_cache_stats": get_traffic_signal_from_db_cache_stats,
        "get_tram_line_from_db_cache_stats": get_tram_line_from_db_cache_stats,
        "get_water_from_db_cache_stats": get_water_from_db_cache_stats,
        "get_sidewalk_from_db_cache_stats": get_sidewalk_from_db_cache_stats,
        "get_bike_from_db_cache_stats": get_bike_from_db_cache_stats,
        "get_bike_lane_from_db_cache_stats": get_bike_lane_from_db_cache_stats,
        "result": "Cache cleared"
    }
    return result