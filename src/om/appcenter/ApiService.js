import axios from 'axios'
import { getServerUrl } from 'src/utils/utils'

export function addPlugin (params) {
  let config = {
    method: 'post',
    baseURL: getServerUrl(),
    url: '/plugins/' + params.uuid,
    params: params
  }
  return axios(config).then((response) => { return response.data })
}

export function updatePlugin (params) {
  let config = {
    method: 'put',
    baseURL: getServerUrl(),
    url: '/plugins/' + params.uuid,
    params: params
  }
  return axios(config).then((response) => { return response.data })
}

export function deletePlugin (uuid) {
  let config = {
    method: 'delete',
    baseURL: getServerUrl(),
    url: '/plugins/' + uuid
  }
  return axios(config).then((response) => { return response.data })
}

export function queryPlugins (params) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/plugins/list',
    params: params
  }
  return axios(config).then((response) => { return response.data })
}

export function getPlugin (uuid) {
  let config = {
    method: 'get',
    baseURL: getServerUrl(),
    url: '/plugins/' + uuid
  }
  return axios(config).then((response) => { return response.data })
}

export default {
  addPlugin,
  updatePlugin,
  deletePlugin,
  queryPlugins,
  getPlugin
}
