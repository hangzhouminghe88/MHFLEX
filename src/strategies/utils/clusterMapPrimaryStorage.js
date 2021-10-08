import _ from 'lodash'
import {assert, compileRules} from './conditionBase'

const PS_TYPES = ['LocalStorage', 'NFS', 'SharedMountPoint', 'Ceph', 'Fusionstor', 'SharedBlock', 'AliyunNAS'];

const CLUSTER_PRIMARYSTORAGE = {
  rules: [
    {'LocalStorage(>1)': ['LocalStorage']},
    {'LocalStorage(=1)': ['LocalStorage', 'NFS', 'SharedMountPoint', 'SharedBlock']},
    {'NFS(>1)': ['NFS']},
    {'NFS(=1)': ['LocalStorage', 'NFS']},
    {'SharedMountPoint(=1)': ['LocalStorage']},
    {'Ceph(=1)': []},
    {'Fusionstor(=1)': []},
    {'LocalStorage(=1) && NFS(=1)': []},
    {'LocalStorage(=1) && SharedMountPoint(=1)': []},
    {'SharedBlock(=1)': ['LocalStorage', 'SharedBlock']},
    {'LocalStorage(=1) && SharedBlock(=1)': []},
    {'SharedBlock(>1)': ['SharedBlock']},
    {'AliyunNAS(=1)': []}
  ]
};

function getExistedTypes (existedRows) {
  let types = {};
  for (let type of PS_TYPES) {
    types[type] = 0
  }
  for (let row of existedRows) {
    types[row.type]++
  }
  return types
}

function doFilter (existedTypes, compiledRules) {
  let availablePsTypes = [];
  for (let rule of compiledRules) {
    let childrenRules = rule.rules;
    let isRight = true;
    for (let childRule of childrenRules) {
      if (!assert(existedTypes[childRule.name], childRule.oper, childRule.value)) {
        isRight = false;
        break
      }
    }
    if (isRight) availablePsTypes.push(rule.output)
  }
  if (availablePsTypes.length === 0) {
    return PS_TYPES
  }
  return _.intersection(...availablePsTypes)
}

export function getAvailablePsTypes (existedRows) {
  let existedTypes = getExistedTypes(existedRows);
  let compiledRules = compileRules(CLUSTER_PRIMARYSTORAGE.rules);
  return doFilter(existedTypes, compiledRules)
}



// WEBPACK FOOTER //
// ./src/strategies/utils/clusterMapPrimaryStorage.js
