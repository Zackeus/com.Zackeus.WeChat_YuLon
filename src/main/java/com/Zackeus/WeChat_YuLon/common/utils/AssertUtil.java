package com.Zackeus.WeChat_YuLon.common.utils;

import org.apache.shiro.authc.AuthenticationException;
import org.springframework.util.Assert;

import com.Zackeus.WeChat_YuLon.common.utils.exception.MyException;
import com.Zackeus.WeChat_YuLon.common.utils.exception.XmlException;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;

/**
 * 
 * @Title:AssertUtil
 * @Description:TODO(断言工具类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月21日 下午4:33:56
 */
public class AssertUtil extends Assert {
	
	private static String DEFAULT_ASSERT_MSG = "关键参数不能为空";
	
	
	public static void isXmlTrue(boolean expression, String code, String message) {
		if (!expression)
			throw new XmlException(code, message);
	}	
	
	public static void isAuthenTrue(boolean expression, String message) {
		if (!expression) {
			throw new AuthenticationException(message);
		}
	}
	
	public static void isTrue(boolean expression, Integer code, String message) {
		if (!expression) {
			throw new MyException(code, message);
		}
	}
	
	/**
	 * 
	 * @Title：notEmpty
	 * @Description: TODO(不为空)
	 * @see：
	 * @param object
	 */
	public static void notEmpty(Object object) {
		notEmpty(object, StringUtils.EMPTY);
	}
	
	public static void notEmpty(Object object, String msg) {
		Assert.isTrue(ObjectUtils.isNotEmpty(object), StringUtils.isBlank(msg) ? DEFAULT_ASSERT_MSG : msg);
	}
	
	/**
	 * 
	 * @Title：assertAgent
	 * @Description: TODO(不为空)
	 * @see：
	 */
	public static void notEmpty(String msg, Object... objects) {
		for (Object object : objects) {
			if (ObjectUtils.isEmpty(object)) {
				throw new MyException(HttpStatus.SC_BAD_REQUEST, StringUtils.isBlank(msg) ? DEFAULT_ASSERT_MSG : msg);
			}
		}
	}
	
}
