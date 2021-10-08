import Utils from '../../utils';

export default{
  merge(state, targetObj){
    Utils.batchMerge(state, targetObj);
  },
  delete(state, uuid){
    Utils.remove(state, uuid)
  }
}
