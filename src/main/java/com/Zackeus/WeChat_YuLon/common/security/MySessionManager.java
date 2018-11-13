package com.Zackeus.WeChat_YuLon.common.security;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.InvalidSessionException;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.mgt.eis.SessionDAO;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;

import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.websocket.WebSocketConfig;

/**
 * 
 * @Title:SessionManager
 * @Description:TODO(会话管理类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月19日 下午1:06:35
 */
@Component
public class MySessionManager extends DefaultWebSessionManager {
	
	@Autowired
	public SessionDAO sessionDAO;
	
	@Autowired
	public WebSocketConfig webSocketConfig;
	
	public final Map<String, Session> shiroSessions = new ConcurrentHashMap<String, Session>();
	
	// 当前对象ID（pc端登录为userId，小程序登录为openId）
	public static final String PRINCIPAL_ID = "principalId";
	
	/**
	 * 
	 * @Title：putSession
	 * @Description: TODO(注册session信息)
	 * @see：
	 * @param user
	 */
	public void putSession(String id) {
		Session session = getSession();
		session.setAttribute(PRINCIPAL_ID, id);
		shiroSessions.put((String) session.getAttribute(PRINCIPAL_ID), session);
	}
	
	/**
	 * 
	 * @Title：getSession
	 * @Description: TODO(获取当前session)
	 * @see：
	 * @return
	 */
	public Session getSession(){
		try {
			Subject subject = SecurityUtils.getSubject();
			Session session = subject.getSession(false);
			if (ObjectUtils.isEmpty(session)){
				session = subject.getSession();
			} else {
				return session;
			}
		} catch (InvalidSessionException e){
			Logs.error("获取session异常：" + Logs.toLog(e));
		}
		return null;
	}
	
	/**
	 * 
	 * @Title：getSession
	 * @Description: TODO(获取指定用户session)
	 * @see：
	 * @param id
	 * @return
	 */
	public Session getSession(String id) {
		return shiroSessions.containsKey(id) ? shiroSessions.get(id) : null;
	}
	
	/**
	 * 
	 * @Title：deleteSession
	 * @Description: TODO(剔除用户Session)
	 * @see：
	 * @param session
	 */
	public void deleteSession(String id, CloseStatus closeStatus) {
		Session session = getSession(id);
		if (shiroSessions.containsKey(id)) {
			sessionDAO.delete(session);
			shiroSessions.remove(id);
		}
		webSocketConfig.webSocketHandler().kickOutUser(id, closeStatus);
	}

}
