from demo_service import demo


def test_demo_appending_to_string():
  given = demo("TestRun")
  expected = "DEMO: TestRun"
  assert given == expected
