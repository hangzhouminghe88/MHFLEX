import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/tencent/image`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/tencent/data-center/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/tencent/image', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('images', uuid, {
      updateImage: param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}${uuid}`, null, progressCb)
  }
}
