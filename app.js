const express = require('express')
const app = express()

//解决跨域+预检请求
const cors = require('cors');
app.use(cors());

//这里已经解析请求体了，把body的属性添加在req里了
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//静态资源  app.use('虚拟路径<前后端统一即可>，express.static('真实路径'))
app.use('/default', express.static('public/image'))    //路径就会变成http://localhost:3000/default/xxxx ，会自动去根目录下的public/image里找
app.use('/cover', express.static('uploads'))    //路径就会变成http://localhost:3000/cover/xxxx ，会自动去根目录下的uploads里找
//url的前缀可以是任意的，前端和后端统一就行
 

//引入中间件（检验token）
const tokenMiddle = require('./middleWare/tokenMiddle.js')


//引入路由
const logRegRouter = require('./routes/logReg.js')
const adminRouter = require('./routes/admin.js')
const frontRouter = require('./routes/front.js')
const userInfoRouter = require('./routes/userinfo.js')

//挂载路由
app.use('/smartbookhub-api/user', logRegRouter)      //登陆注册不需要验证token
app.use('/smartbookhub-api/admin', tokenMiddle, adminRouter)
app.use('/smartbookhub-api/front', tokenMiddle, frontRouter)
app.use('/smartbookhub-api/user-info', tokenMiddle, userInfoRouter)


// //监听
// app.listen(3000,()=>{
//     console.log('服务器启动成功')
// })


//使用动态端口
const PORT = process.env.PORT || 3000     //3000是默认端口，没有配置环境变量PORT时，使用3000端口（本地测试）
app.listen(PORT, () => {
  console.log('服务器启动成功')
})