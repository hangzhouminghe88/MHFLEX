import rpc from 'src/utils/rpc';

export default {
	query(param) {
    return rpc.query(`hybrid/aliyun/security-group`, param);
	},
	queryDataCenter(uuid){
		return rpc.query(`hybrid/data-center/${uuid}`);
	},

	queryVpc(uuid){
		return rpc.query(`hybrid/aliyun/vpc/${uuid}`);
	},

	queryEcs(uuid){
		return rpc.query('hybrid/aliyun/ecs', {
			count: true,
			q: `ecsSecurityGroupUuid=${uuid}`
		});
	},
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}/${uuid}`, null, progressCb)
  }
}
