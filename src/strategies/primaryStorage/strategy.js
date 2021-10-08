import _ from 'lodash'

export default {
  canCreateVolume (ps) {

    return ps.state === 'Enabled' && ps.status === 'Connected'
  },
  canDetachCluster (ps) {
    if(ps.attachedClusterUuids)
     return ps.attachedClusterUuids.length > 0
    else return false;
  },
  canMaintenance (ps) {
    if (!ps) return false;
    return ps.state !== 'Maintenance' && ps.status !== 'Disconnected'
  },
  canMaintenanceList (uuidList, psTable) {
    if (!psTable) return false;
    return _.every(uuidList, uuid => this.canMaintenance(psTable[uuid]))
  },
  canEnable (ps) {
    if (!ps) return false;
    return ps.state !== 'Enabled'
  },
  canDisable (ps) {
    if (!ps) return false;
    return ps.state !== 'Disabled'
  }
}



// WEBPACK FOOTER //
// ./src/strategies/primaryStorage/strategy.js
