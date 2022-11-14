import { expect, test } from "vitest";
import { localCordsFromWorldCords } from "./ThreejsGeometryCreation";

test("should map world coordinates to local ones in the 0..1 range", () => {
  expect(localCordsFromWorldCords({ lng: 8.24287, lat: 49.992401 })).toEqual({
    x: 0.5228968611111111,
    y: 0.33917761076346487,
    z: 0,
  });
});
