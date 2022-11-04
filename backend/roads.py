import json

import osmnx as ox


def getDriveNetwork( ymin:float, ymax:float, xmin:float,  xmax: float) -> str:
    G = ox.graph_from_bbox(ymin, ymax, xmin, xmax, network_type='drive')
    gdf = ox.graph_to_gdfs(G, nodes=False, edges=True)
    return json.loads(gdf.to_json())