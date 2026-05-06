const express=require('express')
const router=express.Router()

//引入数据库
const getDb=require('../db.js')

router.get('/',async (req,res)=>{
    const username=req.query.username
    // console.log(username)
    //获取数据库实例
    const db = await getDb()
    //获取用户集合
    const userCollection = db.collection('users')
    const user=userCollection.findOne({username})
    // console.log(user)
    if(user){
        res.json({code:"200",msg:'用户信息正确',success:true})
    }else{
        res.json({code:"404",msg:'用户信息错误',success:false})
    }
})

//暴露
module.exports=router
