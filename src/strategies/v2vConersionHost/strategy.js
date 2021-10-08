// import _ from 'lodash'

export default {
  canRemoveQos (v2vConversionHost) {
    return ['networkOutboundBandwidth', 'networkInboundBandwidth'].some(it => v2vConversionHost[it] > 0)
  }
}



// WEBPACK FOOTER //
// ./src/strategies/v2vConversionHost/strategy.js