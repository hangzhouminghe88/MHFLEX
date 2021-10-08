<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
             {{$t("pciDevice.otherDevice") }}{{$t("common.colon")}}
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a  v-permission="'PCI.ATTACH_PCI_TO_VM'" style="padding-top:12px;">{{ $t("common.attach") }}</a>
                <a v-permission="'PCI.DETACH_PCI_FROM_VM'" style="padding-bottom:12px;">{{ $t("common.detach") }}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
      </el-row>
    </div>
    <el-table>
      <span slot="empty" class="table-nodata">
        <p class="empty-text" v-text="$t('common.noData')"></p>
      </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('common.host')"></el-table-column>
      <el-table-column :label="$t('pciDevice.deviceName')"></el-table-column>
      <el-table-column :label="$t('pciDevice.pciAddress')"></el-table-column>
      <el-table-column :label="$t('common.type')"></el-table-column>
      <el-table-column :label="$t('common.state')"></el-table-column>
      <el-table-column :label="$t('common.status')"></el-table-column>
      <el-table-column :label="$t('common.createDate')"></el-table-column>
    </el-table>
  </div>
</template>

<script>
  import Root from 'src/windows/Root';
  export default {
    name: "PciDeviceTabList",
    mixins: [Root],
  }
</script>

<style scoped>

</style>
