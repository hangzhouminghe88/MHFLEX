import Utils from '../../utils';
export default {
  merge(state, tagObj){
    Utils.batchMerge(state, tagObj)
  },
  delete (state, uuid) {
    Utils.remove(state, uuid)
  }
}
