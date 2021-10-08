import api from './apis';

export default {
  async query(param) {
    if (!param) return;
    let realParam = _.cloneDeep(param);
    if (!param.replyWithCount) realParam.replyWithCount = true;
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      inventories: resp.inventories
    }
  },
  async queryDataCenter(commit, uuid, dataCenterUuid) {
    let res = await api.queryDataCenter(dataCenterUuid);
    return {
        uuid: uuid,
        regionId: res.inventories[0].regionId
    }
  }
}
