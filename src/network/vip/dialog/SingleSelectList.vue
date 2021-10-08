<template>
    <dialog-template width="1200px">
        <div slot="title" class="modal-plain-header">
            <span>{{$t("common.selectVip")}}</span>
            <span class="el-icon-close dialog-close" @click="cancel()"></span>
        </div>
        <div slot="body" class="dialog-body-container">
            <el-row style="flex-wrap: nowrap;" type="flex">
                <div style="flex-shrink: 0;padding-left: 20px;">
                    <el-radio-group v-model="windowData.currTab" @change="changecurrTabType">
                        <el-radio-button label="customized">{{$t('common.diy')}}</el-radio-button>
                        <el-radio-button label="system">{{$t('common.system') }}</el-radio-button>
                    </el-radio-group>
                </div>
                <div style="flex-shrink: 1;flex-grow: 1;"></div>
                <div style="text-align: right;flex-shrink: 0;">
                    <span style="padding: 0 15px; display: inline-block;">
                        <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                        <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                            <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                                       :value="item.value"></el-option>
                        </el-select>
                            <span slot="append"><i class="el-icon-search icon"></i></span>
                        </el-input>
                    </span>
                </div>
            </el-row>
            <div class="dialog-body-content">
                <el-table :data="itemList" highlight-current-row @row-click="handleSingleSelect">
                    <el-table-column width="50px">
                        <template slot-scope="scope">
                            <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp;</el-radio>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.name')" prop="name" sortable></el-table-column>
                    <el-table-column :label="$t('common.ip')" prop="ip" sortable>
                        <template slot-scope="scope">
                            {{scope.row.ip}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.gateway')" prop="gateway" sortable>
                        <template slot-scope="scope">
                            {{scope.row.gateway}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.netmask')" prop="netmask">
                        <template slot-scope="scope">
                            {{scope.row.netmask}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.state')" prop="state" sortable>
                        <template slot-scope="scope">
                            <table-body-item-state :state="scope.row.state"></table-body-item-state>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.useFor')" prop="userfor">
                        <template slot-scope="scope">
                            {{getVipUseFor(scope.row.uuid)}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.owner')" prop="owner" v-if="dbData.common.isAdmin && !dbData.common.isOpensource">
                        <template slot-scope="scope">
                            {{dbData.vip[scope.row.uuid].accountUuid && dbData.account[dbData.vip[scope.row.uuid].accountUuid] && dbData.account[dbData.vip[scope.row.uuid].accountUuid].name}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.createDate')">
                        <template slot-scope="scope">
                            {{new Date(scope.row.createDate) | formatDatetime}}
                        </template>
                    </el-table-column>
                    <!--<el-table-column :label="$t('common.detail')">-->
                        <!--<template slot-scope="scope">-->
                            <!--<a @click="$router.push({name:'detailCertificate/${{(scope.row.uuid)}}'})"></a>-->
                        <!--</template>-->
                    <!--</el-table-column>-->
                </el-table>
                <div class="page-table-pagination">
                    <el-pagination
                            :page-sizes="[10, 20, 50, 100]"
                            :page-size="windowData.pageSize"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="windowData.total"
                            class="page-table-pagination"
                            @current-change="pageCurrentChange"
                            @size-change="pageSizeChange"
                            :current-page="windowData.pageIndex">
                    </el-pagination>
                </div>
            </div>
        </div>
        <div slot="footer">
            <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
            <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
        </div>
    </dialog-template>
</template>

<script>
    import WindowBase from 'src/windows/Window';
    import TableBodyItemState from "src/component/TableBodyItemState";
    import VipMethods from 'src/network/vip/Methods';
    import VipList from 'src/network/vip/List'

    export default {
        name: "SingleSelectList",
        mixins:[WindowBase,VipMethods,VipList],
        components:{
            TableBodyItemState
        },
        data(){
            return{
                templateRadio: '',
                searchStr: '',
                selectVal: 'name',
                conditionNameList: [
                    {name: 'common.name', value: 'name'},
                    {name: 'common.uuid', value: 'uuid'}
                ],
                itemList: []
            }
        },
        created(){
            let self=this
            self.updateWindow({
                currTab: 'customized',
                pageSize:5,
                pageIndex:1,
                sortBy:'createDate',
                sortDirection: '-',
                methods: {
                    queryList: self.queryList
                }
            }).then(()=>{
                return self.queryList();
            })
        },
        methods:{
            confirm() {
                let self = this;
                if (!this.$data.templateRadio) return;
                this.dialogData.param.select(this.$data.templateRadio);
                self.closeDialog(self.windowId)
            },
            //搜索过滤
            search() {
                let self = this;
                self.updateWindow({
                    pageIndex: 1
                });
                this.queryList();
            },
            //处理单选
            handleSingleSelect(row) {
                this.templateRadio = row.uuid;
            },
            cancel() {
                let self = this;
                self.closeDialog(self.windowId)
            },
            //分页改变页码
            pageSizeChange(val) {
                let self = this;
                self.updateWindow({
                    pageSize: val
                })
            },
            //改变当前页
            pageCurrentChange(val) {
                let self = this;
                self.updateWindow({
                    pageIndex: val
                })
            },
            changecurrTabType(){
                this.changeTab(this.windowData.currTab)
            },
            changeTab (tabName) {
                console.log("tabName ="+tabName)
                this.updateWindow({
                    currTab: tabName,
                    pageIndex: 1,
                    pageCount: 1,
                    pageSize: 5,
                    sortBy: 'createDate',
                    sortDirection: '-'
                })
                this.queryList()
            },
        }
    }
</script>

<style scoped>

</style>