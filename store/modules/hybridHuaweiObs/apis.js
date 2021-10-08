import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/huawei/oss-bucket`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/huawei/data-center`, {
      q: `uuid=${uuid}`,
      fields: 'regionId'
    });
  },
  create(param, progressCb, isRmote) {
    let url = 'hybrid/huawei/obs-bucket';
    if(isRmote) url = 'hybrid/huawei/obs-bucket/remote';
    return rpc.create(url, param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/huawei/obs-bucket', uuid, {
      "updateOssBucket": param
    }, progressCb)
  },
  delete(uuid, progressCb, isRemote) {
    debugger
    let url = isRemote ? `hybrid/huawei/obs-bucket/remote/${uuid}` : `hybrid/tencent/oss-bucket/${uuid}`;
    return rpc._delete(url, null, progressCb)
  },
  attach(uuid, progressCb) {
    return rpc.put(`hybrid/huawei/obs-bucket/${uuid}/attach`, null, progressCb)
  }
}
