package com.Zackeus.WeChat_YuLon.modules.sys.entity;

import java.io.Serializable;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;

import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;

/**
 * 
 * @Title:Principal
 * @Description:TODO(授权用户信息)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月10日 上午11:46:19
 */
public class Principal implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private String id; 				// 编号
	private String loginName; 		// 登录名
	private String openId;			// 微信用户唯一标识
	private String nickName;		// 微信昵称
	private String name; 			// 姓名
	
	public Principal() {
		super();
	}
	
	public Principal(String id, String loginName, String name) {
		super();
		this.id = id;
		this.loginName = loginName;
		this.name = name;
	}

	public Principal(User user) {
		this.id = user.getId();
		this.loginName = user.getLoginName();
		this.name = user.getName();
	}
	
	public Principal(WeChatUser weChatUser) {
		this.id = weChatUser.getId();
		this.openId = weChatUser.getOpenId();
		this.nickName = weChatUser.getNickName();
		this.name = weChatUser.getWeChatRegister().getName();
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getLoginName() {
		return loginName;
	}

	public void setLoginName(String loginName) {
		this.loginName = loginName;
	}
	
	public String getOpenId() {
		return openId;
	}

	public void setOpenId(String openId) {
		this.openId = openId;
	}

	public String getNickName() {
		return nickName;
	}

	public void setNickName(String nickName) {
		this.nickName = nickName;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public boolean isAdmin() {
		return isAdmin(this.id);
	}
	
	public static boolean isAdmin(String id){
		return StringUtils.isNotBlank(id) && StringUtils.equals(User.ADMIN_ID, id);
	}
	
	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}