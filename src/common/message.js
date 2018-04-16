/**
 * Created by sunlf on 2017/7/21.
 * 封装消息显示
 */
import {Message} from 'element-ui'

export default {
  message: function (_type, _msg, _showClose) {
    Message({
      type: _type,
      showClose: _showClose | true,
      message: _msg
    })
  },
  success: function (_msg, _showClose) {
    this.message('success', _msg, _showClose | true)
  },
  warning: function (_msg, _showClose) {
    this.message('warning', _msg, _showClose | true)
  },
  error: function (_msg, _showClose) {
    this.message('error', _msg, _showClose | true)
  },
  info: function (_msg, _showClose) {
    this.message('info', _msg, _showClose | true)
  },
  processResult: function (res) { // 处理返回结果
    if (res.data.success) {
      this.success(res.data.msg)
    } else {
      this.error(res.data.msg)
    }
  }
}
