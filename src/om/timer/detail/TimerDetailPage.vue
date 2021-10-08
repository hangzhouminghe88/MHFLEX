<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">定时器详情</span>
			<span @click="$router.push({name:'timer'})" class="create-back detail-header-item">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到定时器列表</span>
      </span>
      <span class="detail-header-item">
      	<drop-down class="detail-dropdown">
				  <span slot="title">
				  	<span class="text">{{$t('timer.actions')}}</span>
			  	</span>
				  <span slot="content">
						<div class="dropdown-content">
							<a style="height: 25px; line-height: 25px;" @click="createSchedulerJob(dataUuid)">{{$t('timer.action.createJob')}}</a>
                <a style="height: 25px; line-height: 25px;"
                   @click="pageDelete([$route.params.uuid])">{{$t('common.destroyed')}}</a>
						</div>
					</span>
			 </drop-down>
			</span>
      <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
               class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.schedulerjob')" name="schedulerJob"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="timer_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" :state="timerIsDone(dataUuid) ? 'Done' : 'Running'"/>
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
              title: 'timer.taskCount',
              content: model.jobsUuid.length
            }"
          />
          <detail-row class="editable"
            :param ="{
              title: 'timer.strategy',
              editable : () => {
               return true;
              },
              content: !model.repeatCount ? $t('timer.repeatExecute') : $t('timer.execute', {length: model.repeatCount}),
              handler(){
                model.repeatCount ? !timerIsDone(dataUuid) && changeTimerConf(dataUuid, false) : !timerIsDone(dataUuid) && changeTimerConf(dataUuid, true)
              }
            }"
          />
          <div class="detail-row editable" key="volumeReadBandwidth">
            <div class="detail-title">
              {{$t("common.cycle")}}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              <span class="detail-content" v-if="!editStrategy">{{getStrategyValue()}}</span>
              <span
                @click.stop="editStrategy = true"
                class="edit-icon"
                v-if="!editStrategy && model">
                  <i class="el-icon-edit"></i>
                </span>
              <detail-time-editor :inputStyle="{width: '60%'}"
                                  :defaultUnit = "'hour'"
                                  :finish="updateStrategy"
                                  v-if="editStrategy"/>
            </div>
          </div>
          <detail-row class="editable"
                      :param ="{
              title: 'timer.startTime',
              editable : () => {
               return true;
              },
              content: model.startTime && formatDatetime(new Date(model.startTime)),
              handler(){
                updateStartTime();
              }
            }"
          />
          <detail-row
            :param="{
              title: 'timer.stopTime',
              content: model.repeatCount ? formatDatetime(new Date(model.stopTime)) : $t('timer.forever')
            }"
          />
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
        <div id="common-moreInformation" class="detail-block-header">
          {{ $t("common.moreInformation") }}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model.uuid,
            copy: true
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'schedulerJob'">
      <vm-scheduler :param="{ conditions: `trigger.uuid=${dataUuid}`, resourceUuid:dataUuid, resourceType: 'timer'}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{uuid: dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from 'src/component/DetailTemplate';
  import TimerMethods from 'src/om/timer/Methods';
  import {mapGetters, mapState} from 'vuex';
  import DetailInfoState from "../../../component/DetailInfoState";
  import Utils from "src/utils/utils";
  import LogList from "../../../component/LogList";
  import VmScheduler from "../../../ecs/ecsInstance/component/VmScheduler";

  export default {
    name: 'TimerDetailPage',
    mixins: [TimerMethods],
    components: {
      VmScheduler,
      LogList,
      DetailInfoState,
      DetailTemplate
    },
    computed: {
      ...mapState({
        timer: state => state.timer
      }),
      ...mapGetters({
        get: 'timer/get'
      }),
      model() {
        let self = this;
        return self.get(self.$route.params.uuid);
      }
    },
    created() {
      let self = this;
      self.dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.detailQuery();
    },
    data() {
      return {
        activeName: 'info',
        dataUuid: '',
        editStrategy: false
      }
    },
    methods: {
      ...Utils,
      handleTabChange() {

      },
      detailQuery() {
        let self = this;
        self.dispatchAction(`timer/detailQuery`, self.$route.params.uuid);
      },
      getStrategyValue(){
        let self = this;
        if(!self.model && self.model.schedulerInterval);
        return this.showInterval(self.model.schedulerInterval);
      },
      pageDelete(selectedUuidList) {
        let self = this, uuidList = [];
        uuidList = selectedUuidList;
        self.openDialog('ConfirmDlg', {
          title: 'timer.delete',
          description: 'timer.deleteConfirm',
          icon: 'timer',
          uuidList,
          getName(uuid) {
            return self.timer[uuid].name;
          },
          ok() {
            self.delete(uuidList)
              .then(() => {
                self.$router.push({name: 'timer'})
              })
          }
        })
      },
      updateStrategy(value){
        let self = this;
        if(value === 0 || /[0-9]+\.[0-9]{0,}/.test(value.toString())) {
          self.editStrategy = false;
          return;
        }
        this.update('schedulerInterval', value)
        self.editStrategy = false;
      },
      updateResource(name){
        let self = this;
        return {
          getValue(){
            return name === 'name' ? self.model.name : name === 'description' ? self.model.description : '';
          },
          setValue(value){
            name === 'name' ? self.update('name', value) : self.update('description', value);
          },
          canEdit(){
            return true;
          }
        }
      },
      update(key, value){
        let self = this, param = {};
        if(!key) return;
        param[key] = value;
        param['uuid'] = self.$route.params.uuid;
        if(value === self.model[key]) return;
        let event = this.createEvent('common.updateInfo' + key, value);
        self.dispatchActionWithEvent(`timer/update`, {uuid: self.$route.params.uuid, param}, undefined, event)
          .then(() => {
            self.detailQuery();
          })
      },
      changeTimerConf(uuid, isRepeat){
        let self  = this;
        self.openDialog('ChangeTimerConfDlg', {
          uuid: uuid,
          isRepeat: isRepeat,
          repeatCount: isRepeat ? 0 : self.model.repeatCount,
          ok(param){
            self.update('repeatCount', param.repeatCount)
          }
        })
      },
      updateStartTime(uuid){
        let self = this;
        self.openDialog('UpdateStartTimeDlg', {
          uuid: uuid,
          isRepeat: self.model.repeatCount === 0,
          startTime: self.model.startTime,
          ok: (params) => {
            this.update('startTime', params.startTime)
          }
        })
      }
    }
  };
</script>

<style scoped>
  .item {
    top: -16px;
    display: inline-block;
    margin-top: 25px;
    font-size: 12px;
  }
  .icon{
    position: absolute;
    width: 62px;
    height: 62px;
    background-repeat: no-repeat;
  }
</style>
