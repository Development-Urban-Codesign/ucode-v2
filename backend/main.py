from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import requests
from db import get_table_names, get_buildings_from_osm, init_building_table, get_buildings_from_db

app = FastAPI()
origins = [
    "https://v2.urban-codesign.com",
    "http://localhost",
    "http://localhost:8080"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
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
    
    
@app.post("/get-buildings-from-osm")
async def get_buildings_from_osm_api(request: Request):
    data = await request.json()
    init_building_table()
    xmin = data['bbox']["xmin"]
    ymin = data['bbox']["ymin"]
    xmax = data['bbox']["xmax"]
    ymax = data['bbox']["ymax"]
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query_building = """
        [out:json];
        way["building"](%s,%s,%s,%s);
        convert item ::=::,::geom=geom(),_osm_type=type();
        out geom;
    """ % ( ymin, xmin, ymax ,xmax )

    response_building = requests.get(overpass_url, 
                        params={'data': overpass_query_building})
    
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
        if 'roof:height' in f['tags']: roofheight =f['tags']['roof:height']
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