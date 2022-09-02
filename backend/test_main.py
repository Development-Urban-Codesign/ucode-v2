from fastapi.testclient import TestClient

from main import app, create_user_id_from_meta_data

client = TestClient(app)


def test_read_root_fails_without_a_database_connection():
    response = client.get("/")
    assert response.status_code == 500
    assert response.json() != None
    assert response.json()["detail"] != None
    assert "Connection refused" in response.json()["detail"]


def test_create_user_id_from_meta_data():
    user_id =create_user_id_from_meta_data({
            "host": "localhost:8000",
            "upgrade-insecure-requests": "1",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.1 Safari/605.1.15",
            "accept-language": "en-GB,en;q=0.9",
            "accept-encoding": "gzip, deflate",
            "connection": "keep-alive",
        }
    )
    assert user_id ==  "e0f9540ba40611170506264cc2c9a0c681c936b0afb7b3835de61cb55085039e"
