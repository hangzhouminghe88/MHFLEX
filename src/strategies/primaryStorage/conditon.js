import _ from 'lodash'
import {getAvailablePsTypes} from 'src/strategies/utils/clusterMapPrimaryStorage'
import rpc from 'src/utils/rpc'

export default {
  /* create ps */
  async getPrimaryStorageAttachableClusterByType (psType, isOpensource) {
    let resp = await rpc.query('clusters', {fields: 'uuid'});
    let clusterUUids = resp.inventories.map(cluster => {
      return cluster.uuid
    });
    if (isOpensource) {
      return clusterUUids
    } else {
      let result = [];
      let taskList = [];
      clusterUUids.forEach(uuid => {
        let p = rpc.query('primary-storage', { q: `cluster.uuid=${uuid}` }).then((res) => {
          let psTypes = getAvailablePsTypes(res.inventories);
          if (psTypes.indexOf(psType) !== -1) {
            result.push(uuid)
          }
        });
        taskList.push(p)
      });
      return Promise.all(taskList).then(() => {
        return result
      })
    }
  },
  /* existed ps */
  async getPrimaryStorageAttachableCluster (primarystorage, isOpensource) {
    if (!primarystorage) {
      return []
    }
    let attachableClusterUuids = await this.getPrimaryStorageAttachableClusterByType(primarystorage.type, isOpensource);
    let attachedClusterUuids = primarystorage.attachedClusterUuids;
    return _.difference(attachableClusterUuids, attachedClusterUuids)
  },
  async getClusterAttachablePrimaryStorage (uuid) {
    let result = [];
    let attachedPsUuidList = [];
    let resp = await rpc.query('primary-storage', {q: `cluster.uuid=${uuid}`});
    let attachedPsList = resp.inventories;
    attachedPsList.forEach(ps => {
      attachedPsUuidList.push(ps.uuid)
    });
    let psTypes = getAvailablePsTypes(attachedPsList);
    let psResp = await rpc.query('primary-storage', {
      q: [`uuid!?=${attachedPsUuidList}`, `type?=${psTypes}`],
      fields: 'uuid'
    });
    psResp.inventories.forEach(ps => {
      result.push(ps.uuid)
    });
    return result
  }
}

