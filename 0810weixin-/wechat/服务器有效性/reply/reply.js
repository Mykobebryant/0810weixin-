/**
 * Created by Administrator on 2018/11/17.
 */
module.exports = message=>{
  //初始化消息对象
  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text'
  }
  //初始化消息文本




}