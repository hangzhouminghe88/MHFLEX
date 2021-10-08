import rpc from 'src/utils/rpc';

export default {
	query(param) {
    return rpc.query(`hybrid/aliyun/security-group-rule`, param);
	},
  delete(uuid, progressCb) {
    return rpc._delete(`hybrid/aliyun/security-group-rule/remote/${uuid}`, null, progressCb)
  },
  create(param, progressCb) {
    return rpc.create('hybrid/aliyun/security-group-rule', param, progressCb);
  },
}
