import json

import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from db import (add_comment, add_drawn_line, get_buildings_from_db,
                get_buildings_from_osm, get_greenery_from_db,
                get_table_names, init_building_table,
                init_greenery_table, store_greenery_from_osm,get_comments, like_comment, unlike_comment, dislike_comment, undislike_comment)


app = FastAPI()
origins = [
    "https://api.v2.urban-codesign.com",
    "https://v2.urban-codesign.com",
    "http://localhost",
    "http://localhost:8080"
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
                d['id'] = table_names.index(table)
                d['name'] = table[0]
                result.append(d)
            subjects = json.dumps(result)
            return json.loads(subjects)
    except BaseException as err:
        print(f"Unexpected {err=}, {type(err)=}")
        raise HTTPException(status_code=500, detail=f"Something went wrong: {err}")
    
@app.post("/store-greenery-from-osm")
async def store_greenery_from_osm_api(request:Request):
    data= await request.json()
    init_greenery_table()
    xmin = data['bbox']["xmin"]
    ymin = data['bbox']["ymin"]
    xmax = data['bbox']["xmax"]
    ymax = data['bbox']["ymax"]
    tags = data['usedTagsForGreenery']['tags']
    _tags = ""
    for i in tags:
        _tags += 'way.all[' + i.replace(':','=') + ']' + ';\n'

    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query_greenery = """
        [out:json];
        way(%s,%s,%s,%s)->.all;
        (
            %s
        );
        convert item ::=::,::geom=geom(),_osm_type=type();
        out geom;
    """ % ( ymin, xmin, ymax ,xmax, _tags)

    response_greenery = requests.get(overpass_url,
                        params= {'data': overpass_query_greenery})
    data_greenery = response_greenery.json()

    for f in data_greenery["elements"]:
        f["geometry"]["type"] = "Polygon"
        f["geometry"]["coordinates"] = [f["geometry"]["coordinates"]]
        greentag = None
        for i in tags:
            if i.split(':')[0] in f['tags']:
                greentag = f['tags'][i.split(':')[0]]
        if greentag == None:
            greentag = "notFound"
        geom = json.dumps(f['geometry'])

        store_greenery_from_osm(greentag, geom)
    return "gg"

@app.get("/get-greenery-from-db")
async def get_greenery_from_db_api():
    return get_greenery_from_db()

@app.post("/get-buildings-from-osm")
async def get_buildings_from_osm_api(request: Request):
    data = await request.json()
    init_building_table()
    xmin = data['bbox']["xmin"]
    ymin = data['bbox']["ymin"]
    xmax = data['bbox']["xmax"]
    ymax = data['bbox']["ymax"]    
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
    """ % ( ymin, xmin, ymax ,xmax ,ymin, xmin, ymax ,xmax )
    response_building = requests.get(overpass_url, 
                        params={'data': overpass_query_building_parts})
    
    data_building = response_building.json()
    
    for f in data_building["elements"]:
        f["geometry"]["type"] = "Polygon"
        f["geometry"]["coordinates"] = [f["geometry"]["coordinates"]]
    
    for f in data_building["elements"]:
        
        wallcolor= None
        if 'building:colour' in f['tags']:  wallcolor = f['tags']['building:colour']
        wallmaterial= None
        if 'building:material' in f['tags']: wallmaterial =f['tags']['building:material']
        roofcolor=None
        if 'roof:colour' in f['tags']: roofcolor =f['tags']['roof:colour']
        roofmaterial=None
        if 'roof:material' in f['tags']: roofmaterial =f['tags']['roof:material']
        roofshape=None
        if 'roof:shape' in f['tags']: roofshape =f['tags']['roof:shape']
        roofheight=None
        if 'roof:height' in f['tags']:
            roofheight =f['tags']['roof:height']
            if "," in roofheight: roofheight = roofheight.replace(",",".")
        height=None
        if 'height' in f['tags']: height =f['tags']['height']
        floors= None
        if 'building:levels' in f['tags']: floors =f['tags']['building:levels']

        estimatedheight= None
        if height is not None:
            estimatedheight = float(height)
        elif floors is not None:
            estimatedheight = float(floors)*3.5
        else:
            estimatedheight = 15


        geom=json.dumps(f['geometry'])
        
        get_buildings_from_osm(wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom)
    
    
    return "fine"

@app.get("/get-buildings-from-db")
async def get_buildings_from_db_api():
    return get_buildings_from_db()

@app.post("/add-comment")
async def add_comment_api(request: Request):
    data = await request.json()
    add_comment(data["comment"], float(data["position"][0]), float(data["position"][1]))
    return "added"

@app.post("/add-drawn-line")
async def add_drawn_line_api(request: Request):
    data = await request.json()
    add_drawn_line(data["comment"], data["width"], data["color"], json.dumps(data["geometry"]["features"][0]["geometry"]))
    print(data)
    return "added"


@app.get("/get-cooments")
async def get_comments_api():
    return get_comments()

@app.post("/like-comment")
async def like_comment_api(request: Request):
    data = await request.json()
    like_comment(data["id"])
    return "added"

@app.post("/unlike-comment")
async def unlike_comment_api(request: Request):
    data = await request.json()
    unlike_comment(data["id"])
    return "added"

@app.post("/dislike-comment")
async def dislike_comment_api(request: Request):
    data = await request.json()
    dislike_comment(data["id"])
    return "added"

@app.post("/undislike-comment")
async def undislike_comment_api(request: Request):
    data = await request.json()
    undislike_comment(data["id"])
    return "added"
