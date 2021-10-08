import Utils from '../../utils.js';
import hepler from './helper';
import {arrayToDict} from "../../utils";
import api from "./apis";

let tableName  = 'hybridSecurityGroupRule';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let queryTemplate = Utils.createQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
let actionTemplate = Utils.createActionTemplate(tableName);

export default {
	basicQuery: batchQueryTemplate(async ({ commit, rootState, dispatch }, param) => {
		let ret = await hepler.query(param);
		let mainMap = Utils.arrayToDict(ret.inventories);
		return {
      total: ret.total,
      inventories: mainMap
    }
	}),
  delete: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let uuid = param;
    let ret = await api.delete(uuid, progressCb);
    return ret.inventory;
  }),
  create: batchActionTemplate(async (ctx, {param, progressCb}) => {
    let ret = await api.create(param, progressCb);
    return ret.inventory;
  }),
}
