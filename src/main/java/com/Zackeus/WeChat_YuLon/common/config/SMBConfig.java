package com.Zackeus.WeChat_YuLon.common.config;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 
 * @Title:SMBConfig
 * @Description:TODO(SMB协议配置类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月13日 上午9:17:10
 */
@Component
public class SMBConfig {
	
	@Value("${smbConfig.ip}")
	private String ip;			// 远程IP
	@Value("${smbConfig.userName}")
	private String userName; 	// 用户名
	@Value("${smbConfig.passWord}")
	private String passWord;    // 密码

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassWord() {
		return passWord;
	}

	public void setPassWord(String passWord) {
		this.passWord = passWord;
	}
	
	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
