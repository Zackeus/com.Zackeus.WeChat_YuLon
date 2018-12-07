package com.Zackeus.WeChat_YuLon.modules.wechat.security;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.Zackeus.WeChat_YuLon.common.entity.XMLResult;
import com.Zackeus.WeChat_YuLon.common.security.BaseFilter;
import com.Zackeus.WeChat_YuLon.common.utils.AssertUtil;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.XmlUtil;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WxPay;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WxPayConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.utils.WXUtils;

/**
 * 
 * @Title:WeChatNotifyFilter
 * @Description:TODO(微信通知拦截器)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月4日 下午1:54:44
 */
public class WeChatNotifyFilter extends BaseFilter {
	
	@Autowired
	WxPayConfig wxPayConfig;
	
	@Override
	protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {
		String xml = IOUtils.toString(request.getInputStream(), request.getCharacterEncoding());
		
		AssertUtil.isTrue(StringUtils.isNotBlank(xml), HttpStatus.SC_BAD_REQUEST, "报文为空");
		Map<String, String> xmlMap = XmlUtil.xmlToMap(xml);
		AssertUtil.isTrue(ObjectUtils.isNotEmpty(xmlMap), HttpStatus.SC_INTERNAL_SERVER_ERROR, "报文解析异常");
		
		String returnCode = (String) xmlMap.get(WxPay.RETURN_CODE.getWxKey());
		AssertUtil.isTrue(StringUtils.isNotBlank(returnCode), HttpStatus.SC_BAD_REQUEST, "报文参数缺失");
		
		String returnSign = (String) xmlMap.get(WxPay.SIGN.getWxKey());
		AssertUtil.isTrue(StringUtils.isNotBlank(returnSign), HttpStatus.SC_BAD_REQUEST, "报文参数缺失");
		if(StringUtils.equals(WXUtils.SUCCESS_CODE, returnCode)) {
			//验证签名是否正确
			Map<String, String> validParams = WXUtils.paraFilter(xmlMap);  //回调验签时需要去除sign和空值参数
			String sign = WXUtils.sign(WXUtils.createLinkString(validParams), wxPayConfig.getKey());
			if(!StringUtils.equals(returnSign, sign)) {
				renderXML(response, new XMLResult(WXUtils.FAIL_CODE, "验证失败").toCommonString());
				return Boolean.FALSE;
			}
		} else {
			renderXML(response, new XMLResult(WXUtils.FAIL_CODE, "通信失败").toCommonString());
			return Boolean.FALSE;
		}
		return Boolean.TRUE;
	}
	
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
			renderXML(response, new XMLResult(WXUtils.FAIL_CODE, exception.getMessage()).toCommonString());
		}
	}
	
}
