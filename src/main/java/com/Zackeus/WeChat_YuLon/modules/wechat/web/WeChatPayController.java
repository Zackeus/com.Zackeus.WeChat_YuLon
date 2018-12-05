package com.Zackeus.WeChat_YuLon.modules.wechat.web;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.Zackeus.WeChat_YuLon.common.annotation.argumentResolver.XMLRequestBody;
import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.entity.XMLResult;
import com.Zackeus.WeChat_YuLon.common.utils.IdGen;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.WXUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WebUtils;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.common.web.BaseHttpController;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatNotify;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatOrder;
import com.Zackeus.WeChat_YuLon.modules.wechat.service.WeChatPayService;

/**
 * 
 * @Title:WeChatPayController
 * @Description:TODO(微信支付Controller)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月5日 下午2:36:37
 */
@Controller
@RequestMapping("/wechat/pay")
public class WeChatPayController extends BaseHttpController {
	
	@Autowired
	WeChatPayService weChatPayService;
	
	/**
	 * 
	 * @Title：onlineRepay
	 * @Description: TODO(逾期还款) 
	 * @see：
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequiresPermissions("wechatUser")
	@RequestMapping(value = "/overdueRepay", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.POST)
	public void overdueRepay(HttpServletRequest request, HttpServletResponse response) throws Exception {
		WeChatOrder weChatOrder = new WeChatOrder();

		weChatOrder.setTotalFee(1);

		weChatOrder.setOpenId(UserUtils.getPrincipal().getOpenId());

		weChatOrder.setOutTradeNo(IdGen.getOrder("OR"));
		weChatOrder.setNonceStr(IdGen.randomBase62(32));
		weChatOrder.setSpbillCreateIp(WebUtils.getIpAddress(request));
		weChatOrder.setBody("测试商品名称");

		Map<String, String> resMap = weChatPayService.overdueRepay(weChatOrder);
		renderJson(response, new AjaxResult(HttpStatus.SC_SUCCESS, "下单成功", resMap));
	}

	/**
	 * 
	 * @Title：wxNotify
	 * @Description: TODO(微信支付结果通知) 
	 * @see：
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value = "/wxNotify", consumes = MediaType.TEXT_XML_VALUE, produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.POST)
	public void wxNotify(@XMLRequestBody WeChatNotify notity, HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		Logs.info("接收数据：" + notity);
		renderXML(response, new XMLResult(WXUtils.SUCCESS_CODE, WXUtils.OK_CODE).toCommonString());
	}

}
