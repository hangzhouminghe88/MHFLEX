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
  async queryHybridVpc(commit, uuid, vpcUuid) {
    let res = await api.queryHybridVpc(vpcUuid);
    return{
        uuid: uuid,
        vpcName: res.inventories[0].name
    }
  }
}
