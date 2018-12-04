package com.Zackeus.WeChat_YuLon.modules.wechat.web;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
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
import com.Zackeus.WeChat_YuLon.modules.wechat.service.OrderService;

/**
 * 
 * @Title:OrderController
 * @Description:TODO(合同Controller)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月14日 上午9:13:36
 */
@Controller
@RequestMapping("/order")
public class OrderController extends BaseHttpController {
	
	@Autowired
	OrderService orderService;
	
	/**
	 * 
	 * @Title：detail
	 * @Description: TODO(合同明细) @see：
	 * @param request
	 * @param response
	 */
	@RequiresPermissions("wechatUser")
	@RequestMapping(value = "/detail/{externalContractNbr}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.GET)
	public void detail(@PathVariable("externalContractNbr") String externalContractNbr, HttpServletRequest request,
			HttpServletResponse response) {
		renderJson(response,
				new AjaxResult(HttpStatus.SC_SUCCESS, "查询成功", orderService.getByPrinciple(externalContractNbr)));
	}

	/**
	 * 
	 * @Title：onlineRepay
	 * @Description: TODO(线上还款) @see：
	 * @param request
	 * @param response
	 * @throws Exception 
	 */
	@RequiresPermissions("wechatUser")
	@RequestMapping(value = "/onlineRepay", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.POST)
	public void onlineRepay(HttpServletRequest request, HttpServletResponse response) throws Exception {
		WeChatOrder weChatOrder = new WeChatOrder();
		
		weChatOrder.setTotalFee(1);
		
		weChatOrder.setOpenId(UserUtils.getPrincipal().getOpenId());
		
		weChatOrder.setOutTradeNo(IdGen.getOrder("OR"));
		weChatOrder.setNonceStr(IdGen.randomBase62(32));
		weChatOrder.setSpbillCreateIp(WebUtils.getIpAddress(request));
		weChatOrder.setBody("测试商品名称");
		
		Map<String, String> resMap = orderService.repayOrder(weChatOrder);
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
    @RequestMapping(value="/wxNotify", consumes = MediaType.TEXT_XML_VALUE, produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.POST)
    public void wxNotify(@XMLRequestBody WeChatNotify notity, HttpServletRequest request, HttpServletResponse response) throws Exception {
    	Logs.info("接收数据：" + notity);
        renderXML(response, new XMLResult(WXUtils.SUCCESS_CODE, WXUtils.OK_CODE).toCommonString());
    }

}
