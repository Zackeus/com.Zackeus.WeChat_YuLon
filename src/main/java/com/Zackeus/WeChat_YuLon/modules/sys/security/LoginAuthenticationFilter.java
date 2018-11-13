package com.Zackeus.WeChat_YuLon.modules.sys.security;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.MediaType;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.subject.Subject;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSON;

import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.entity.UsernamePasswordToken;
import com.Zackeus.WeChat_YuLon.common.utils.JsonMapper;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WebUtils;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;

/**
 * 
 * @Title:LoginAuthenticationFilter
 * @Description:TODO(登录验证过滤类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年8月10日 下午2:22:55
 */
@Service
public class LoginAuthenticationFilter extends org.apache.shiro.web.filter.authc.FormAuthenticationFilter {

	public static final String DEFAULT_CAPTCHA_PARAM = "validateCode";
	public static final String DEFAULT_WECHAT_PARAM = "wechatLogin";
	public static final String DEFAULT_MESSAGE_PARAM = "message";

	private String captchaParam = DEFAULT_CAPTCHA_PARAM;
	private String wechatLoginParam = DEFAULT_WECHAT_PARAM;
	private String messageParam = DEFAULT_MESSAGE_PARAM;

	protected AuthenticationToken createToken(ServletRequest request, ServletResponse response) {
		String username = getUsername(request);
		String password = getPassword(request);
		if (StringUtils.isBlank(password)) {
			password = StringUtils.EMPTY;
		}
		boolean rememberMe = isRememberMe(request);
		String host = StringUtils.getRemoteAddr((HttpServletRequest) request);
		String captcha = getCaptcha(request);
		boolean wechat = isWechatLogin(request);
		return new UsernamePasswordToken(username, password.toCharArray(), rememberMe, host, captcha, wechat);
	}

	/**
	 * 获取登录用户名
	 */
	@Override
	protected String getUsername(ServletRequest request) {
		String username = super.getUsername(request);
		if (StringUtils.isBlank(username)) {
			username = StringUtils.toString(request.getAttribute(getUsernameParam()), StringUtils.EMPTY);
		}
		return username;
	}

	/**
	 * 获取登录密码
	 */
	@Override
	protected String getPassword(ServletRequest request) {
		String password = super.getPassword(request);
		if (StringUtils.isBlank(password)) {
			password = StringUtils.toString(request.getAttribute(getPasswordParam()), StringUtils.EMPTY);
		}
		return password;
	}

	/**
	 * 获取记住我
	 */
	@Override
	protected boolean isRememberMe(ServletRequest request) {
		String isRememberMe = WebUtils.getCleanParam(request, getRememberMeParam());
		if (StringUtils.isBlank(isRememberMe)) {
			isRememberMe = StringUtils.toString(request.getAttribute(getRememberMeParam()), StringUtils.EMPTY);
		}
		return StringUtils.toBoolean(isRememberMe);
	}

	public String getCaptchaParam() {
		return captchaParam;
	}

	protected String getCaptcha(ServletRequest request) {
		return WebUtils.getCleanParam(request, getCaptchaParam());
	}

	public String getWechatLoginParam() {
		return wechatLoginParam;
	}

	protected boolean isWechatLogin(ServletRequest request) {
		return WebUtils.isHeadTrue(request, getWechatLoginParam());
	}

	public String getMessageParam() {
		return messageParam;
	}

	/**
	 * 决定是否让用户登录
	 */
	@Override
	protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) {
		Subject subject = getSubject(request, response);
		return subject.isAuthenticated();
	}

	/**
	 * 
	 * @Title：onAccessDenied
	 * @Description: TODO(登录路径校验) @see：
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@Override
	protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
		return super.onAccessDenied(request, response);
	}

	/**
	 * 登录认证
	 */
	@Override
	protected boolean executeLogin(ServletRequest request, ServletResponse response) throws Exception {
		return super.executeLogin(request, response);
	}

	/**
	 * 登录成功
	 */
	@Override
	protected boolean onLoginSuccess(AuthenticationToken token, Subject subject, ServletRequest request,
			ServletResponse response) throws Exception {
		// 踢出同一用户
		UserUtils.kickOutUser(UserUtils.getPrincipal(), HttpStatus.SC_KICK_OUT);
		// 注册用户信息
		UserUtils.addOnlineUser();
		return super.onLoginSuccess(token, subject, request, response);
	}

	/**
	 * 登录失败事件
	 */
	@Override
	protected boolean onLoginFailure(AuthenticationToken token, AuthenticationException e, ServletRequest request,
			ServletResponse response) {
		String className = e.getClass().getName();
		AjaxResult ajaxResult = new AjaxResult(HttpStatus.SC_LOGIN_ERROR, "系统出现点问题，请稍后再试！");
		if (IncorrectCredentialsException.class.getName().equals(className)
				|| UnknownAccountException.class.getName().equals(className)) {
			ajaxResult = new AjaxResult(HttpStatus.SC_LOGIN_ERROR,
					isWechatLogin(request) ? "身份验证不符合！" : "用户或密码错误, 请重试.");
		} else if (StringUtils.isNotBlank(e.getMessage()) && StringUtils.isJson(e.getMessage(), AjaxResult.class)) {
			ajaxResult = JSON.parseObject(e.getMessage(), AjaxResult.class);
		} else {
			Logs.error("系统出现问题：" + Logs.toLog(e));
		}
		request.setAttribute(getFailureKeyAttribute(), className);
		request.setAttribute(getMessageParam(), ajaxResult);
		return Boolean.TRUE;
	}

	/**
	 * 认证成功跳转
	 */
	@Override
	protected void issueSuccessRedirect(ServletRequest request, ServletResponse response) throws Exception {
		if (isWechatLogin(request)) {
			// 是微信客户端登录，直接回写cookie
			renderCookie(response);
			return;
		}
		WebUtils.issueRedirect(request, response, getSuccessUrl(), null, Boolean.TRUE);
	}

	/**
	 * 
	 * @Title：renderCookie
	 * @Description: TODO(回写cookie) @see：
	 * @param response
	 */
	private void renderCookie(ServletResponse response) {
		if (response != null) {
			HttpServletResponse httpServletResponse = WebUtils.toHttp(response);
			String cookie = StringUtils.EMPTY;
			if (StringUtils.isNotBlank(httpServletResponse.getHeader(WebUtils.SET_COOKIE))) {
				String[] cookieStrs = httpServletResponse.getHeader(WebUtils.SET_COOKIE)
						.split(String.valueOf(StringUtils.SEPARATOR_SECOND));
				for (String cookieStr : cookieStrs) {
					if (cookieStr.startsWith(WebUtils.COOKIE_KEY)) {
						cookie = cookieStr;
						break;
					}
				}
			}
			try {
				response.reset();
				if (StringUtils.isNotBlank(cookie)) {
					httpServletResponse.setHeader(WebUtils.SET_COOKIE, cookie);
				}
				response.setContentType(MediaType.APPLICATION_JSON);
				response.setCharacterEncoding(WebUtils.UTF_ENCODING);
				response.getWriter().print(JsonMapper
						.toJsonString(new AjaxResult(HttpStatus.SC_SUCCESS, "登录成功", UserUtils.getWechatUser())));
			} catch (Exception e) {
				Logs.error("微信回写cookie异常：" + e.getMessage());
			}
		}
	}

}
