import { createStore } from "vuex";
import map from './modules/map';
import aoi from './modules/aoi';
import contribution from './modules/contribution';

import comment from './modules/comment';
import pulse from './modules/pulse';
import quests from './modules/quests';

export default createStore({
    modules: {
      map,
      aoi,
      contribution,
      comment,
      pulse,
      quests
    }
})