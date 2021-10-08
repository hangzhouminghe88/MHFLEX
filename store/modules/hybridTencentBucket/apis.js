import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/tencent/oss-bucket`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/tencent/data-center`, {
      q: `uuid=${uuid}`,
      fields: 'regionId'
    });
  },
  create(param, progressCb, isRmote) {
    let url = 'hybrid/tencent/oss-bucket';
    if(isRmote) url = 'hybrid/tencent/oss-bucket/remote';
    return rpc.create(url, param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/tencent/oss-bucket', uuid, {
      "updateOssBucket": param
    }, progressCb)
  },
  delete(uuid, progressCb, isRemote) {
    debugger
    let url = isRemote ? `hybrid/tencent/oss-bucket/remote/${uuid}` : `hybrid/tencent/oss-bucket/${uuid}`;
    return rpc._delete(url, null, progressCb)
  },
  attach(uuid, progressCb) {
    return rpc.put(`hybrid/tencent/oss-bucket/${uuid}/attach`, null, progressCb)
  }
}
