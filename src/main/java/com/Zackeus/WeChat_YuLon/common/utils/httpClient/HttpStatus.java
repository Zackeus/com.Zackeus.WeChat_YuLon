package com.Zackeus.WeChat_YuLon.common.utils.httpClient;

import org.springframework.web.socket.CloseStatus;

/**
 * 
 * @Title:HttpStatus
 * @Description:TODO(请求状态码)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月18日 上午10:33:52
 */
public class HttpStatus implements org.apache.http.HttpStatus {
	/**
	 * -1 ：登录校验异常
	 * 400 ：参数异常
	 * 403 ：授权登录异常
	 * 405 ：不支持当前请求方法
	 * 415 ：不支持当前媒体类型 
	 * 500 ：业务逻辑异常
	 * 999 ：未知的错误
	 * 1001 ：数据库异常
	 */
	
	/**
	 * 成功状态
	 */
	public static final int SC_SUCCESS = 0;
	
	/**
	 * 登录异常
	 */
	public static final int SC_LOGIN_ERROR = -1;
	
	/**
	 * 异地登录
	 */
	public static final CloseStatus SC_KICK_OUT = new CloseStatus(4600, "账号异地登录！");
	
	/**
	 * 会话超时
	 */
	public static final CloseStatus SC_SESSION_EXPRIES = new CloseStatus(4610, "长时间未操作！");
	
	/**
	 * 接口登录
	 */
	public static final CloseStatus SC_SESSION_HTTPLOGIN = new CloseStatus(4620, "接口登录！");
	
	/**
	 * 坐席中途登出
	 */
	public static final CloseStatus SC_SESSION_AGENTLOGOUT = new CloseStatus(4630, "坐席中途登出！");
	
	/**
	 * 坐席中途登出
	 */
	public static final CloseStatus SC_SESSION_AGENTUPDATE = new CloseStatus(4640, "坐席账号更新！");
	
	/**
	 * 数据库异常
	 */
	public static final int SC_SQL_SERROR = 1001;
	
	/**
	 * 未知的异常
	 */
	public static final int SC_UNKNOWN = 999;
	
	/**
	 * 小程序系统异常
	 */
	public static final int WE_CHAT_ERROR = 40000;
	
	/**
	 * 微信用户注册失败
	 */
	public static final int WE_CHAT_REGISTERED_FAIL = 40001;
	
	/**
	 * 未注册
	 */
	public static final int WE_CHAT_UN_REGISTERED = 40002;
	
	/**
	 * 微信登录失败
	 */
	public static final int WE_CHAT_CODE_FAIL = 40003;
	
}
