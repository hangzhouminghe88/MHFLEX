import rpc from 'src/utils/rpc';

export default {
  //查询accountKey
  basicQuery(param){
    return rpc.query('brid/huawei/key', param);
  },
  attach(uuid, progressCb){
    return rpc.put(`brid/huawei/key/${uuid}/attach`, null, progressCb)
  },
  detach(uuid, progressCb){
    return rpc.put(`brid/huawei/key/${uuid}/detach`, null, progressCb)
  },
  delete(uuid, progressCb){
    return rpc._delete(`brid/huawei/key/${uuid}`, undefined, progressCb);
  },
  update(uuid, param, progressCb){
    return rpc.create(`brid/huawei/${uuid}/key`, param, progressCb)
  },
  create(param, progressCb){
    return rpc.create('brid/huawei/key', param, progressCb)
  }
}
