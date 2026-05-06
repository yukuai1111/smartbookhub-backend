const jwt = require('jsonwebtoken');
require('dotenv').config()
//读取TokenKey
const key=process.env.TokenKey

//验证token
const verifyToken = (req, res, next) => {
    //从前端请求头里获取token
    const token = req.headers.token
    //如果没有，就退出
    if(!token||token.trim()===''){
        res.json({code:"-1",msg:'未登录，请先登录！',success:false})
        return
    }

    //如果有，验证有没有过期
    try{
        const decoded = jwt.verify(token, key);
        req.user=decoded    //decoded是解密后的用户信息，便于给不同用户渲染对应的数据
        // console.log(req.user)
        //如果验证通过，就继续执行
        next()

    }
    catch(err){
        //如果验证失败，就退出
        res.json({code:"-1",msg:'登录过期，请重新登录！',success:false})
        return
    }
}

//暴露中间件
module.exports=verifyToken
