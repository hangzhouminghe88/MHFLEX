import api from './apis';
export default{
  async basicQuery(param) {
    let realParam = _.cloneDeep(param);
    if(!param.replayWithCount) realParam.replayWithCount = true;
    if(param.sortBy && param.sortDirection) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`;
    }
    let ret = await api.basicQuery(realParam);
    return {
      zoneArray: ret.inventories,
      total: ret.total
    }
  },
  async detailQuery(param){
    let ret = await api.detailQuery(param);
    return ret.inventories[0]
  }
}
