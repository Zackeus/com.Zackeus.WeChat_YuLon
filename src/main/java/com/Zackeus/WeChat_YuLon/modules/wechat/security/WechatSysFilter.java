package com.Zackeus.WeChat_YuLon.modules.wechat.security;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import com.Zackeus.WeChat_YuLon.common.security.BaseFilter;
import com.Zackeus.WeChat_YuLon.common.utils.AssertUtil;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WebUtils;
import com.Zackeus.WeChat_YuLon.common.utils.exception.MyException;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.modules.sys.security.LoginAuthenticationFilter;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;

/**
 * 
 * @Title:HttpAgentFilter
 * @Description:TODO(微信注册拦截器)
 * @Company:
 * @author zhou.zhang
 * @date 2018年9月28日 下午2:02:06
 */
public class WechatSysFilter extends BaseFilter {

	@Override
	protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {
		HttpServletRequest httpServletRequest = WebUtils.toHttp(request);

		AssertUtil.isTrue(WebUtils.isHeadTrue(request, LoginAuthenticationFilter.DEFAULT_WECHAT_PARAM),
				HttpStatus.SC_METHOD_NOT_ALLOWED, "不支持的微信请求方法");

		// session为空，没进行身份核实
		AssertUtil.isTrue(StringUtils.isNotBlank(WebUtils.toHttp(request).getSession().getId()),
				HttpStatus.WE_CHAT_REGISTERED_FAIL, "请先核实身份信息.");

		WeChatUser weChatUser = (WeChatUser) httpServletRequest.getSession().getAttribute(WeChatConfig.WE_CHAT_USER);
		if (ObjectUtils.isEmpty(weChatUser) || ObjectUtils.isEmpty(weChatUser.getWeChatRegister())
				|| StringUtils.isBlank(weChatUser.getWeChatRegister().getPhoneNum())) {
			throw new MyException(HttpStatus.WE_CHAT_REGISTERED_FAIL, "注冊信息已失效，请重新核实身份信息.");
		}
		return Boolean.TRUE;
	}

}
