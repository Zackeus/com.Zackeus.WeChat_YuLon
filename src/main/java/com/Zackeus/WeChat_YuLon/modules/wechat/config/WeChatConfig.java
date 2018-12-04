package com.Zackeus.WeChat_YuLon.modules.wechat.config;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * 
 * @Title:WeChatConfig
 * @Description:TODO(微信配置参数)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年11月7日 下午2:17:13
 */
@Configuration
public class WeChatConfig {
	
	@Value("${wechatConfig.appIdKey}")
	private String appIdKey;
	
	@Value("${wechatConfig.secretKey}")
	private String secretKey;
	
	@Value("${wechatConfig.appId}")
	private String appId;
	
	@Value("${wechatConfig.secret}")
	private String secret;
	
	@Value("${wechatConfig.codeUrl}")
	private String codeUrl;
	
	public static final String WE_CHAT_USER = "weChatUser"; // 待核实身份信息
	
	public String getAppIdKey() {
		return appIdKey;
	}

	public String getSecretKey() {
		return secretKey;
	}

	public String getAppId() {
		return appId;
	}

	public String getSecret() {
		return secret;
	}
	
	public String code2SessionUrl(String code) {
		return codeUrl.replace(getAppIdKey(), getAppId()).replace(getSecretKey(), getSecret()).replace("{code}", code);
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
