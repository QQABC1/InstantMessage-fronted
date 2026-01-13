import { useEffect, useRef } from 'react';
import useUserStore from '../store/userStore';
import useChatStore from '../store/chatStore';
import { MsgType } from '../utils/constants';

const WS_URL = 'ws://localhost:8888/im'; // 后端 Netty 地址

export const useWebSocket = () => {
    const ws = useRef(null);
    const { userInfo } = useUserStore(); // 获取当前登录用户
    const { addMessage, updateFriendStatus } = useChatStore();


    useEffect(() => {
        if (!userInfo.id) return;

        // 1. 建立连接
        ws.current = new WebSocket(WS_URL);

        // 2. 连接打开 -> 发送鉴权消息
        ws.current.onopen = () => {
            console.log('WS Connected');

            //TODO✅ 严格按照你的要求发送鉴权包
            // 注意：后端目前逻辑是 content 传 userId，实际项目建议传 token
            const authPacket = {
                type: MsgType.AUTH,
                data: {
                    content: String(userInfo.id) // 转字符串 "1001"
                }
            };
            sendMessage(authPacket);

            // 启动心跳 (可选，每30秒发一次)
            // startHeartbeat();
        };

        // 3. 接收消息
        ws.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                console.log('收到消息:', msg);

                // 如果是聊天消息 (文本/文件)
                if (msg.type === MsgType.CHAT_TEXT || msg.type === MsgType.CHAT_FILE) {
                    // 判断是单聊还是群聊，确定 sessionId
                    // 如果是我发的(多端同步)，sessionId是接收者ID；如果是别人发的，sessionId是发送者ID
                    const isMe = msg.senderId === userInfo.id;
                    const sessionId = isMe ? msg.receiverId : msg.senderId;

                    addMessage(sessionId, msg);
                }

                // 处理好友状态变更通知
                if (msg.type === MsgType.USER_STATUS) {
                    // 后端约定：content "1" 为上线，"0" 为下线
                    const isOnline = msg.data.content === "1";
                    // msg.senderId 就是状态发生变化的好友 ID
                    updateFriendStatus(msg.senderId, isOnline);
                    console.log(`用户 ${msg.senderId} ${isOnline ? '上线' : '下线'}`);
                }
            } catch (e) {
                console.error('解析消息失败', e);
            }
        };

        ws.current.onclose = () => {
            console.log('WS Disconnected');
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [userInfo.id]);

    // 发送消息的辅助函数
    const sendMessage = (packet) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(packet));
        } else {
            console.warn('WS未连接');
        }
    };

    // 发送文本消息 (供组件调用)
    const sendText = (receiverId, text, sessionType = 1) => {
        const packet = {
            type: MsgType.CHAT_TEXT,
            senderId: userInfo.id,
            receiverId: receiverId,
            sessionType: sessionType, // 1:单聊 2:群聊
            data: {
                content: text,
                font: { size: 14, color: "#000000" } // 默认字体
            }
        };

        sendMessage(packet);

        // 乐观更新：自己发的消息直接上屏，不用等服务器回推
        addMessage(receiverId, { ...packet, sendTime: new Date().toISOString() });
        // // 注：如果你想等服务器确认再上屏，可以注释掉上面这行，依靠 onmessage 处理
        // addMessage(receiverId, { ...packet, sendTime: new Date().toISOString() });
    };

    return { sendText };
};