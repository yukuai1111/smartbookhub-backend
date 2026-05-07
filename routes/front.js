const express = require('express')
const router = express.Router()

//引入数据库
const getDb = require('../db.js')

//创建id
const shortid = require('shortid');


//获取推荐文章列表接口
router.get('/article-recommend-list', async (req, res) => {
    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    //读取数据库，取出上线文章
    const AllList = await articleCollection.find({ status: '1' }).toArray() || []
    // console.log(AllList)

    //根据阅读量进行排序
    AllList.sort((a, b) => {
        const aRead = a.readCount
        const bRead = b.readCount
        // console.log(aRead,bRead)
        return bRead - aRead     //降序：后一个-前一个   升序：前一个-后一个
    })

    //只要5条数据
    const list = AllList.slice(0, 5)
    res.json({ code: "200", msg: "获取推荐文章列表成功", data: list, success: true, total: list.length })
})

//获取全部文章列表接口
router.get('/article-all-list', async (req, res) => {
    //实现分页
    const page = Number(req.query.currentPage) || 1
    const pageSize = 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    //创建数据库实例
    const db = await getDb()
    //获取文章集合
    const articleCollection = db.collection('articles')
    //读取数据库，挑选只有status=1的文章
    const AllList = await articleCollection.find({ status: "1" }).toArray() || []
    //最后的数据每次只有10条数据
    const list = AllList.slice(start, end)

    res.json({ code: "200", msg: "获取文章列表成功", data: list, success: true, page, total: AllList.length })
})

//获取推荐文章详情的接口
router.get('/article-recommend-detail', async (req, res) => {
    const id = req.query.id
    //读取数据库
    const db = await getDb()
    const articleCollection = db.collection('articles')
    const article = await articleCollection.findOne({ id })
    // console.log(article)   //对象
    if (!article) {
        res.json({ code: '400', msg: '文章不存在', success: false })
        return
    }

    // 增加阅读量
    let num = Number(article.readCount) + 1
    //更新数据库的阅读量
    await articleCollection.updateOne({ id }, { $set: { readCount: String(num) } })
    //手动更新页面阅读量+1
    article.readCount = num
    res.json({ code: '200', msg: '获取文章详情成功', data: article, success: true })

})

//获取全部文章详情接口
router.get('/article-all-detail', async (req, res) => {
    const id = req.query.id
    const db = await getDb()
    const articleCollection = db.collection('articles')
    const article = await articleCollection.findOne({ id })
    if (!article) {
        res.json({ code: '400', msg: '文章不存在', success: false })
        return
    }
    // 增加阅读量
    let num = Number(article.readCount) + 1
    //更新数据库的阅读量
    await articleCollection.updateOne({ id }, { $set: { readCount: String(num) } })
    //手动更新页面阅读量+1
    article.readCount = num
    res.json({ code: '200', msg: '获取文章详情成功', data: article, success: true })
})


//保存新对话记录接口
router.post('/ai-save-new-conversation', async (req, res) => {
    const username = req.body.username
    const messages = req.body.messages
    const startTime = req.body.startTime
    const endTime = req.body.endTime
    const id = shortid.generate()   //唯一的标识
    // console.log(username, messages, startTime, endTime)
    //生成标题
    const title = await generateTitle(messages)
    console.log("生成的title:", title)
    //创建数据库实例
    const db = await getDb()
    //获取用户集合
    const userCollection = db.collection('users')

    //读取数据库，保存对应用户的消息
    const user = await userCollection.findOne({ username })

    //保存对话记录
    user.conversation.push({ id, messages, startTime, endTime ,title})
    await userCollection.updateOne({ username }, { $set: { conversation: user.conversation } })
    res.json({ code: '200', msg: '保存对话记录成功', success: true })

})

//保存旧对话记录接口
router.post('/ai-save-old-conversation', async (req, res) => {
    const username = req.body.username
    const messages = req.body.messages
    const endTime = req.body.endTime
    const id = req.body.id
    // console.log(username, messages, endTime, id)
    //生成标题
    const title = await generateTitle(messages)
    console.log("更新的title:", title)
    const db = await getDb()
    const userCollection = db.collection('users')
    //读取数据库，找用户
    const user = await userCollection.findOne({ username })

    //读取数据库，找对话
    const conversation = user.conversation.find(item => item.id === id)
    if (!conversation) {
        res.json({ code: '400', msg: '对话记录不存在！', success: false })
        return
    }
    //更新对话记录
    conversation.title = title   //更新标题
    conversation.messages = messages
    conversation.endTime = endTime
    await userCollection.updateOne({ username }, { $set: { conversation: user.conversation } })
    res.json({ code: '200', msg: '保存对话记录成功',success: true })
})

//获取对话记录列表接口
router.get('/ai-conversation-list', async (req, res) => {
    const username = req.query.username
    // console.log(username)
    const db = await getDb()
    const userCollection = db.collection('users')
    const user = await userCollection.findOne({ username })
    // console.log(user)

    const list = user.conversation || []
    // console.log(list)   //数组
    res.json({ code: '200', msg: '获取对话记录成功', data: list, success: true })
})

//获取对话记录详情接口
router.get('/ai-conversation-detail', async (req, res) => {
    const id = req.query.id
    const username = req.query.username
    // console.log(id,username)
    const db = await getDb()
    const userCollection = db.collection('users')
    const user = await userCollection.findOne({ username })
    // console.log(user)
    const conversation = user.conversation.find(item => item.id === id)
    if (!conversation) {
        res.json({ code: '400', msg: '对话记录不存在！', success: false })
        return
    }
    // console.log('对话记录详情',conversation)
    res.json({ code: '200', msg: '获取对话记录详情成功', data: conversation, success: true })
})

//获取ai回复接口
router.post('/ai-get-reply', async (req, res) => {
    const { messages, model = 'qwen:0.5b' } = req.body
    if (!messages || messages.length === 0) {
        res.json({ code: '400', msg: '请输入内容！', success: false })
        return
    }
    //设置响应头:禁用缓存，保持连接
    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    //格式转换，将messages转换成ollama需要的格式
    const ollamaMessages = messages.map(item => {
        return {
            role: item.role === 'ai' ? 'assistant' : 'user',
            content: item.content
        }
    })
    //调用ollama
    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                messages: ollamaMessages,   //用户消息
                stream: true,
                option: {
                    num_predict: 256,
                    temperature: 0.7,
                    top_p: 0.95,
                    frequency_penalty: 0.0,
                    presence_penalty: 0.0,

                }
            })
        })
        // console.log(response.ok)
        if (!response.ok) {
            throw new Error('调用ollama失败' + response.status)
        }
        //读取器
        const reader = response.body.getReader()
        //转换器
        const decoder = new TextDecoder()
        //开始循环，直到done为true
        //不知道循环几次，用while
        while (true) {
            //提取出读取器里的数据done和value
            const { done, value } = await reader.read()   //reader.read()返回的是Promise，异步需用await
            //done为true时，就停止
            if (done) {
                break
            }
            //value使buffer类型，需要转成字符串
            const data = decoder.decode(value, { stream: true })
            //需要用res.write(),因为要实现流式
            res.write(data)
        }
        res.end()
    }
    catch (err) {
        console.log('调用ollama失败：' + err)
        res.write(`{"error":"AI服务不可用"}\n`)
        res.end()
    }

})

//删除历史会话接口
router.post('/ai-delete', async (req, res) => {
    const { username, id } = req.body
    const db = await getDb()
    const userCollection = db.collection('users')
    const user = await userCollection.findOne({ username })
    const conversation = user.conversation.find(item => item.id === id)
    if (!conversation) {
        res.json({ code: '400', msg: '对话记录不存在！', success: false })
        return
    }
    //删除记录
    //去掉id相同的会话，就是再筛选id不同的会话
    user.conversation = user.conversation.filter(item => item.id !== id)
    //更新数据库
    await userCollection.updateOne({ username }, { $set: { conversation: user.conversation } })
    res.json({ code: '200', msg: '删除对话记录成功', success: true })
})

//生成对话标题
async function generateTitle(messages) {
    //遍历每一个messages，把content提出来，拼成字符串
    const content = messages.map(item => item.content).join('\n')
    const prompt = `根据以下对话内容，生成一个简短标题（5-12个字）(只要标题，不要其他内容，不要包含"标题"这两个字)：  \n对话：${content}`
    //调用AI
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen:0.5b',
                prompt,
                stream: false,
                options: {
                    num_predict: 30,
                }
            })
        })
        if (!response.ok) {
            throw new Error('调用ollama失败' + response.status)
        }
        //解析JSON格式
        const data = await response.json()
        // console.log('生成标题原始数据：', data)
        let title=await data.response?.trim()||'新对话'
        // console.log('生成标题成功：', title)
        if(title.length>=12){
            title=title.slice(0,12)
        }
        return title

    }
    catch (err) {
        console.log('生成标题失败：', err)
        return '新对话'
    }

}
//暴露路由
module.exports = router