import rpc from 'src/utils/rpc';

export default {
	query(param) {
    return rpc.query(`hybrid/tencent/security-group-rule`, param);
	},
  delete(uuid, progressCb) {
    return rpc._delete(`hybrid/tencent/security-group-rule/remote/${uuid}`, null, progressCb)
  },
  create(param, progressCb) {
    return rpc.create('hybrid/tencent/security-group-rule', param, progressCb);
  },
}
