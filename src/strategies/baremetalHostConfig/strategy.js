// import _ from 'lodash'

export default {
  canGetHardwareInfo (baremetalChassis) {
    if (!baremetalChassis) return false;
    return !!(baremetalChassis.status !== 'Allocated')
  }
}



// WEBPACK FOOTER //
// ./src/strategies/baremetalHostConfig/strategy.js
