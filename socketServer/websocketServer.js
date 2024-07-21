// websocketServer.js

const WebSocket = require('ws');
const db = require('../config/dbConfig');

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 3200 });
wss.on('connection', async function connection(ws, req) {
    console.log(req);
    try {
        // 验证token
        await authMiddleware(req, async () => {
            ws.on('message', async function incoming(message) {
                try {
                    const data = JSON.parse(message);
                    console.log('收到消息：', data);
                    const { send_user_id, receiver_user_id, send_content, content_type } = data;

                    // 将消息保存到MySQL
                    const sql = 'INSERT INTO one_to_one_message_list (send_user_id, receiver_user_id, send_content,content_type, message_status) VALUES (?, ?, ?, ?)';
                    const params = [send_user_id, receiver_user_id, send_content, content_type, false]; // 假设消息开始时未读

                    const [insertResult] = await db.query(sql, params);
                    console.log(insertResult);

                    // 将消息广播给接收者
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && client.user_id === receiver_user_id) {
                            client.send(message);
                        }
                    });
                } catch (error) {
                    console.error('处理消息时出错：', error);
                }
            });

            ws.on('close', function close() {
                // 如有需要，处理WebSocket关闭事件
            });
        })
    } catch (error) {
        console.log(error);
    }
});
