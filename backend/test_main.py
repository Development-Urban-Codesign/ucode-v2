import json

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_read_root_fails_without_a_database_connection():
    response = client.get("/")
    assert response.status_code == 500
    assert response.json() != None
    assert response.json()["detail"] != None
    assert "Connection refused" in response.json()["detail"] 



def test_get_driving_lane_from_osm_api_wrong_bbox():
    bbox = { "projectId":"Solar One which brakes","bbox":{"xmin": -73.974642, "ymin": 40.734426, "xmax": -73.973958, "ymax": 40.734774}}
    response = client.post("/get-driving-lane-from-osm",json.dumps(bbox))
    assert response.status_code == 412
    assert response.json() != None
    assert response.json()["detail"] != None
    assert "no graph nodes" in response.json()["detail"] 
