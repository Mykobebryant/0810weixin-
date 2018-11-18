const express = require('express');
const sha1 = require('sha1');

const {getUserDataAsync, parseXMLDataAsync, formatMessage} = require('./接收发送的消息utils/tools');
const template = require('./reply/template');
const app = express();

const config = {
  appID: 'wx39ce0dfa74eeedef',
  appsecret: '34f30c7ff8c84927bf8b2a9c6e464942',
  token: 'aiyawoqu'
}

app.use(async (req, res, next) => {
  console.log(req.query);
  //获取请求参数
  const {signature, echostr, timestamp, nonce} = req.query;
  const {token} = config;
  const str = sha1([timestamp, nonce, token].sort().join(''));
  /*
   微信服务器会发送两种类型的消息给开发者
   1. GET 验证服务器有效性逻辑
   2. POST 转发用户消息
   */
  if (req.method === 'GET') {
    // 验证服务器有效性逻辑
    if (signature === str) {
      //说明消息来自于微信服务器
      res.end(echostr);
    } else {
      //说明消息不来自于微信服务器
      res.end('error');
    }
  } else if (req.method === 'POST') {
    // 转发用户消息
    // GET接受微信服务器转发用户消息
    //POST验证消息来自于微信服务器
    if (signature !== str) {
      res.end('error');
      return;
    }
    //用户发送的消息在请求体
    const xmlData = await getUserDataAsync(req);
    console.log(xmlData);
    /*
     <xml>
     <ToUserName><![CDATA[gh_4fe7faab4d6c]]></ToUserName>    开发者的微信号
     <FromUserName><![CDATA[oAsoR1iP-_D3LZIwNCnK8BFotmJc]]></FromUserName>  微信用户openid
     <CreateTime>1542355200</CreateTime>   发送消息的时间戳
     <MsgType><![CDATA[text]]></MsgType>   消息类型
     <Content><![CDATA[111]]></Content>    消息的具体内容
     <MsgId>6624365143243452763</MsgId>    消息id，微信服务器会默认保存3天微信用户发送的消息，在此期间内通过这id就能找到当前消息
     </xml>
     */
    //将用户发送过来的xml数据解析为js对象
    const jsData = await parseXMLDataAsync(xmlData);
    console.log(jsData);
    /*
     {
     xml:
     { ToUserName: [ 'gh_4fe7faab4d6c' ],
     FromUserName: [ 'oAsoR1iP-_D3LZIwNCnK8BFotmJc' ],
     CreateTime: [ '1542355988' ],
     MsgType: [ 'text' ],
     Content: [ '222' ],
     MsgId: [ '6624368527677682013' ]
     }
     }
     */
    //格式化数据
    const message = formatMessage(jsData);
    console.log(message);
    /*
     { ToUserName: 'gh_4fe7faab4d6c',
     FromUserName: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc',
     CreateTime: '1542356422',
     MsgType: 'text',
     Content: '333',
     MsgId: '6624370391693488478' }
     */
    //初始化消息配置对象
    let options = {
      toUserName: message.FromUserName,
      fromUserName: message.ToUserName,
      createTime: Date.now(),
      msgType: 'text'
    }
    //初始化一个消息文本
    let content = '你在说什么，我听不懂~';

    //判断用户发送消息的内容，根据内容返回特定的响应
    if (message.Content === '1') {  //全匹配
      content = '大吉大利，今晚吃鸡';
    } else if (message.Content === '2') {
      content = '落地成盒';
    } else if (message.Content.includes('爱')) {  //半匹配
      content = '我爱你~';
    } else if(message.Content === '3'){
      options.msgType = 'news';
      options.title = '微信公众号开发~';
      options.description = '唉唉唉';
      options.picUrl = '//www.baidu.com/img/bd_logo1.png';
      options.url = 'http://www.baidu.com';
    }
    options.content = content;

    const replyMessage = template(options);
    console.log(replyMessage);






    /*
     注意：微信服务器当没有接收到开发者服务器响应时，默认会请求3次开发者服务器，就会导致接口被调用多次
     解决：提前返回一个值给微信服务器  res.end('');
     */
    res.send(replyMessage);

  } else {
    res.end('error');
  }

})


app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})