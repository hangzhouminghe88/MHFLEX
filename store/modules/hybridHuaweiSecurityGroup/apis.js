import rpc from 'src/utils/rpc';

export default {
	query(param) {
    return rpc.query(`hybrid/huawei/security-group`, param);
	},
	queryDataCenter(uuid){
		return rpc.query(`/brid/data-center/${uuid}`);
	},

	queryVpc(uuid){
		return rpc.query(`hybrid/huawei/vpc/${uuid}`);
	},

	queryEcs(uuid){
		return rpc.query('hybrid/huawei/ecs', {
			count: true,
			q: `ecsSecurityGroupUuid=${uuid}`
		});
	},
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}/${uuid}`, null, progressCb)
	},
	update(uuid, param, progressCb) {
		return rpc.update('hybrid/huawei/security-group', uuid, {
			"updateEcsSecurityGroup": param
		}, progressCb)
	}
}
