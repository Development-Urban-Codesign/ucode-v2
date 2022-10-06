import json

import requests
import osmnx as ox
import geopandas
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from db import (
    add_comment,
    add_drawn_line,
    dislike_comment,
    get_buildings_from_db,
    connect,
    get_comments,
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
    get_routes_from_db

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
async def get_project_specification_from_db_api():
    return get_project_specification_from_db()
   # TH: Hier empfängt das Backend den Request aus dem Frontend, den Wert für die Quest-ID X um einen Zähler hochzusetzen 
@app.post("/add-quest-fulfillment")
async def add_fulfillment_api(request: Request):
    data = await request.json()
    add_fulfillment(data["questid"], data["projectId"])
    return "fulfillment has been updated"
    
@app.post("/store-greenery-from-osm")
async def store_greenery_from_osm_api(request: Request):
    projectId="0"
    drop_greenery_table(projectId)    
    data = await request.json()
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
    projectId="0" #TODO get from request, from the frontend
    drop_building_table(projectId)
    data = await request.json()
    xmin = data["bbox"]["xmin"]
    ymin = data["bbox"]["ymin"]
    xmax = data["bbox"]["xmax"]
    ymax = data["bbox"]["ymax"]
    overpass_url = "http://overpass-api.de/api/interpreter"
    # overpass_query_building = """
    #     [out:json];
    #     way["building"](%s,%s,%s,%s);
    #     convert item ::=::,::geom=geom(),_osm_type=type();
    #     out geom;
    # """ % ( ymin, xmin, ymax ,xmax )
    overpass_query_building_parts = """
        [out:json];
        (
            (
                way[building](%s,%s,%s,%s);
                way["building:part"](%s,%s,%s,%s);
            );
            -
            (
                rel(bw:"outline");
                way(r:"outline");
            );
        );
        convert item ::=::,::geom=geom(),_osm_type=type();
        out geom;
    """ % (
        ymin,
        xmin,
        ymax,
        xmax,
        ymin,
        xmin,
        ymax,
        xmax,
    )
    response_building = requests.get(
        overpass_url, params={"data": overpass_query_building_parts}
    )

    data_building = response_building.json()
    
    connection = connect()
    cursor = connection.cursor()
       # INSERT INTO building (wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    insert_query_building = """
        INSERT INTO building (project_id,wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, (st_buffer(st_buffer(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)::geography, 1,'side=right'),1)::geography)::geometry);
    """
    for f in data_building["elements"]:
        f["geometry"]["type"] = "Polygon"
        f["geometry"]["coordinates"] = [f["geometry"]["coordinates"]]

    for f in data_building["elements"]:
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

        geom = json.dumps(f["geometry"])

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
    projectId ="0"
    drop_tree_table(projectId)
    data = await request.json()
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
    data = await request.json()
    return get_trees_from_db(data)


@app.post("/add-comment")
async def add_comment_api(request: Request):
    data = await request.json()
    add_comment(data["projectId"],data["comment"], sure_float(data["position"][0]), sure_float(data["position"][1]))
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


@app.post("/get-comments")
async def get_comments_api(request: Request):
    data = await request.json()
    return get_comments(data)


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
    projectId ="0"
    drop_driving_lane_table(projectId)
    data = await request.json()
    xmin = data['bbox']["xmin"]
    ymin = data['bbox']["ymin"]
    xmax = data['bbox']["xmax"]
    ymax = data['bbox']["ymax"] 
    G = ox.graph_from_bbox(ymin, ymax, xmin, xmax, network_type='drive')
    gdf = ox.graph_to_gdfs(G, nodes=False, edges=True)
    road = json.loads(gdf.to_json())
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
        for x in may_be_number:
            if x in "0123456789.":
                my_sure_float = my_sure_float + x
            elif x.isspace():
                break
        my_sure_float = float(my_sure_float)

    return my_sure_float

@app.post("/get-traffic-lights-from-osm")
async def get_traffic_lights_from_osm_api(request: Request):
    projectId ="0"
    drop_traffic_signal_table(projectId)
    data = await request.json()
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

