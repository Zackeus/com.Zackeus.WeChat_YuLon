package com.Zackeus.WeChat_YuLon.common.websocket;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;


/**
 * 
 * @Title:WebSocketHandler
 * @Description:TODO(消息处理类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月19日 上午9:24:05
 */
public class WebSocketHandler extends TextWebSocketHandler {
	
	//Map来存储WebSocketSession，key用USER_ID 即在线用户列表 
	public final Map<String, WebSocketSession> socketUsers = new ConcurrentHashMap<String, WebSocketSession>();
	
	/**
	 * 链接(onopen)
	 */
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		socketUsers.put(getUserId(session), session);
	}

	/**
	 * 
	 * @Title：handleTextMessage
	 * @Description: TODO(js调用websocket.send时候，会调用该方法)
	 * @see：
	 * @param session
	 * @param message
	 * @throws Exception
	 */
	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) {
		Logs.info("信息：" + message);
	}
	
	
	/**
	 * 传输异常
	 */
	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        if(session.isOpen()) {
            session.close();  
        }
        String userId = getUserId(session);
        Logs.error(userId + ": 传输出现异常，关闭websocket连接... ");
        socketUsers.remove(userId);
	}
	
	@Override
	public boolean supportsPartialMessages() {
		return Boolean.FALSE;
	}
	
	/**
	 * 
	 * @Title：sendMessageToUser
	 * @Description: TODO(单发信息)
	 * @see：
	 * @param workNo
	 * @param message
	 */
	public void sendMessageToUser(String userId, TextMessage message) {  
		if (isOnLine(socketUsers.get(userId))) {
			try {
				socketUsers.get(userId).sendMessage(message);
			} catch (IOException e) {
				Logs.error(userId + ": 单发信息失败--" + e.getMessage());
			}  
		}
	}
	
	/**
	 * 
	 * @Title：sendMessageToUsers
	 * @Description: TODO(群发信息)
	 * @see：
	 * @param message
	 */
	public void sendMessageToUsers(TextMessage message) {
		for (String userId : socketUsers.keySet()) {
			if (isOnLine(socketUsers.get(userId))) {
				try {
					socketUsers.get(userId).sendMessage(message);
				} catch (IOException e) {
					Logs.error(userId + ": 群发信息失败--" + e.getMessage());
				}
			}
		}
		
	}
	
	/**
	 * 
	 * @Title：kickOutUser
	 * @Description: TODO(踢出指定用户)
	 * @see：
	 * @param userId
	 */
	public void kickOutUser(String userId, CloseStatus closeStatus) {
		WebSocketSession session = socketUsers.get(userId);
		if (isOnLine(session)) {
			try {
				session.close(closeStatus);
			} catch (IOException e) {
				Logs.error("关闭 webosket异常：" + e.getMessage());
			}
		}
	}
	
	/**
	 * 退出(onclose)
	 * CloseStatus:
	 * 1000:表示正常关闭，意思是建议的连接已经完成了
	 * 1001:表示端点“离开”（going away），例如服务器关闭或浏览器导航到其他页面
	 * 1002:表示端点因为协议错误而终止连接
	 * 1003:表示端点由于它收到了不能接收的数据类型（例如，端点仅理解文本数据，但接收到了二进制消息）而终止连接
	 * 1004:保留。可能在将来定义其具体的含义
	 * 1005:是一个保留值，且不能由端点在关闭控制帧中设置此状态码。它被指定用在期待一个用于表示没有状态码是实际存在的状态码的应用中
	 * 1006:是一个保留值，且不能由端点在关闭控制帧中设置此状态码。它被指定用在期待一个用于表示连接异常关闭的状态码的应用中
	 * 1007:表示端点因为消息中接收到的数据是不符合消息类型而终止连接（比如，文本消息中存在非UTF-8[RFC3629]数据）
	 * 1008:表示端点因为接收到的消息违反其策略而终止连接。这是一个当没有其他合适状态码（例如1003或1009）或如果需要隐藏策略的具体细节时能被返回的通用状态码
	 * 1009:表示端点因接收到的消息对它的处理来说太大而终止连接
	 * 1010:表示端点（客户端）因为它期望服务器协商一个或多个扩展，但服务器没有在WebSocket握手响应消息中返回它们而终止连接。 所需要的扩展列表应该出现在关闭帧的/reason/部分
	 * 1011:表示服务器端因为遇到了一个不期望的情况使它无法满足请求而终止连接
	 * 1015:是一个保留值，且不能由端点在关闭帧中被设置为状态码。它被指定用在期待一个用于表示连接由于执行TLS握手失败而关闭的状态码的应用中（比如，服务器证书不能验证）
	 */
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		socketUsers.remove(getUserId(session));
	}
	
	private String getUserId(WebSocketSession session) {
		return (String) session.getAttributes().get(WebSocketInterceptor.HTTP_SESSION_ID_ATTR_NAME);
	}
	
	/**
	 * 
	 * @Title：isOnLine
	 * @Description: TODO(判断是否在线)
	 * @see：
	 * @param session
	 * @return
	 */
	private boolean isOnLine(WebSocketSession session) {
		return ObjectUtils.isNotEmpty(session) && session.isOpen();
	}

}
