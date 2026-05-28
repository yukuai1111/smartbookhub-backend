const express = require('express')
const router = express.Router()
const shortid = require('shortid');

//引入数据库
const getDb = require('../db.js')

//生成token
const jwt = require('jsonwebtoken');
require('dotenv').config()
//读取TokenKey
const key = process.env.TokenKey
// console.log(key)

//登录
router.post('/login', async (req, res) => {
    // console.log(req.body)
    const { username, password } = req.body

    //获取数据库实例
    const db = await getDb()
    //获取用户集合
    const userCollection = db.collection('users')

    const user= await userCollection.findOne({username})
    //判断用户存不存在      
    if (!user || user.password !== password) {
        // 不存在或密码错误
        res.json({ code: '400', msg: '用户名或密码错误', success: false })
        return
    } else {
        //登录成功
        //生成token
        const token = jwt.sign(
            { id: user.id, username: user.username, userType: user.userType },   //用户信息（id，username，userType）
            key,
            { expiresIn: '7d' }       //过期时间7天
        );

        res.json({
            code: "200", msg: '登录成功',
            data: {
                id: user.id,
                username: user.username,
                userType: user.userType,
                token
            }, success: true

        })
    }
})


//注册
router.post('/register', async (req, res) => {
    // console.log(req.body)
    const { username, password, email, phone } = req.body
    // console.log(username, password, confirmPassword, email, phone)

    //生成id
    const id = shortid.generate()

    //获取数据库实例
    const db = await getDb()
    //获取用户集合
    const userCollection = db.collection('users')

    // console.log(db.get('users').value())

    //用户存在与否判断
    const user = await userCollection.findOne({ username })
    // console.log(user)
    if (user) {
        //已存在
        res.json({ code: '400', msg: '用户名已存在', success: false })
        return
    }

    //判断手机号是否已注册
    if (phone?.trim() && await userCollection.findOne({ phone })) {
        res.json({ code: '400', msg: '手机号已注册', success: false })
        return
    }

    //判断邮箱是否已注册
    if (email?.trim() && await userCollection.findOne({ email })) {
        res.json({ code: '400', msg: '邮箱已注册', success: false })
        return
    }

    //注册成功，写入数据库
    const userType = 1
    await userCollection.insertOne(
        {
            id,
            username,
            password,
            email: email || '',
            phone: phone || '',
            userType,
            conversation:[]
        }
    )
    res.json({
        code: "200", msg: '注册成功',
        data: {
            id,
            username,
            userType
        },
        success: true
    })
})

module.exports = router

