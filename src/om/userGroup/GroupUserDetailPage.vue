<template>
  <detail-template>
    <div slot="header" class="detail-header">
       <span @click="$router.push({name: 'usergroup'})" class="create-back item"
             style="position: relative; top:-16px;"><i
         class="el-icon-back"></i>
        回到用户列表
      </span>
      <span class="item" style="display: inline-block;position: relative; top:-16px;">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('user.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
            </div>
          </span>
        </drop-down>
      </span>
      <span class="display: inline-block;height: 100%;">
         <el-tabs @tab-click="handleTabChange" style="display: inline-block;height: 100%;" tabPosition="bottom"
                  v-model="activeName">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info" style="margin-top: 10px;"></el-tab-pane>
           <el-tab-pane v-if="!dbData.common.isAdmin" :label="$t('common.permission')" name="permission" style="margin-top: 10px;"></el-tab-pane>
           <el-tab-pane :label="$t('common.log')" name="log" style="margin-top: 10px;"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      {{model}}
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../component/DetailTemplate";
  export default {
    name: "GroupUserDetailPage",
    components: {
      'detail-template': DetailTemplate
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          queryList: self.detailQuery
        }
      })
        .then(() => {
          return self.detailQuery();
        })
    },
    data(){
      return{
        activeName: 'info'
      }
    },
    computed: {
      model(){
        let self = this;
        return self.get(self.$route.params.uuid);
      }
    },
    methods:{
      detailQuery(){
        let self = this;
        self.dispatchActionWithEvent('userGroup/detailQuery', self.$route.params.uuid);
      },
      handleTabChange(){

      }
    }
  }
</script>

<style scoped>

</style>
