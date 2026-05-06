const mongodb=require('mongodb')
//数据库连接地址
const url='mongodb://127.0.0.1:27017'
//数据库名字
const dbName='smartbookhub'
//缓存数据库连接实例
let cachedDb=null

const getDb=async ()=>{
    //如果一开始就有数据库实例，就复用
    if(cachedDb){
        return cachedDb
    }
    try{
 //没有的话就连接数据库
    //先建立客户端
    const client=new mongodb.MongoClient(url)
    //连接数据库
    await client.connect()
    console.log('数据库连接成功')
    //获取数据库连接实例
    const db=client.db(dbName)    //连接到指定的数据库
    //把获取的数据库实例给缓存
    cachedDb=db
    //返回数据库实例
    return cachedDb
    }
    catch(err){
        console.log('数据库连接失败',err)
        throw err
    }
   
}

//暴露获取数据库实例的方法
module.exports=getDb
