import util from "../../utils";

export default {
  merge (state, objMap) {
    util.batchMerge(state, objMap)
  },
  delete (state, uuid) {
    util.remove(state, uuid)
  }
}
