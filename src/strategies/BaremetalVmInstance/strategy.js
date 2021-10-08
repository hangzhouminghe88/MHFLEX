import _ from 'lodash'

export default {
  canOpenConsole (vm, pxeTable) {
    if (!_.includes(['Running'], vm.state)) return false;
    if (!_.includes(['Provisioning', 'Provisioned'], vm.status)) return false;
    if (!vm.pxeServerUuid) return true;
    if (_.get(pxeTable, `${vm.pxeServerUuid}.state`) !== 'Enabled') return false;
    if (_.get(pxeTable, `${vm.pxeServerUuid}.status`) !== 'Connected') return false;
    return true
  }
}



// WEBPACK FOOTER //
// ./src/strategies/BaremetalVmInstance/strategy.js
