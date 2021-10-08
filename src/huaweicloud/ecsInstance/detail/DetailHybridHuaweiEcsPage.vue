<template>
    <detail-template>
      <div slot="header" class="detail-header">
        <div class="detail-header-item">
          <span class="detail-title">华为云Ecs详情</span>
        </div>
        <div class="detail-header-item" @click="close()">
          <span class="el-icon-back create-back">
            回到华为云Ecs列表
          </span>
        </div>
        <div class="detail-header-item">
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <!--启用-->
                <a style="padding-top: 12px"
                   :class="{'disabled-text': !inStates(['Stopping', 'Stopped'])}"
                   @click="inStates(['Stopping', 'Stopped']) && detailEnableOrDisable('Running')">{{$t('common.start')}}</a>
                <!--停用-->
                <a :class="{'disabled-text': !inStates('Running')}"
                   @click="inStates('Running') && detailEnableOrDisable('Running')">{{$t('common.stop')}}</a>
                <!--重启云主机-->
                  <a @click="!inStates('Stopped') && detailReboot()"
                     :class="{'disabled-text': !!inStates('Stopped')}">{{$t("common.reboot")}}</a>
                <!--修改密码-->
                  <a @click="detailUpdateHuaweiEcsRootPassword()">{{$t("hybridecsinstance.updateRootPassword")}}</a>
                <!--删除云主机-->
                  <a @click="detailDelete()"
                     style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        </el-tabs>
      </div>
      <div slot="body" v-if="currTab === 'info'" class="detail-body">
        <div class="left">
          <div class="left-header">
            <div class="icon"></div>
            <div class="after-icon">
              <detail-info-state outer-class-name="detail-page-state"
                                 :state="hybridHuaweiEcs && hybridHuaweiEcs.ecsStatus"
                                 v-if="inStates('RUNNING')"/>
              <span class="console" v-if="hybridHuaweiEcs && hybridHuaweiEcs.ecsStatus && (hybridHuaweiEcs.ecsStatus).toLowerCase() === 'running'"
                    @click="detailOpenConsole()">
               <span class="console-label">{{$t('common.console')}}</span>
            </span>
            </div>
            <detail-name class="name" :param="updateResourceParam('name')"/>
             <detail-description class="description" :param="updateResourceParam('description')"/>
          </div>
          <div class="left-body">
            <div class="detail-block-header">
               {{$t('common.overview')}}
            </div>
            <!--ECS云主机Id-->
            <detail-row :param="{
              title: 'ECS云主机Id',
              content: hybridHuaweiEcs && hybridHuaweiEcs.ecsInstanceId
            }"/>
            <!--处理器-->
            <detail-row :param="{
              title: 'common.cpu',
              content: hybridHuaweiEcs && hybridHuaweiEcs.cpuCores
            }"/>
            <!--内存-->
            <detail-row :param="{
              title: 'common.memorySize',
              content: hybridHuaweiEcs && hybridHuaweiEcs.memorySize + 'G'
            }"/>
            <!--私有网络-->
            <detail-row :param="{
              title: 'common.privateNetworkIP',
              content: hybridHuaweiEcs && hybridHuaweiEcs.privateIpAddress,
              copy: true
            }"/>
            <!--公有网络-->
            <detail-row :param="{
              title: 'common.publicNetworkIP',
              content: hybridHuaweiEcs && hybridHuaweiEcs.publicIpAddress,
              copy: true
            }"/>
            <!--带宽-->
            <detail-row :param="{
              title: 'hybridecsinstance.ecsBandWidth',
              content: hybridHuaweiEcs && hybridHuaweiEcs.ecsBandWidth &&  hybridHuaweiEcs.ecsBandWidth === -1 ? $t('common.no') : `${hybridHuaweiEcs && hybridHuaweiEcs.ecsBandWidth}Mbps`
            }"/>
            <!--跟云盘类型-->
            <detail-row :param="{
              title: 'hybridecsinstance.ecsRootVolumeCategory',
              content: hybridHuaweiEcs && hybridHuaweiEcs.ecsRootVolumeCategory && (hybridHuaweiEcs.ecsRootVolumeCategory).toLowerCase() === 'cloud_efficiency' ? $t('hybridecsinstance.cloud_efficiency') : $t('hybridecsinstance.cloud_ssd')
            }"/>
            <!--付费信息-->
            <detail-row :param="{
              title: 'hybridecsinstance.paymentInformation',
              content: hybridHuaweiEcs && hybridHuaweiEcs.chargeType ? $t(`hybridTencentEcsInstance.${hybridHuaweiEcs.chargeType}`) : $t('hybridecsinstance.afterPayment')
            }"/>
            <!--过期时间-->
            <detail-row :param="{
              title: 'hybridecsinstance.expireDate',
              content:  (hybridHuaweiEcs && hybridHuaweiEcs.chargeType === 'PrePaid') ? formatDatetime(new Date(hybridHuaweiEcs.expireDate)) : $t('hybridecsinstance.notexpire')
            }"/>
            <!--创建时间-->
            <detail-row :param="{
              title: 'common.createDate',
              content: hybridHuaweiEcs && hybridHuaweiEcs.createDate && formatDatetime(new Date(hybridHuaweiEcs.createDate))

            }"/>
            <!--最后操作时间-->
            <detail-row :param="{
              title: 'common.lastOpDate',
              content: hybridHuaweiEcs && hybridHuaweiEcs.lastOpDate && formatDatetime(new Date(hybridHuaweiEcs.lastOpDate))
            }"/>
          </div>
        </div>
        <div class="right">
          <div style="height: 40px"></div>
          <div class="detail-block-header">
            {{$t('common.moreInformation')}}
          </div>
          <!--云主机uuid-->
          <detail-row :param="{
            title: 'common.uuid',
            content: windowData.dataUuid,
            copy: true
          }"/>

          <!--可用区-->
          <detail-row :param="{
            title: 'hybrididentityzone.identityzone',
            content: hybridHuaweiEcs && hybridHuaweiEcs.identityZoneName,
            handler: () => {

							}
          }"/>

          <!--镜像-->
          <detail-row :param="{
            title: 'common.image',
            content: hybridHuaweiEcs && hybridHuaweiEcs.imageName,
            handler: () => {

							}
          }"/>

          <!--vpc-->
          <detail-row :param="{
            title:'VPC',
            content: hybridHuaweiEcs && hybridHuaweiEcs.vpcName,
            handler: () => {

							}
          }"/>

          <!--云主机uuid-->
          <detail-row :param="{
            title:  'hybridesecuritygroup.securitygroup',
            content: hybridHuaweiEcs && hybridHuaweiEcs.securityGroupName,
            handler: () => {

							}
          }"/>

        </div>
      </div>
    </detail-template>
</template>

<script>
    import DetailInfoState from "src/component/DetailInfoState";
    import DetailTemplate from "src/component/DetailTemplate";
    //格式化时间
    import { formatDatetime } from "src/utils/utils";
    import WindowBase from 'src/windows/Window';
    import HuaweiEcsMethods from '../Methods';
    import { mapGetters } from 'vuex';

    export default {
      name: "DetailHybridHuaweiEcsPage",
      mixins: [WindowBase, HuaweiEcsMethods],
      components: {DetailInfoState, DetailTemplate},
      computed: {
        ...mapGetters({
          get: `hybridHuaweiEcsInstance/get`
        }),
        hybridHuaweiEcs(){
          let self = this;
          return self.get(self.windowData.dataUuid);
        }
      },
      data() {
        return {
          currTab: 'info'
        }
      },
      created() {
        //初始化数据并发送请求
        let self = this, dataUuid = '';
        dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
        self.updateWindow({
          dataUuid,
          methods: {
            query: self.detailQuery
          }
        }).then(() => {
          self.detailQuery();
        })
      },
      methods: {
        formatDatetime,
        //请求详情数据
        detailQuery() {
          let self = this;
          return self.dispatchAction('hybridHuaweiEcsInstance/basicQuery', {
            q:[`uuid=${self.windowData.dataUuid}`]
          })
        },
        //是否在某个状态中
        inStates() {
          let self = this, states = [];
          for(let arg in arguments){
            states.push(arguments[arg]);
          }
          return states.some((state) => self.dbData.hybridHuaweiEcsInstance[self.windowData.dataUuid] === state);
        },
        //返回到华为云Ecs列表
        close() {
          let self = this;
          self.$router.push({name: 'hybridhuaweiecs'})
        },
        //停用、启用华为云云主机
        detailEnableOrDisable(operate) {
          let self = this, uuidList = [self.windowData.dataUuid];
          if(uuidList.length <=0 ) return;
          if (operate === 'Running') self.action(uuidList, 'start').then(() => self.detailQuery());
          if(operate === 'Stopped')
            self.openDialog('ConfirmDlg', {
              title: 'hybridecsinstance.stop',
              description: 'hybridecsinstance.delete',
              icon: 'vm_popupico',
              uuidList,
              getName: (uuid) => {
                return self.dbData.hybridHuaweiEcsInstance[uuid].name;
              },
              ok: () => {
                self.action(uuidList,'stop').then(() => self.detailQuery());
              }
            })
        },
        //重启云主机
        detailReboot() {
          let self = this, uuidList = [self.windowData.dataUuid];
          self.openDialog('ConfirmDlg', {
            title: 'hybridecsinstance.reboot',
            description: 'hybridecsinstance.rebotHybridEcsInstance',
            icon:  'vm_popupico',
            uuidList,
            getName: (uuid) => {
              return self.dbData.hybridHuaweiEcsInstance[uuid].name;
            },
            ok: () => {
              self.action(uuidList,'reboot').then(() => self.detailQuery());
            }
          })
        },
        //修改控制台密码
        detailUpdateHuaweiEcsRootPassword() {
          let self = this, uuid = '';
          uuid = self.windowData.dataUuid;
          self.openDialog('HybridModifyRootPassword', {
            ok: (newPassword) => {
              self.updateEcsInstancePassword (uuid, newPassword, 'Root')
                .then(() => self.detailQuery());
            }
          })
        },
        //删除云主机
        detailDelete() {
          let self = this, uuidList = [self.windowData.dataUuid];
          self.openDialog('ConfirmDlg', {
            title: 'hybridecsinstance.deleteEcsInstance',
            description: 'hybridecsinstance.delete',
            uuidList,
            icon: 'vm_popupico',
            type: 'delete',
            isChecked: true,
            checkBoxText: "hybrid.deleteOrigin",
            ok: (deleteOrigion) => {
              return self.delete(uuidList, deleteOrigion)
                .then(() => {
                  self.close();
                });
            },
            getName: (uuid) => {
              return self.dbData.hybridHuaweiEcsInstance[uuid].name;
            }
          })
        },
        //更新云主机数据
        updateResourceParam(arg) {
          let _this = this;
          return {
            getValue: () => {
              return _this.hybridHuaweiEcs && _this.hybridHuaweiEcs && _this.hybridHuaweiEcs[arg];
            },
            setValue: () => {

            }
          }
        }
      }
    }
</script>

<style scoped lang="less">
  @import url('../../../style/mixins.less');
  .icon{
    .detail-icon('~assets/ecs_vm_ico.svg')
  }

  .after-icon{
    display: flex;
    justify-content: space-between;
  }

  .console{
    width: 30px;
    height: 30px;
    background-image: url('~assets/open_console.svg');
    cursor: pointer;
    background-repeat: no-repeat;
    position: relative;
    flex: 1 1 30%;
    .console-label{
      display: none;
      padding: 10px 20px;
      position: absolute;
      top: 35px;
      left: -25px;
      color: #409EFF;
      border: 1px solid #3c73b9;
      background: #fff;
      text-align: center;
      z-index: 2;
      font-size: 12px;
    }
    &:hover{
      .console-label{
        display: inline-block;
      }
    }
  }
  .detail-page-state{
    flex: 1 1 70%!important;
  }
</style>
