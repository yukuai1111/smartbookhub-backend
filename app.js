const express = require('express')
const app = express()

//解决跨域
const cors = require('cors');
app.use(cors());

//解决预检请求
app.use((req, res, next) => {
  // 允许来源
  res.setHeader('Access-Control-Allow-Origin', '*');
  // 允许请求方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 关键：把你前端用到的请求头全部写上
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token, Authorization');

  // 预检直接结束，不往下走
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

//这里已经解析请求体了，把body的属性添加在req里了
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//静态资源
app.use('/smartbookhub-backend/public/image', express.static('public/image'))    //路径就会变成http://localhost:3000/1/smartbookhub-backend/public/image/xxxx 
app.use('/smartbookhub-backend/uploads', express.static('uploads'))    //路径就会变成http://localhost:3000/1/smartbookhub-backend/uploads/xxxx 
//url的前缀可以是任意的，前端和后端统一就行
 
//引入中间件
const tokenMiddle = require('./middleWare/tokenMiddle.js')


//引入路由
const logRegRouter = require('./routes/logReg.js')
const adminRouter = require('./routes/admin.js')
const frontRouter = require('./routes/front.js')
const userInfoRouter = require('./routes/userinfo.js')

//挂载路由
app.use('/user', logRegRouter)      //登陆注册不需要验证token
app.use('/admin', tokenMiddle, adminRouter)
app.use('/front', tokenMiddle, frontRouter)
app.use('/user-info', tokenMiddle, userInfoRouter)


// //监听
// app.listen(3000,()=>{
//     console.log('服务器启动成功')
// })


//使用动态端口
const PORT = process.env.PORT || 3000     //3000是默认端口，没有配置环境变量PORT时，使用3000端口（本地测试）
app.listen(PORT, () => {
  console.log('服务器启动成功')
})