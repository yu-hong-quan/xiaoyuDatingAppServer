const Koa = require('koa');
const cors = require('@koa/cors');  // 引入 koa-cors 中间件
const koaBody = require('koa-body');
const bodyParser = require('koa-bodyparser');
const authRoutes = require('./routes/authRoutes');


const app = new Koa();

// 使用跨域中间件
app.use(cors({
    origin: '*',  // 允许所有源
    methods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    headers: 'Authorization,Content-Type',
    credentials: true  // 允许发送 Cookie
}));

app.use(koaBody({ multipart: true }));

// 解析请求体
app.use(bodyParser());
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = { error: err.message };
    }
});
app.use(authRoutes);

// 引入WebSocket服务器
app.use(async (ctx, next) => {
    ctx.websocketServer = wss; // 将WebSocket服务器实例传递给Koa上下文
    await next();
});


// 启动Koa服务器
app.listen(8080, () => {
    console.log('Server running on http://192.168.31.198:8080');
});

// 在Koa应用程序中同时启动WebSocket服务器。确保两个服务器可以并行运行。
require('./socketServer/websocketServer');
