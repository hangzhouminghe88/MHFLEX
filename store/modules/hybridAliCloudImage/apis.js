import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/aliyun/image`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/data-center/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/aliyun/image', param, progressCb);
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
