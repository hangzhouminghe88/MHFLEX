import {
  Alert,
  Autocomplete,
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  DatePicker,
  Dialog,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Input,
  InputNumber,
  Loading,
  Menu,
  MenuItem,
  MenuItemGroup,
  Message,
  Notification,
  Option,
  OptionGroup,
  Pagination,
  Progress,
  Radio,
  RadioButton,
  RadioGroup,
  Row,
  Select,
  Step,
  Steps,
  Submenu,
  Switch,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  TimePicker,
  Tooltip,
  Tree,
  MessageBox,
  Popover,
  Scrollbar,
  Upload
} from 'element-ui';
import Vue from 'vue';
/*import {CheckboxGroup} from "element-ui/types/element-ui";*/
const element = {
  install: function (Vue) {
    Vue.use(Select);
    Vue.use(Option);
    Vue.use(OptionGroup);
    Vue.use(Input);
    Vue.use(InputNumber);
    Vue.use(Tree);
    Vue.use(Dialog);
    Vue.use(Row);
    Vue.use(Col);
    Vue.use(Form);
    Vue.use(FormItem);
    Vue.use(Button);
    Vue.use(Alert);
    Vue.use(TabPane);
    Vue.use(Menu);
    Vue.use(MenuItem);
    Vue.use(Table);
    Vue.use(TableColumn);
    Vue.use(Pagination);
    Vue.use(TimePicker);
    Vue.use(Tooltip);
    Vue.use(Tabs);
    Vue.use(MenuItemGroup);
    Vue.use(Submenu);
    Vue.use(Badge);
    Vue.use(Dropdown);
    Vue.use(DropdownItem);
    Vue.use(DropdownMenu);
    Vue.use(Progress);
    Vue.use(Loading);
    Vue.use(Steps);
    Vue.use(Step);
    Vue.use(RadioGroup);
    Vue.use(RadioButton);
    Vue.use(Radio);
    Vue.use(Checkbox);
    Vue.use(CheckboxGroup);
    Vue.use(Autocomplete);
    Vue.use(DatePicker);
    Vue.use(Switch);
    Vue.use(Popover);
    Vue.use(Scrollbar);
    Vue.use(Upload);
  }
};
Vue.prototype.$message = Message;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$notification = Notification
Vue.prototype.$messageBox = MessageBox
export default element;
