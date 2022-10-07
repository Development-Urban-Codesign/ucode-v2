export interface UiState {
  projectsLoaded: boolean;
  devMode: boolean;
  aoiMapPopulated: boolean;
}

export default {
  namespaced: true,
  state: {
    loaded: false,
    devMode: false,
    aoiMapPopulated: false,
  },
  mutations: {
    loadedProjects(state: UiState, payload: boolean) {
      state.projectsLoaded = payload;
    },
    toggleDevMode(state: UiState, status: boolean) {
      state.devMode = status;
    },
    aoiMapPopulated(state: UiState, status: boolean) {
      state.aoiMapPopulated = status;
    },
  },
  actions: {},
  getters: {
    loaded(state: UiState) {
      return state.projectsLoaded;
    },
    devMode(state: UiState) {
      return state.devMode;
    },
  },
};
