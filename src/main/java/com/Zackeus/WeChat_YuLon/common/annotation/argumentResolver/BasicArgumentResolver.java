package com.Zackeus.WeChat_YuLon.common.annotation.argumentResolver;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;

import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;


/**
 * 
 * @Title:BasicArgumentResolver
 * @Description:TODO(参数解析器基类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月6日 上午11:37:02
 */
public abstract class BasicArgumentResolver implements HandlerMethodArgumentResolver {
	
	protected static final String JSON_REQUEST_BODY = "JSON_REQUEST_BODY";
	
	/**
	 * 
	 * @Title：getRequestBody
	 * @Description: TODO(获取请求参数内容)
	 * @see：
	 * @param webRequest
	 * @return
	 */
	protected String getRequestBody(NativeWebRequest webRequest) {
		HttpServletRequest servletRequest = webRequest.getNativeRequest(HttpServletRequest.class);
		String jsonBody = (String) servletRequest.getAttribute(JSON_REQUEST_BODY);
		if (StringUtils.isBlank(jsonBody)) {
			try {
				jsonBody = IOUtils.toString(servletRequest.getInputStream(), servletRequest.getCharacterEncoding());
				servletRequest.setAttribute(JSON_REQUEST_BODY, jsonBody);
			} catch (IOException e) {
				Logs.error("参数解析器异常：" + e.getMessage());
				throw new RuntimeException(e);
			}
		}
		return jsonBody;
	}
}
