const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

//图片数据库
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })


//引入数据库
const getDb = require('../db.js')

//创建id
const shortid = require('shortid');


//获取文章列表接口+分页查询
router.get('/article-list', async (req, res) => {
    //实现分页
    let page = Number(req.query.page) || 1   //当前页  这里的参数是前端传来的查询参数
    let pageSize = 10    //每页显示10条数据
    //每次只要10条
    const start = (page - 1) * pageSize   //起始索引
    const end = start + pageSize        //结束索引
    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    //读取数据库
    const AllList = await articleCollection.find({}).toArray() || []  //全部的数据
    // console.log(AllList)
    const list = AllList.slice(start, end)
    // console.log(list)
    res.json({ code: "200", msg: '获取文章列表成功！', data: list, success: true, page, total: AllList.length })
})

//删除文章接口
router.delete('/article-delete', async (req, res) => {
    // console.log(req.query.id)
    const id = req.query.id
    // console.log(id)
    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    const article = await articleCollection.findOne({ id })   //对象
    if (!article) {
        res.json({ code: "400", msg: "文章不存在", success: false })
        return
    }
    // console.log(article)
    const cover = article.cover
    // console.log(cover)
    if (cover) {
        // 拼成真实物理路径
        let imgPath = path.join(__dirname, '../uploads', cover);
        // console.log(imgPath)
        // 判断文件存在再删除，防止报错
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
            console.log('已删除uploads图片：', imgPath);
        }
    }
    //删除数据库
    await articleCollection.deleteOne({ id })
    res.json({ code: "200", msg: "删除成功", success: true })
})

//上线文章接口
router.post('/article-onoffline', async (req, res) => {
    const id = req.query.id
    //查找文章
    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    const article = await articleCollection.findOne({ id })

    if (!article) {
        res.json({ code: "400", msg: "上线文章不存在", success: false })
        return
    }

    //切换状态：0变1，1变0
    const newStatus = article.status === "1" ? "0" : "1"
    //判断是上线还是下线  如果新状态是1，证明刚刚上线了，反之
    const actionText = newStatus === "1" ? "上线" : "下线"

    //更新状态
    await articleCollection.updateOne({ id }, { $set: { status: newStatus } })
    // console.log(`${actionText}成功！`,id)
    res.json({ code: "200", msg: `${actionText}成功`, success: true })
})

//新增接口
router.post('/article-add', upload.array('cover'), async (req, res) => {
    // console.log(req.body)   //文字
    // console.log(req.files)  //图片
    const id = shortid.generate()   //唯一的标识
    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    //把文字和图片的path存在数据库里
    await articleCollection.insertOne({
        id,
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
        author: "管理员",
        createTime: req.body.createTime||new Date().toISOString().split('T')[0],
        status: "0",  //新增默认没上线
        cover: req.files?.[0]?.filename || "",
        readCount: "0"
    })
    res.json({ code: "200", msg: "新增成功", success: true })
})

//获取文章详情接口
router.get('/article-detail', async (req, res) => {
    const id = req.query.id
    //读取数据库，找对应的文章
    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    const article = await articleCollection.findOne({ id })
    //   console.log(article)
    if (!article) {
        res.json({ code: "400", msg: "文章不存在", success: false })
        return
    }
    res.json({ code: "200", msg: "获取文章详情成功", data: article, success: true, article })
})

//更新文章接口
router.put('/article-update', upload.array('cover'), async (req, res) => {
    // console.log('更新',req.body)   //获取文字
    // console.log('更新',req.files)   //获取图片

    const id = req.query.id
    // console.log(id)

    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    const article = await articleCollection.findOne({ id })
    if (!article) {
        res.json({ code: "400", msg: "文章不存在", success: false })
        return
    }
    // console.log(article)
    const oldCover = article.cover
    console.log('旧图片路径:', oldCover)
    await articleCollection.updateOne({id},{$set:req.body})  //更新了文字
    
    //更新图片
    if (req.files[0]) {
        // console.log('有图片')
        //如果有旧的就删除
        if (oldCover) {
            // 拼成真实物理路径
            let imgPath = path.join(__dirname, '../uploads', oldCover);
            // console.log(imgPath)
            // 判断文件存在再删除，防止报错
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
                console.log('已删除旧图片：', imgPath);
            }
        }
        await articleCollection.updateOne({id},{$set:{cover:req.files[0].filename}})  //更新图片路径
        const newCover = article.cover
        console.log('新图片路径:', newCover)
    } else {
        // console.log('没有图片')
        //如果有旧图片，就删除
        if (oldCover) {
            // 拼成真实物理路径
            let imgPath = path.join(__dirname, '../uploads', oldCover);
            // console.log(imgPath)
            // 判断文件存在再删除，防止报错
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
                console.log('已删除旧图片：', imgPath);
            }
        }
       await articleCollection.updateOne({id},{$set:{cover:''}})   //把图片路径清空
    }
    res.json({ code: "200", msg: "更新成功", success: true })
})
module.exports = router