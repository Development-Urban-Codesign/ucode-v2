import json
from dataclasses import dataclass
from typing import Any, List

from utils import sure_float


@dataclass
class BuildingPolygons:
  projectId: str
  wallcolor: str | None
  wallmaterial: str | None
  roofcolor: str | None
  roofmaterial: str | None
  roofshape: str | None
  roofheight: float | None
  height: float | None
  floors: float | None
  estimatedheight: float | None
  geom: str | None


def create_building_polygons(projectId:str, data_building)-> List[Any]:
      result = []
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

          geom = json.dumps(f["geometry"])
          tpl =  tuple((
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
                  geom)
          )

          result.append(tpl)
          
      return result

def create_building_holes_polygons(projectId:str, bhole)-> List[Any]:
    result = []
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
            geom = json.dumps(f["geometry"])
            tpl =  tuple((
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
                    geom)
            )

            result.append(tpl)
          
    return result


def persist_building_polygons(connection:Any, building_polygons:List[BuildingPolygons]):
   
    cursor = connection.cursor()
    insert_query_building = """
        INSERT INTO building (project_id,wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, (st_buffer(st_buffer(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)::geography, 1,'side=right'),1)::geography)::geometry);
    """
    cursor.executemany(insert_query_building, building_polygons)
    # batching doesn't bare much performance differences here because of the GIS operations involved
    #ps2.execute_batch(cursor, insert_query_building, building_polygons)
    connection.commit()
    cursor.close()
    connection.close()

def persist_building_holes_polygons(connection:Any, building_polygons:List[BuildingPolygons]):
   
    cursor = connection.cursor()
    insert_query_building = """
        INSERT INTO building (project_id,wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    """
    cursor.executemany(insert_query_building, building_polygons)
    # batching doesn't bare much performance differences here because of the GIS operations involved
    #ps2.execute_batch(cursor, insert_query_building, building_polygons)
    connection.commit()
    cursor.close()
    connection.close()
  