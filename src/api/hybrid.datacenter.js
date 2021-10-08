import rpc from 'src/utils/rpc'

/*
  查询本地地域[list]
  QueryDataCenterFromLocal
*/
let queryList = function (param) {
  return rpc.query('hybrid/data-center', param)
}

/*
  查询本地地域[one]
  QueryDataCenterFromLocal
*/
let queryDetail = function (uuid) {
  return rpc.query(`hybrid/data-center/${uuid}`)
}

export default {
  queryList,
  queryDetail
}



// WEBPACK FOOTER //
// ./src/api/hybrid.datacenter.js