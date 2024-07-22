// websocketServer.js
const { authMiddleware } = require('../middleware/authMiddleware');
const WebSocket = require('ws');
const db = require('../config/dbConfig');

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 3200 });

// 存储客户端连接和用户 ID 的映射
const clients = new Map();

wss.on('connection', async function connection(ws, req) {
    console.log('当前的连接数：' + wss.clients.size);
    try {
        ws.on('message', async function incoming(message) {
            try {
                const data = JSON.parse(message);
                console.log('服务端接收到消息：', data);
                const { send_user_id, receiver_user_id, send_content, content_type } = data;
                ws.send_user_id = data.send_user_id;
                clients.set(ws.send_user_id, ws);
                // 将消息保存到SQL
                const sql = 'INSERT INTO one_to_one_message_list (send_user_id, receiver_user_id, send_content,content_type, message_status) VALUES (?, ?, ?, ?, ?)';
                const params = [send_user_id, receiver_user_id, send_content, content_type, false]; // 假设消息开始时为未读状态
                const [insertResult] = await db.query(sql, params);
                console.log('消息保存成功');


                // 广播消息给接收者
                // wss.clients.forEach((client) => {
                //     if (client.readyState === WebSocket.OPEN && client.user_id === receiver_user_id) {
                //         console.log(data);
                //         client.send(JSON.stringify(data));
                //     }
                // });
                
                const receiverSocket = clients.get(receiver_user_id);
                console.log(receiverSocket);
                if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                    receiverSocket.send(message);
                    console.log(`已将消息发送给用户 ${receiver_user_id}。`);
                } else {
                    console.log(`用户 ${receiver_user_id} 未连接.`);
                }

            } catch (error) {
                console.error('处理消息时出错：', error);
            }
        });

        ws.on('close', function close() {
            // 如有需要，处理WebSocket关闭事件
            console.log('关闭了连接');
        });
    } catch (error) {
        console.log('发生错误：', error);
    }
});
