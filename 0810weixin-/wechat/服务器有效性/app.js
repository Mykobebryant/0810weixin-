/**
 * Created by Administrator on 2018/11/16.
 */
const express = require('express');
const sha1 = require('sha1');
const app = express();
const config = {
  appID: 'wx39ce0dfa74eeedef',
  appsecret: '34f30c7ff8c84927bf8b2a9c6e464942',
  token: 'aiyawoqu'
}

app.use((req, res, next) => {
  console.log(req.query);
  const {signature, echostr, timestamp, nonce} = req.query;
  const {token} = config;
  const arr = [timestamp, nonce, token].sort();
  console.log(arr); // [ '1405525917', '1542352539', 'aiyawoqu' ]
  const str = sha1(arr.join(''));
  console.log(str); // e03939190071fb32cea1234e0020002fa42dae50
  if (signature === str) {
    //说明消息来自于微信服务器
    res.end(echostr);
  } else {
    //说明消息不来自于微信服务器
    res.end('error');
  }

})
app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})