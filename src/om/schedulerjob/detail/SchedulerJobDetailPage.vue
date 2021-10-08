<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">定时任务详情</span>
      <span @click="$router.push({name:'schedulerjob'})" class="create-back detail-header-item">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到定时任务列表</span>
      </span>
      <span class="detail-header-item">
      	<drop-down class="detail-dropdown">
				  <span slot="title">
				  	<span class="text">{{$t('scheduler.actions')}}</span>
			  	</span>
				  <span slot="content">
						<div class="dropdown-content">
              <a v-permission="'SCHEDULER.ADD_SCHEDULER_JOB_2_SCHEDULER_TRIGGER'"
                 :class="{'disabled-text': !canEnable()}"
                 @click="canEnable() && detailEnable()">{{ $t("common.start") }}</a>
              <a v-permission="'SCHEDULER.ADD_SCHEDULER_JOB_2_SCHEDULER_TRIGGER'"
                 :class="{'disabled-text': !canDisable()}"
                 @click="canDisable() && detailDisable()">{{ $t("common.stop") }}</a>
							 <a v-permission="'SCHEDULER.ADD_SCHEDULER_JOB_2_SCHEDULER_TRIGGER'"
                  :class="{'disabled-text': !canAttach()}"
                  @click="canAttach() && detailAttach()">{{ $t("common.attach") }}</a>
               <a v-permission="'SCHEDULER.REMOVE_SCHEDULER_JOB_FROM_SCHEDULER_TRIGGER'"
                  :class="{'disabled-text':!canDetach()}"
                  @click="canDetach() && detailDetach()">{{ $t("common.detach") }}</a>
               <a v-permission="'SCHEDULER.DELETE_SCHEDULER_JOB'" style="padding-bottom: 12px;"
                  @click="detailDeleteSechduler()">{{ $t("common.destroy") }}</a>
						</div>
					</span>
			 </drop-down>
			</span>
      <el-tabs v-model="activeName" tabPosition="bottom"
               class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.taskRecord')" name="event"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="account_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" :state="model.state"/>
          </div>
          <detail-name class="name" :param="updateResource('name')"/>
          <detail-description class="description" :param="updateResource('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'common.createDate',
              content: model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model && model.uuid,
            copy: true
          }"
        />
        <detail-row
          :param="{
            title: 'common.taskType',
            content: $t(jobClassShow(windowData.dataUuid))
          }"
        />
        <detail-row
          :param="{
            title: 'common.resourceName',
            content: model && model.resourceName,
            handler(){
               openResourceDetailPage()
            },
            canLink: () => {
             return true
            }
          }"
        />
        <detail-row
          :param="{
            title: 'timer.startTime',
            content: model.timerStartTime && formatDatetime(new Date(model.timerStartTime))
          }"
        />
        <detail-row
          :param="{
            title: 'common.timer',
            content: model && model.timerResourceName,
            handler(){
               model.triggersUuid && $router.push({name: 'detailTimer', params: {uuid: model.triggersUuid[0]}})
            },
            canLink: () => {
             return true
            }
          }"
        />
        <detail-row
          :param="{
           title: 'scheduler.taskImplementation',
           content: getTaskImplementation()
          }"
        />
        <detail-row
          v-if="model.jobData && JSON.parse(model.jobData).snapshotMaxNumber"
          :param="{
          title: 'scheduler.maxSnapshot',
           content: JSON.parse(model.jobData).snapshotMaxNumber
         }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'event'">
      <event-data-tab-list :param="{ uuid: windowData.dataUuid }"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import DetailInfoState from "../../../component/DetailInfoState";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from 'src/om/schedulerjob/Methods';
  import {mapGetters} from 'vuex';
  import LogList from "../../../component/LogList";
  import EventDataTabList from "../component/EventDataTabList";

  export default {
    name: "SchedulerJobDetailPage",
    components: {EventDataTabList, LogList, DetailInfoState, DetailTemplate},
    mixins: [WindowBase, Methods],
    data() {
      return {
        activeName: 'info'
      }
    },
    computed: {
      ...mapGetters({
        get: 'scheduler/get'
      }),
      model() {
        let self = this;
        return self.get(self.$route.params.uuid);
      }
    },
    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid
      }).then(() => {
        self.detailQuery()
      })
    },
    methods: {
      ...Utils,
      detailQuery() {
        let self = this;
        self.dispatchAction('scheduler/detailQuery', self.windowData.dataUuid);
      },
      updateResource(name) {
        let self = this;
        return {
          getValue() {
            return name === 'name' ? self.model.name : name === 'description' ? self.model.description : '';
          },
          setValue(value) {
            name === 'name' ? self.update('name', value) : self.update('description', value);
          },
          canEdit() {
            return true;
          }
        }
      },
      update(key, value) {
        let self = this, param = {};
        if (!key) return;
        param[key] = value;
        if (value === self.model[key]) return;
        let event = this.createEvent('common.updateInfo' + key, value);
        self.dispatchActionWithEvent(`scheduler/update`, {uuid: self.$route.params.uuid, param}, undefined, event)
          .then(() => {
            self.detailQuery();
          })
      },
      openResourceDetailPage() {
        let detailDlgType = '', self = this;
        if (!this.model.jobClassName) return;
        let jobClassName = this.model.jobClassName.split('.').pop()
        let redirectToVmArr = ['StartVmInstanceJob', 'StopVmInstanceJob', 'RebootVmInstanceJob']
        if (redirectToVmArr.indexOf(jobClassName) > -1) {
          detailDlgType = 'Vm'
        } else {
          detailDlgType = 'Volume'
        }
        self.$router.push({name: `detail${detailDlgType}`, params: {uuid: self.model.resourceUuid}})
      },
      getTaskImplementation() {
        let self = this;
        if (!self.model.triggersUuid || !self.dbData.timer[self.model.triggersUuid[0]]) return '';
        if (self.model.triggersUuid.length > 0) {
          if (self.model.triggersUuid[0] && !self.dbData.timer[self.model.triggersUuid[0]].repeatCount) {
            return `${self.$t('timer.repeatExecute')}, ${self.$t('timer.cycle')}${self.$t('common.colon')}${self.showInterval(self.dbData.timer[self.model.triggersUuid[0]].schedulerInterval)}`
          }
          if (self.model.triggersUuid[0] && self.dbData.timer[self.model.triggersUuid[0]].repeatCount) {
            return `${self.$t('timer.execute', {length: self.dbData.timer[self.model.triggersUuid[0]].repeatCount})}, ${self.$t('timer.cycle')}${self.$t('common.colon')}${self.showInterval(self.dbData.timer[self.model.triggersUuid[0]].schedulerInterval)}`
          }
        }
      },
      canAttach() {
        let self = this;
        if (!self.model.triggersUuid) return false;
        return self.model.triggersUuid.length === 0
      },
      canDetach() {
        let self = this;
        if (!self.model.triggersUuid) return false;
        return self.model.triggersUuid.length > 0
      },
      detailDetach() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: "timer.detach",
          description: 'timer.detachConfirm',
          icon: 'timed_task_n',
          getName(uuid) {
            return self.scheduler[uuid].name
          },
          uuidList: [self.windowData.dataUuid],
          ok() {
            self.detachScheduler('', [self.windowData.dataUuid])
              .then(() => {
                self.detailQuery();
              });
          }
        })
      },
      detailAttach() {
        let self = this;
        this.openDialog('AttachSchedulerJobDlg', {
          ok: (uuid) => self.attach(uuid, [self.windowData.dataUuid]).then(() => self.detailQuery())
        })
      },
      detailEnable() {
        let self = this;
        self.enable([self.windowData.dataUuid])
          .then(() => self.detailQuery())
      },
      detailDisable() {
        let self = this;
        self.disable([self.windowData.dataUuid])
          .then(() => self.detailQuery())
      },
      canEnable() {
        let self = this;
        return self.model && self.model.state !== 'Enabled';
      },
      canDisable() {
        let self = this;
        return self.model && self.model.state !== 'Disabled';
      },
      detailDeleteSechduler() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: "scheduler.delete",
          description: 'common.deleteScheduler',
          icon: 'timed_task_n',
          getName(uuid) {
            return self.scheduler[uuid].name
          },
          uuidList: [self.windowData.dataUuid],
          ok() {
            self.deleteScheduler([self.windowData.dataUuid])
              .then(() => {
                self.$router.push({name: 'schedulerjob'})
              });
          }
        })
      },
    }
  }
</script>

<style scoped lang="less">
  @import "~src/style/mixins";

  .icon {
    .detail-icon(@url: '~assets/account_ico.svg')
  }
</style>
