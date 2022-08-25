import { createStore } from "vuex";
import map from './modules/map';
import aoi from './modules/aoi';
import contribution from './modules/contribution';
import comment from './modules/comment';


export default createStore({
    modules: {
      map,
      aoi,
      contribution,
      comment
    }
})