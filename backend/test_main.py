from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_read_root_fails_without_a_database_connection():
    response = client.get("/")
    assert response.status_code == 500
    assert response.json() != None
    assert response.json()["detail"] != None
    assert "Connection refused" in response.json()["detail"] 

def test_read_root_succeeds_without_a_database_connection():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() != None
    assert response.json()["detail"] == None