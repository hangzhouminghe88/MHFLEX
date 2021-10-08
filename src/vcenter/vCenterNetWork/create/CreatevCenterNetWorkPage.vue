<template>
 <create-template>
   <div slot="header" class="create-header">
     <span >{{$t('common.createNetwork')}}</span>
     <span class="create-back" @click="$router.push({name: 'vcenternetwork'})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px;">回到vCenter网络列表</span>
     </span>
   </div>

   <div slot="body" class="create-body">

     <div class="operation-row">
       <el-radio-group v-model="showNetworkType">
         <el-radio :label="true">{{$t('common.publicNetwork')}}</el-radio>
         <el-radio :label="false">{{$t('common.privateNetwork')}}</el-radio>
       </el-radio-group>
     </div>

     <div class="operation-row">
       <div class="title required">{{$t('common.name')}}</div>
       <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
       <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
     </div>

     <div class="operation-row">
       <div class="title">{{$t('common.description')}}</div>
       <textarea v-model="description" rows="3"/>
     </div>

     <div class="operation-row">
       <div class="title required">{{$t('common.type')}}</div>
       <help-trigger name="vCenter"/>
       <el-select v-model="l2type" style="width:100%;">
         <el-option label="L2NoVlanNetwork" value="L2NoVlanNetwork">L2NoVlanNetwork</el-option>
         <el-option label="L2VlanNetwork" value="L2VlanNetwork">L2VlanNetwork</el-option>
       </el-select>
     </div>

     <div class="operation-row" v-if="l2type === 'L2VlanNetwork'">
       <div class="title required">Vlan ID</div>
       <input type="number" v-model="vlan" maxLength="255" :class="{'is-error': emptyvlan}" @blur="validate('vlan')"/>
       <div class="error error-text" v-if="emptyvlan">{{$t('error.emptyInput') + 'Vlan'}}</div>
     </div>

     <div class="operation-row">
       <div class="title required">Switch</div>
       <input type="text" v-model="physicalInterface" :class="{'is-error': emptyphysicalInterface}" @blur="validate('physicalInterface')"/>
       <help-trigger name="Switch"/>
       <div class="error error-text" v-if="emptyphysicalInterface">{{$t('error.emptyInput') + 'Switch'}}</div>
     </div>

     <div class="operation-row">
       <div class="title required">{{$t('common.cluster')}}</div>
       <add-or-delete-input :class="{'is-error': emptyclusterUuid}" @open="openClusterSelect" :value="dbData.cluster[clusterUuid] && dbData.cluster[clusterUuid].name"
                            @remove="removeUuid('clusterUuid')"/>
       <div class="error error-text" v-if="emptyclusterUuid">{{$t('error.emptyInput') +$t('common.cluster')}}</div>
     </div>

     <div class="operation-row" v-if="!showNetworkType">
       <el-radio-group v-model="networkType">
         <el-radio :label="'Flat'">{{$t("common.flatNetwork")}}</el-radio>
         <el-radio :label="'vrouter'">{{$t("common.vRouter")}}</el-radio>
       </el-radio-group>
     </div>

     <div id="common-virtualRouterOffering" class="operation-row" v-if="networkType === 'vrouter' && !showNetworkType">
       <div class="title required">
         {{ $t("common.virtualRouterOffering") }}
       </div>
       <add-or-delete-input @open="openVirturalRouterOfferingSelect" :value="dbData.instanceOffering[virtualRouterOfferingUuid] &&
                            dbData.instanceOffering[virtualRouterOfferingUuid].name" :class="{'error-input': emptyvirtualRouterOfferingUuid}"
                            @remove="removeUuid('virtualRouterOfferingUuid')"/>
       <div class="error error-text" v-if="emptyvirtualRouterOfferingUuid">{{$t('error.emptyInput') + $t("common.virtualRouterOffering")}}</div>
     </div>

     <div class="operation-row">
       <el-checkbox v-model="DHCP" :disabled="true">{{$t('common.closeDHCPServer')}}</el-checkbox>
       <help-trigger name="closevCenterDHCPServer" />
     </div>

     <div class="operation-block-header">
       {{ $t("common.addIpRange") }}
     </div>
     <div style="width: 300px; border-bottom: 1px solid #ccc;"></div>

     <div class="operation-row">
       <div class="title">{{$t('common.method')}}</div>
       <el-radio-group v-model="showMethod">
         <el-radio :label="true">{{ $t("common.ipRange ")}}</el-radio>
         <el-radio :label="false">{{ $t("common.cidr")}}</el-radio>
       </el-radio-group>
     </div>

     <div class="operation-row" v-if="showMethod">
       <div class="title required">{{$t("common.startIp")}}</div>
       <input type="text" placeholder="192.168.0.100" v-model="startIp" :class="{'is-error': emptystartIp || invaldstartIp}" @blur="validate('startIp')"/>
       <div class="error error-text" v-if="emptystartIp">{{$t('error.emptyInput') + $t("common.startIp")}}</div>
       <div class="error error-text" v-if="!emptystartIp && invaldstartIp">{{$t('error.invalid') + $t("common.startIp")}}</div>
     </div>

     <div class="operation-row" v-if="showMethod">
       <div class="title required">{{$t("common.endIp")}}</div>
       <input type="text"  placeholder="192.168.0.255" v-model="endIp" :class="{'is-error': emptyendIp || invaldendIp}" @blur="validate('endIp')"/>
       <div class="error error-text" v-if="emptyendIp">{{$t('error.emptyInput') + $t("common.startIp")}}</div>
       <div class="error error-text" v-if="!emptyendIp && invaldendIp">{{$t('error.invalid') + $t("common.endIp")}}</div>
     </div>

     <div class="operation-row" v-if="showMethod">
       <div class="title required">
         {{$t("common.netmask")}}
       </div>
       <input placeholder="255.255.0.0" v-model="netmask" :class="{'is-error': emptynetmask || invalidnetmask}" @blur="validate('netmask')"/>
       <div class="error error-text" v-if="emptynetmask">
         {{$t("error.emptyInput")+$t("common.netmask")}}
       </div>
       <div class="error error-text" v-if="!emptynetmask && invalidnetmask">
         {{$t("error.invalid")+$t("common.netmask")}}
       </div>
     </div>

     <div class="operation-row" v-if="showMethod">
       <div class="title required">
         {{$t("common.gateway")}}
       </div>
       <input placeholder="192.168.0.1" v-model="gateway" :class="{'is-errort': emptygateway || invalidgateway}" @blur="validate('gateway')"/>
       <div class="error error-text" v-if="emptygateway">
         {{$t("error.emptyInput")+$t("common.gateway")}}
       </div>
       <div class="error error-text" v-if="!emptygateway && invalidgateway">
         {{$t("error.invalid")+$t("common.gateway")}}
       </div>
     </div>

     <div class="operation-row" v-if="!showMethod">
       <div class="title required">
         {{$t("common.cidr")}}
       </div>
       <input v-model="cidr" :class="{'is-error': emptycidr || invalidcidr}" @blur="validate('cidr')" placeholder="192.168.1.0/24" />
       <div class="error error-text" v-if="emptycidr">
         {{$t("error.emptyInput")+$t("common.cidr")}}
       </div>
       <div class="error error-text" v-if="!emptycidr && invalidcidr">
         {{$t("error.invalid")+$t("common.cidr")}}
       </div>
     </div>

     <div class="operation-block-header">
       {{ $t("common.addDns") }}
     </div>
     <div style="width: 300px; border-bottom: 1px solid #ccc;"></div>

     <div class="operation-row">
       <div class="title">
         DNS
       </div>
       <help-trigger name="dns" />
       <input v-model="dns" placeholder="223.5.5.5" :class="{'is-error': invaliddns}" @blur="validate('dns')"/>
       <div class="error" v-if="invaliddns">
         {{$t("error.invalid")+$t("common.dns")}}
       </div>
     </div>

   </div>

   <div slot="footer" class="create-footer">
     <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel" @click="$router.push({name: 'vcenternetwork'})">{{$t('common.cancel')}}</span>
   </div>
 </create-template>
</template>

<script>
  import CreatevCenterNetWorkPage from 'src/vcenter/vCenterNetWork/create/CreatevCenterNetWorkService';
  export default CreatevCenterNetWorkPage;
</script>

<style scoped>
 .operation-block-header{
   margin-top: 40px;
   margin-bottom: 10px;
   width: 300px;
 }
</style>
