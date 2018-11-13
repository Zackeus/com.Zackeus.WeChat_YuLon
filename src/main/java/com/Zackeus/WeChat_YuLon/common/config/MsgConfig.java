package com.Zackeus.WeChat_YuLon.common.config;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * 
 * @Title:MsgConfig
 * @Description:TODO(短信配置类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年11月9日 下午4:52:20
 */
@Configuration
public class MsgConfig {
	
	@Value("${msgConfig.smsMsgUrl}")
	private String smsMsgUrl; // 短信提交地址
	
	@Value("${msgConfig.wxMsgUrl}")
	private String wxMsgUrl; // 微信提交地址
	
	@Value("${msgConfig.defaultRequestSys}")
	private String defaultRequestSys; 		// 默认来源系统
	
	@Value("${msgConfig.defaultRequestUser}")
	private String defaultRequestUser; 		// 默认来源用户
	
	@Value("${msgConfig.defaultReceiverCompany}")
	private String defaultReceiverCompany; 	// 默认接收人公司
	
	@Value("${msgConfig.defaultReceiverRole}")
	private String defaultReceiverRole; 	// 默认接收人角色
	
	@Value("${msgConfig.defaultPlatform}")
	private String defaultPlatform; 	// 默认发送平台
	
	public String getSmsMsgUrl() {
		return smsMsgUrl;
	}
	
	public String getWxMsgUrl() {
		return wxMsgUrl;
	}

	public String getDefaultRequestSys() {
		return defaultRequestSys;
	}

	public String getDefaultRequestUser() {
		return defaultRequestUser;
	}

	public String getDefaultReceiverCompany() {
		return defaultReceiverCompany;
	}

	public String getDefaultReceiverRole() {
		return defaultReceiverRole;
	}
	
	public String getDefaultPlatform() {
		return defaultPlatform;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
