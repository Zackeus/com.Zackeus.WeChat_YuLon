package com.Zackeus.WeChat_YuLon.common.entity;

/**
 * 
 * @Title:UsernamePasswordToken
 * @Description:TODO(用户和密码（包含验证码）令牌类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月12日 下午3:36:20
 */
public class UsernamePasswordToken extends org.apache.shiro.authc.UsernamePasswordToken {

	private static final long serialVersionUID = 1L;

	private String captcha;
	
	// 微信客户端登录
	private boolean wechatLogin;
	
	public UsernamePasswordToken() {
		super();
	}

	public UsernamePasswordToken(String username, char[] password,
			boolean rememberMe, String host, String captcha, boolean wechatLogin) {
		super(username, password, rememberMe, host);
		this.captcha = captcha;
		this.wechatLogin = wechatLogin;
	}

	public String getCaptcha() {
		return captcha;
	}

	public void setCaptcha(String captcha) {
		this.captcha = captcha;
	}

	public boolean isWechatLogin() {
		return wechatLogin;
	}

}