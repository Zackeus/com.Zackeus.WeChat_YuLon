package com.Zackeus.WeChat_YuLon.common.websocket;

import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.Principal;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;

/**
 * 
 * @Title:WebSocketInterceptor
 * @Description:TODO(WebSocket拦截器)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月19日 上午8:53:27
 */
public class WebSocketInterceptor extends HttpSessionHandshakeInterceptor {
	
	/**
	 * 握手之前将登陆用户信息从session设置到WebSocketSession
	 */
	@Override
	public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Map<String, Object> attributes) throws Exception {
		HttpSession session = getSession(request);
		if (ObjectUtils.isNotEmpty(session)) {
			Principal principal = UserUtils.getPrincipal();
			if (ObjectUtils.isNotEmpty(principal) && StringUtils.isNotBlank(principal.getId())) {
				attributes.put(HTTP_SESSION_ID_ATTR_NAME, principal.getId());
				return Boolean.TRUE;
			}
		}
		return Boolean.FALSE;
	}
	
	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Exception ex) {
		super.afterHandshake(request, response, wsHandler, ex);
	}
	
	private HttpSession getSession(ServerHttpRequest request) {
		if (request instanceof ServletServerHttpRequest) {
			ServletServerHttpRequest serverRequest = (ServletServerHttpRequest) request;
			return serverRequest.getServletRequest().getSession(isCreateSession());
		}
		return null;
	}

}
