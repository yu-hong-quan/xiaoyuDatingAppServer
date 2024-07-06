const Koa = require('koa');
const cors = require('@koa/cors');  // 引入 koa-cors 中间件
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

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
