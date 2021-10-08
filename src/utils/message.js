import axios from 'axios'
import { getServerUrl } from 'src/utils/utils'

export function addEvent (uuid, event, account, accountType) {
  let config = {
    method: 'post',
    baseURL: getServerUrl(),
    url: '/events/' + uuid,
    headers: {'Content-Type': 'application/json', 'X-Account': account, 'X-Account-Type': accountType},
    data: event
  }
  return axios(config)
}

export function updateEvent (uuid, event, account, accountType) {
  let config = {
    method: 'put',
    baseURL: getServerUrl(),
    url: '/events/' + uuid,
    headers: {'Content-Type': 'application/json', 'X-Account': account, 'X-Account-Type': accountType},
    data: event
  }
  return axios(config)
}

export function addCall (uuid, call) {
  let config = {
    method: 'post',
    baseURL: getServerUrl(),
    url: '/calls/' + uuid,
    headers: {'Content-Type': 'application/json'},
    data: call
  }
  return axios(config)
}

export function updateCall (uuid, call) {
  let config = {
    method: 'put',
    baseURL: getServerUrl(),
    url: '/calls/' + uuid,
    headers: {'Content-Type': 'application/json'},
    data: call
  }
  return axios(config)
}

export function getEventUuids (account) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/events/uuids',
    headers: {'X-Account': account}
  }
  return axios(config).then((response) => { return response.data })
}

export function getEvent (uuid) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/events/' + uuid
  }
  return axios(config).then((response) => { return response.data })
}

export function getCall (uuid) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/calls/' + uuid
  }
  return axios(config).then((response) => { return response.data }).catch((error) => { console.log(error) })
}

export function getEventByPage (condition) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/events/page',
    params: condition
  }
  return axios(config).then((response) => { return response.data })
}

export function getEventByUuids (condition) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/events',
    params: condition
  }
  return axios(config).then((response) => { return response.data })
}

export function getEventCalls (uuid) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/events/' + uuid + '/calls'
  }
  return axios(config).then((response) => { return response.data })
}

export default {
  addEvent,
  updateEvent,
  addCall,
  updateCall,
  getEventUuids,
  getEvent,
  getCall,
  getEventByPage,
  getEventCalls,
  getEventByUuids
}



// WEBPACK FOOTER //
// ./src/utils/message.js