import Vue from 'vue';
import Vuex from 'vuex';
import db from './modules/db.js';
import assistantManager from './modules/assistantManager.js'
import timerManager from './modules/timeManager.js';
import windowManager from './modules/windowManager';
import toastManager from './modules/toastManager';
import vm from './modules/vm/index';
import instanceOffering from './modules/instanceOffering/index';
import image from './modules/image/index';
import l3network from './modules/l3network/index';
import volumeoffering from './modules/volumeOffering/index';

import webStorage from './modules/webStorage';
import fiberChannelLun from './modules/fiberChannelLun';
import fiberChannelController from './modules/fiberChannelController';

import volume from './modules/volume/index';
import dialog from './modules/dialogs.js';
import tag from './modules/tag/index';
import scheduler from './modules/scheduler/index';
import cdRom from './modules/cdRom/index';
import dialogManager from './modules/dialogManager';
import usbdevice from './modules/usbdevice';
import account from './modules/account';
import autoScalingGroup from './modules/autoScalingGroup';
import loadBalancer from './modules/loadBalancer';
import loadBalancerListener from './modules/loadBalancerListener';
import autoScalingGroupActivity from './modules/autoScalingGroupActivity';
import zone from './modules/zone';
import adLdap from './modules/adldap';
import user from './modules/user';
import userGroup from './modules/userGroup';
import timer from './modules/timer';
import certificate from './modules/certificate';
import consoleProxy from './modules/consoleProxy';
import accessKey from './modules/accessKey';
import zwatchSNSTextTemplate from './modules/zwatchsnstexttemplate';
import resourceStack from './modules/resourceStack';
import sysResourceStackTemplate from './modules/sysResourceStackTemplate';
import vCenter from './modules/vCenter';
import timerService from './modules/timerService';

import hybridAliCloudImage from './modules/hybridAliCloudImage/index';
import hybridAliCloudSecurityGroup from './modules/hybridAliCloudSecurityGroup'
import hybridAliCloudVpc from './modules/hybridAliCloudVpc';
import hybridAliCloudDisk from './modules/hybridAliCloudDisk'
import hybridAliCloudVirtualRouter from './modules/hybridAliCloudVirtualRouter'
import hybridAliCloudVirtualrouterEntry from './modules/hybridAliCloudVRentry';
import hybridAliCloudSecurityGroupRule from  './modules/hybridAliCloudSecurityGroupRule';
import hybridAliCloudEip from './modules/hybridAliCloudEip';
import hybridAliCloudVpcGateway from './modules/hybridAliCloudVpcGateway';
import hybridAliCloudUserVpnGateway from './modules/hybridAliCloudUserVpnGateway';
import hybridAliCloudVpnConnection from './modules/hybridAliCloudVpnConnection';
import hybridAliCloudVirtualBorderRouter from './modules/hybridAliCloudVirtualBorderRouter';
import hybridAlicloudVirtualRouterInterface from './modules/hybridAliCloudVirtualRouterInterface';
import hybridAliCloudConnectionAccessPoint from './modules/hybridAliCloudConnectionAccessPoint';
import hybridAliCloudFileSystem from './modules/hybridAliCloudFileSystem';
import hybridAliCloudAccessGroup from './modules/hybridAliCloudAccessGroup';
import hybridAliCloudAccessGroupRule from './modules/hybridAliCloudAccessGroupRule'

import hybridTencentSecretKey from './modules/hybridTencentSecretKey';
import hybridTencentDataCenter from './modules/hybridTencentDataCenter';
import hybridTencentIdentityZone from './modules/hybridTencentIdentityZone';
import hybridTencentDisk from './modules/hybridTencentDisk';
import hybridTencentVpc from './modules/hybridTencentVpc';
import hybridTencentSubNets from './modules/hybridTencentSubNet';
import hybridTencentImage from './modules/hybridTencentImage';
import hybridTencentSecurityGroup from './modules/hybridTencentSecurityGroup';
import hybridTencentEcsInstance from './modules/hybridTencentEcs';
import hybridTencentEip from './modules/hybridTencentEip';
import hybridTencentSecurityGroupRule from './modules/hybridTencentSecurityGroupRule';
import hybridTencentVirtualRouter from './modules/hybridTencentVpcVrouter';
import hybridTencentVirtualRouterEntry from './modules/hybridTencentVirtualEntry';
import hybridTencentVpcVpnGateway from './modules/hybridTencentVpnGateWay';
import hybridTencentBucket from './modules/hybridTencentBucket';
import hybridTencentVpcUserGateway from './modules/hybridTencentVpnUserGateWay';
import hybridTencentVpcVpnConnection from './modules/hybridTencentVpnConnection';

//华为云相关的状态
import hybridHuaWeiAccountKey from  './modules/huaweiAccountKey';
import hybridHuaweiDataCenter from './modules/huaweiDataCenter';
import hybridHuaweiIdentityZone from './modules/hybridHuaweiIdentityZone';
import hybridHuaweiEcsInstance from './modules/hybridHuaweiEcs';
import hybridHuaweiImage from './modules/hybridHuaweiImage';
import hybridHuaweiSecurityGroup from './modules/hybridHuaweiSecurityGroup';
import hybridHuaweiSubNet from './modules/hybridHuaweiSubNet';
import hybridHuaweiDisk from './modules/hybridHuaweiDisk';
import hybridHuaweiVpc from './modules/hybridHuaweiVpc';
import hybridHuaweiEip from './modules/hybridHuaweiEip';
import hybridHuaweiBucket from './modules/hybridHuaweiObs';


Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    db,
    timerManager,
    windowManager,
    dialogManager,
    toastManager,
    assistantManager,
    vm,
    instanceOffering,
    volumeoffering,
    image,
    l3network,
    webStorage,
    fiberChannelLun,
    fiberChannelController,
    volume,
    dialog,
    tag,
    scheduler,
    cdRom,
    usbdevice,
    account,
    autoScalingGroup,
    loadBalancer,
    loadBalancerListener,
    autoScalingGroupActivity,
    zone,
    adLdap,
    user,
    userGroup,
    timer,
    certificate,
    consoleProxy,
    accessKey,
    zwatchSNSTextTemplate,
    resourceStack,
    sysResourceStackTemplate,
    vCenter,
    timerService,

    hybridAliCloudImage,
    hybridAliCloudSecurityGroup,
    hybridAliCloudVpc,
    hybridAliCloudDisk,
    hybridAliCloudVirtualRouter,
    hybridAliCloudVirtualrouterEntry,
    hybridAliCloudSecurityGroupRule,
    hybridAliCloudEip,
    hybridAliCloudVpcGateway,
    hybridAliCloudUserVpnGateway,
    hybridAliCloudVpnConnection,
    hybridAliCloudVirtualBorderRouter,
    hybridAlicloudVirtualRouterInterface,
    hybridAliCloudConnectionAccessPoint,
    hybridAliCloudFileSystem,
    hybridAliCloudAccessGroup,
    hybridAliCloudAccessGroupRule,

    hybridTencentSecretKey,
    hybridTencentDataCenter,
    hybridTencentIdentityZone,
    hybridTencentDisk,
    hybridTencentVpc,
    hybridTencentSubNets,
    hybridTencentImage,
    hybridTencentSecurityGroup,
    hybridTencentEcsInstance,
    hybridTencentEip,
    hybridTencentSecurityGroupRule,
    hybridTencentVirtualRouter,
    hybridTencentVirtualRouterEntry,
    hybridTencentVpcVpnGateway,
    hybridTencentBucket,
    hybridTencentVpcUserGateway,
    hybridTencentVpcVpnConnection,

    //华为云相关module
    hybridHuaWeiAccountKey,
    hybridHuaweiDataCenter,
    hybridHuaweiIdentityZone,
    hybridHuaweiEcsInstance,
    hybridHuaweiImage,
    hybridHuaweiSecurityGroup,
    hybridHuaweiSubNet,
    hybridHuaweiDisk,
    hybridHuaweiVpc,
    hybridHuaweiEip,
    hybridHuaweiBucket
  },
  actions: {

  },
  mutations: {

  }
})
