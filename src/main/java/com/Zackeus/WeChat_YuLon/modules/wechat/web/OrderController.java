package com.Zackeus.WeChat_YuLon.modules.wechat.web;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.common.web.BaseHttpController;
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
		renderString(response,
				new AjaxResult(HttpStatus.SC_SUCCESS, "查询成功", orderService.getByPrinciple(externalContractNbr)));
	}

}
