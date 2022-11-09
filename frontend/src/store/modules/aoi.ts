export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

export interface AOIState {
  projectSpecification: ProjectSpecification;
  projectId: string;
  overpassBuildings: null;
  usedTagsForGreenery: unknown;
  overpassGreenery: unknown;
  dataIsLoaded: boolean;
  dataIsLoading: boolean;
  mapIsPopulated: boolean;
  isDevmode: boolean;
  userId: string;
}

export interface ProjectSpecification {
  projectId: string;
  bbox: BoundingBox;
  project_name: string;
}

const aoi = {
  namespaced: true,
  state: {
    //bbox: { xmin: 13.723167, ymin:51.053100, xmax: 13.770031, ymax: 51.079799 }, // DResden
    projectSpecification: null, // Mainz
    projectId: "",
    userId: "",
    //bbox: { xmin: -74.023387, ymin: 40.741825, xmax: -73.877212, ymax: 40.825175}, // Manhatten
    overpassBuildings: null,
    usedTagsForGreenery: {
      tags: [
        "natural:wood",
        "landuse:meadow",
        "landuse:recreation_ground",
        "leisure:garden",
        "leisure:park",
        "leisure:pitch",
        "landuse:village_green",
        "landuse:grass",
        "landuse:garden",
        "landuse:cemetery",
        "landuse:allotments",
        "landuse:forest",
        "natural:scrub",
        "landuse:village_green",
      ],
    },
    overpassGreenery: null,
    dataIsLoaded: false,
    dataIsLoading: false,
    mapIsPopulated: false,
    isDevmode: false,
  },
  mutations: {
    setProjectSpecification(state: AOIState, payload: ProjectSpecification) {
      state.projectSpecification = payload;
    },
    setProjectId(state: AOIState, projectId: string) {
      state.projectId = projectId;
    },
    setDevmode(state: AOIState, bool: boolean) {
      state.isDevmode = bool;
    },
    setUserId(state: AOIState, userId: string){
      state.userId = userId
  },
  },
  actions: {
    setDataIsLoaded({ state }: { state: AOIState }) {
      state.dataIsLoading = false;
      state.dataIsLoaded = true;
      setTimeout(() => (state.dataIsLoaded = false), 3000);
    },
    setDataIsLoading({ state }: { state: AOIState }) {
      state.dataIsLoading = true;
    },
    setMapIsPopulated({ state }: { state: AOIState }) {
      state.mapIsPopulated = true;
    },
  },
  getters: {},
};

export default aoi;
