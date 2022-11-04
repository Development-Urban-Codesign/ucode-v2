
import json

from roads import getDriveNetwork

fixture = '{"type": "FeatureCollection", "features": [{"id": "(6331080434, 42451018, 0)", "type": "Feature", "properties": {"osmid": 676028733, "oneway": true, "name": "Peter Cooper Road", "highway": "residential", "maxspeed": "25 mph", "reversed": false, "length": 13.440999999999999}, "geometry": {"type": "LineString", "coordinates": [[-73.9750336, 40.7341911], [-73.9749402, 40.7341946], [-73.9748747, 40.7342008]]}}]}'


def test_getDriveNetwork():
    road = getDriveNetwork( ymin=40.733811, ymax= 40.735189, xmin=-73.973409, xmax=-73.975191)
    assert road != None
    assert json.dumps(road) == fixture

