package com.Zackeus.WeChat_YuLon.common.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.client.methods.HttpPost;
import org.apache.shiro.web.servlet.AdviceFilter;
import org.springframework.http.MediaType;

import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.utils.JsonMapper;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WebUtils;
import com.Zackeus.WeChat_YuLon.common.utils.exception.MyException;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.common.web.MyHttpServletRequestWrapper;

/**
 * 
 * @Title:BaseFilter
 * @Description:TODO(拦截器基类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年8月8日 下午2:15:12
 */
public abstract class BaseFilter extends AdviceFilter {
	
	@Override
	public void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		if (StringUtils.equals(HttpPost.METHOD_NAME, WebUtils.toHttp(request).getMethod())) {
			request = new MyHttpServletRequestWrapper(WebUtils.toHttp(request));
		}
		super.doFilterInternal(request, response, chain);
	}
	
	/**
	 * 
	 * @Title：analysisHeader
	 * @Description: TODO(解析请求头信息)
	 * @see：
	 * @param request
	 * @param headerName
	 * @return
	 */
	public String analysisHeader(ServletRequest request, String headerName) {
		return StringUtils.isBlank(WebUtils.toHttp(request).getHeader(headerName)) ? 
				StringUtils.EMPTY : WebUtils.toHttp(request).getHeader(headerName);
	}

	/**
	 * 
	 * @Title：handleHttpRequest
	 * @Description: TODO(处理请求返回)
	 * @see：
	 * @param httpServletRequest
	 * @param httpServletResponse
	 * @param msg
	 * @throws IOException
	 */
	protected void handleHttpRequest(ServletResponse response, Object msg) {
		HttpServletResponse httpServletResponse = WebUtils.toHttp(response);
		httpServletResponse.reset();
		httpServletResponse.setCharacterEncoding(WebUtils.UTF_ENCODING);
		httpServletResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
		try {
			httpServletResponse.getWriter().print(JsonMapper.toJsonString(msg));
		} catch (IOException e) {
			Logs.error("拦截器信息回填异常：" + e.getMessage());
		}
	}
	
	/**
	 * 异常处理
	 */
	@Override
	protected void cleanup(ServletRequest request, ServletResponse response, Exception existing)
			throws ServletException, IOException {
		Exception exception = existing;
		try {
			afterCompletion(request, response, exception);
		} catch (Exception e) {
			exception = e;
		}
		if (ObjectUtils.isNotEmpty(exception)) {
			if (exception instanceof MyException) {
				handleHttpRequest(response, new AjaxResult(((MyException) exception).getErrorCode(), exception.getMessage()));
            } else {
				handleHttpRequest(response, new AjaxResult(HttpStatus.SC_LOGIN_ERROR, exception.getMessage()));
            }
		}
	}

}
