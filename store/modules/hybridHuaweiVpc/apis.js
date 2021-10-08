import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/huawei/vpc`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/huawei/data-center/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/huawei/vpc', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/huawei/vpc', uuid, {
      "updateEcsVpc": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}${uuid}`, null, progressCb)
  }
}
