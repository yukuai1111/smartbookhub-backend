# SmartBookHub - 后端

> 基于 Node.js + Express + MongoDB 的智能图书库后端接口。

## 功能特性
## 前台用户功能（userType=1）
- 用户注册 / 登录（JWT 鉴权）
- 查看文章列表（推荐文章/全部文章）
- 查看文章详情
- 阅读文章（增加阅读量）
- AI 对话助手（Ollama 集成）
- 新增/保存/获取/删除对话

## 后台管理员功能（userType=2）
- 新增/删除/修改/发布/下线文章
- 文章封面上传(非必须)

>**注意**：除/user/login和/user/register外，其他接口都需要在请求头中携带"token"。

## 技术栈

- Node.js + Express
- MongoDB
- JWT
- multer
- Ollama 集成

## 本地运行

### 前置条件

- Node.js v18.x 或更高版本
- MongoDB（本地安装并启动服务）
- Ollama（本地安装并启动服务）


### 步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/yukuai1111/smartbookhub-backend.git
   cd smartbookhub-backend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
- 复制`.env.example`为`.env`
    ```bash
    cp .env.example .env
    ```
- 编辑.env文件
   PORT=3000
   TokenKey=你的JWT密钥（任意字符串）

4. 启动mongoDB
**Windows示例**
```bash
mongod --dbpath D:\mongodb-data   # D盘mongodb-data文件夹为数据存放文件夹

```
**macOS/Linux示例**
```bash
sudo systemctl start mongod #或直接运行mongod
```

5. 启动Ollama服务
** 首次运行时，需下载模型**
```bash
ollama run qwen:o.5b
   ```
> 这里使用的是qwen:o.5b模型，如更换其他模型，在front.js中修改model变量。

** 后续运行时，无需下载模型，直接启动服务即可**
```bash
ollama serve
```
> 如不需要AI功能，项目也可运行，但无法使用AI对话助手。

6. 启动后端服务
   ```bash
   npm start  #或node app.js
   ```

### 默认管理员账号
首次启动后端服务时，系统会自动初始化一个管理员账号
- **用户名**：admin
- **密码**：123456


## 📡 接口示例

### 注册用户

- 请求示例：
** Git Bash/macOS/Linux示例**
```bash
curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@example.com"}'
```
** Windows cmd 用户请使用一行命令**
```cmd
curl -X POST http://localhost:3000/user/register -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"123456\",\"email\":\"test@example.com\"}"
```

- 成功响应示例：
```json
{
    "code": "200",
    "msg": "注册成功",
    "data": {
        "id": "xxx",
        "username": "test",
        "userType": 1
    },
    "success": true,
}
```
- 失败响应示例（用户已存在）：
```json
{
    "code": "400",
    "msg": "用户名已存在",
    "success": false,
}
```

### 登录用户

- 请求示例：
** Git Bash/macOS/Linux示例**
```bash
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```
** Windows cmd 用户请使用一行命令**
```cmd
curl -X POST http://localhost:3000/user/login -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"123456\"}"
```
- 成功响应示例：
```json
{
    "code": "200",
    "msg": "登录成功",
    "data": {
         "id": "xxx",
         "username": "test",
         "userType": 1,
         "token": "xxx"
    },
    "success": true,
}
```
- 失败响应示例（用户名或密码错误）：
```json
{
    "code": "400",
    "msg": "用户名或密码错误",
    "success": false,
}
```

### 新增文章（需要 token，userType=2）

- 请求示例：
** Git Bash/macOS/Linux示例**
```bash
curl -X POST http://localhost:3000/admin/article-add \
  -H "token: <登录时返回的token>" \
  -F "title=测试图书" \
  -F "summary=这是摘要" \
  -F "content=这是内容" \
  -F "cover=@/path/to/cover.jpg"   # 可选
```
** Windows cmd 用户请使用一行命令**
```cmd
curl -X POST http://localhost:3000/admin/article-add -H "token: <登录时返回的token>" -F "title=测试图书" -F "summary=这是摘要" -F "content=这是内容" -F "cover=@/path/to/cover.jpg"   # cover可选,@后面为文件绝对路径
```
- 成功响应示例：
```json
{
    "code": "200",
    "msg": "新增文章成功",
    "success": true,
}
```

