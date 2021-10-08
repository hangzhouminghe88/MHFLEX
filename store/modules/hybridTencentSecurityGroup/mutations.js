import Utils from '../../utils';

export default {
	merge (state, objMap) {
    Utils.batchMerge(state, objMap)
  },
  delete (state, uuid) {
    Utils.remove(state, uuid)
  }
}
