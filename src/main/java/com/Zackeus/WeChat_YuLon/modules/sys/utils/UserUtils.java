package com.Zackeus.WeChat_YuLon.modules.sys.utils;

import javax.annotation.PostConstruct;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;

import com.Zackeus.WeChat_YuLon.common.security.MySessionManager;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.Principal;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.User;
import com.Zackeus.WeChat_YuLon.modules.sys.service.UserService;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;
import com.Zackeus.WeChat_YuLon.modules.wechat.service.WeChatLoginService;


/**
 * 
 * @Title:UserUtils
 * @Description:TODO(用户工具类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月10日 上午11:50:03
 */
@Component
public class UserUtils {
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private WeChatLoginService weChatService;
	
	@Autowired
	private MySessionManager mySessionManager;
	
	public static UserUtils userUtils;
	
	@PostConstruct
	public void init() {
		userUtils = this;
	}
	
	/**
	 * 根据ID获取用户
	 * @param id
	 * @return 取不到返回null
	 */
	public static User get(String id){
		User user = userUtils.userService.get(id);
		return ObjectUtils.isEmpty(user) ? null : user;
	}
	
	/**
	 * 
	 * @Title：getByLoginName
	 * @Description: TODO(根据登录名获取用户)
	 * @see：
	 * @param loginName
	 * @return
	 */
	public static User getByLoginName(String loginName){
		User user = userUtils.userService.getByLoginName(new User(null, loginName));
		return ObjectUtils.isEmpty(user) ? null : user;
	}
	
	/**
	 * 
	 * @Title：getUserByOpenId
	 * @Description: TODO(根据微信OpenId获取用户)
	 * @see：
	 * @param openId
	 * @return
	 */
	public static WeChatUser getWeChatUserByOpenId(String openId){
		WeChatUser weChatUser = userUtils.weChatService.getByOpenId(new WeChatUser(openId));
		return ObjectUtils.isEmpty(weChatUser) ? null : weChatUser;
	}
	
	/**
	 * 
	 * @Title：getUser
	 * @Description: TODO(获取当前用户)
	 * @see：
	 * @return
	 */
	public static User getUser(){
		Principal principal = getPrincipal();
		if (principal!=null && StringUtils.isNotBlank(principal.getId())){
			User user = get(principal.getId());
			if (user != null){
				return user;
			}
			return new User();
		}
		// 如果没有登录，则返回实例化空的User对象。
		return new User();
	}
	
	/**
	 * 
	 * @Title：getWechatUser
	 * @Description: TODO(获取当前微信用户)
	 * @see：
	 * @return
	 */
	public static WeChatUser getWechatUser() {
		Principal principal = getPrincipal();
		if (ObjectUtils.isNotEmpty(principal) && StringUtils.isNotBlank(principal.getOpenId())){
			WeChatUser weChatUser = getWeChatUserByOpenId(principal.getOpenId());
			if (ObjectUtils.isNotEmpty(weChatUser))
				return weChatUser;
			return new WeChatUser();
		}
		return new WeChatUser();
	}
	
	/**
	 * 
	 * @Title：getSubject
	 * @Description: TODO(获取授权主要对象)
	 * @see：
	 * @return
	 */
	public static Subject getSubject(){
		return SecurityUtils.getSubject();
	}
	
	/**
	 * 
	 * @Title：getPrincipal
	 * @Description: TODO(获取当前登录者对象)
	 * @see：
	 * @return
	 */
	public static Principal getPrincipal() {
		Subject subject = SecurityUtils.getSubject();
		Principal principal = (Principal) subject.getPrincipal();
		return ObjectUtils.isEmpty(principal) ? null : principal;
	}
	
	/**
	 * 
	 * @Title：sendMessageToUser
	 * @Description: TODO(单发信息)
	 * @see：
	 */
	public static void sendMessageToUser(User user, String meg) {
		if (ObjectUtils.isNotEmpty(user) && StringUtils.isNotBlank(user.getId()) 
				&& StringUtils.isNotBlank(meg)) {
			userUtils.mySessionManager.webSocketConfig.webSocketHandler().sendMessageToUser(user.getId(), 
					new TextMessage(meg));
		}
	}
	
	/**
	 * 
	 * @Title：sendMessageToUsers
	 * @Description: TODO(群发信息)
	 * @see：
	 * @param meg
	 */
	public static void sendMessageToUsers(String meg) {
		if (StringUtils.isNotBlank(meg)) {
			userUtils.mySessionManager.webSocketConfig.webSocketHandler().sendMessageToUsers(new TextMessage(meg));
		}
	}
	
	/**
	 * 
	 * @Title：addOnlineUser
	 * @Description: TODO(添加在线用户)
	 * @see：
	 */
	public static void addOnlineUser() {
		Principal principal = getPrincipal();
		if (ObjectUtils.isEmpty(principal))
			return;
		else if (StringUtils.isNotBlank(principal.getOpenId()))
			userUtils.mySessionManager.putSession(principal.getOpenId());
		else if (StringUtils.isNotBlank(principal.getId()))
			userUtils.mySessionManager.putSession(principal.getId());
	}
	
	/**
	 * 
	 * @Title：kickOutUser
	 * @Description: TODO(踢除指定用户)
	 * @see：
	 * @param user
	 */
	public static void kickOutUser(Principal principal, CloseStatus closeStatus) {
		if (ObjectUtils.isEmpty(principal))
			return;
		else if (StringUtils.isNotBlank(principal.getOpenId()))
			kickOutUser(principal.getOpenId(), closeStatus);
		else if (StringUtils.isNotBlank(principal.getId()))
			kickOutUser(principal.getId(), closeStatus);
	}
	
	public static void kickOutUser(String id, CloseStatus closeStatus) {
		userUtils.mySessionManager.deleteSession(id, closeStatus);
	}
	
	/**
	 * 
	 * @Title：kickOutSysUser
	 * @Description: TODO(踢出系统用户)
	 * @see：此方法只适用于接口登录,当使用接口登录时要踢出系统登录用户
	 * @param user
	 * @param closeStatus
	 */
	public static void kickOutSysUser(User user, CloseStatus closeStatus) {
		userUtils.mySessionManager.deleteSession(user.getId(), closeStatus);
	}
}
