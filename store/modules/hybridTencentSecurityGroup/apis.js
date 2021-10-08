import rpc from 'src/utils/rpc';

export default {
	query(param) {
    return rpc.query(`hybrid/tencent/security-group`, param);
	},
	queryDataCenter(uuid){
		return rpc.query(`/hybrid/tencent/data-center/${uuid}`);
	},

	queryVpc(uuid){
		return rpc.query(`hybrid/tencent/vpc/${uuid}`);
	},

	queryEcs(uuid){
		return rpc.query('hybrid/tencent/ecs', {
			count: true,
			q: `ecsSecurityGroupUuid=${uuid}`
		});
	},
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}/${uuid}`, null, progressCb)
	},
	update(uuid, param, progressCb) {
		return rpc.update('/hybrid/tencent/security-group', uuid, {
			"updateEcsSecurityGroup": param
		}, progressCb)
	}
}
