package com.Zackeus.WeChat_YuLon.modules.wechat.web;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.Zackeus.WeChat_YuLon.common.config.WxPayConfig;
import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.utils.IdGen;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.WXUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WebUtils;
import com.Zackeus.WeChat_YuLon.common.utils.XmlUtil;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.common.web.BaseHttpController;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;
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
	
	@Autowired
	private WxPayConfig wxPayConfig;

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

	/**
	 * 
	 * @Title：onlineRepay
	 * @Description: TODO(线上还款) @see：
	 * @param request
	 * 
	 * 
	 * 
	 * @param response
	 * @throws Exception 
	 */
	@RequiresPermissions("wechatUser")
	@RequestMapping(value = "/onlineRepay", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.POST)
	public void onlineRepay(HttpServletRequest request, HttpServletResponse response) throws Exception {
		WeChatOrder weChatOrder = new WeChatOrder();
		
		weChatOrder.setTotalFee(1);
		
		weChatOrder.setOpenId(UserUtils.getPrincipal().getOpenId());;
		weChatOrder.setOutTradeNo(IdGen.getOrder("OR"));
		weChatOrder.setNonceStr(IdGen.randomBase62(32));
		weChatOrder.setSpbillCreateIp(WebUtils.getIpAddress(request));
		weChatOrder.setBody("测试商品名称");
		
		Map<String, String> resMap = orderService.unifiedOrder(weChatOrder);
		renderString(response, new AjaxResult(HttpStatus.SC_SUCCESS, "下单成功", resMap));
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
    public void wxNotify(HttpServletRequest request, HttpServletResponse response) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader((ServletInputStream)request.getInputStream()));
        String line = null;
        StringBuilder sb = new StringBuilder();
        while((line = br.readLine()) != null){
            sb.append(line);
        }
        
        br.close();
        //sb为微信返回的xml
        String notityXml = sb.toString();
        String resXml = "";
        
        Logs.info("接收到的报文：" + notityXml);
 
        Map<String, String> map = XmlUtil.xmlToMap(notityXml);
 
        String returnCode = (String) map.get("return_code");
        if("SUCCESS".equals(returnCode)) {
            //验证签名是否正确
            Map<String, String> validParams = WXUtils.paraFilter(map);  //回调验签时需要去除sign和空值参数
            String validStr = WXUtils.createLinkString(validParams);	//把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
            String sign = WXUtils.sign(validStr, wxPayConfig.getKey());	//拼装生成服务器端验证的签名
            //根据微信官网的介绍，此处不仅对回调的参数进行验签，还需要对返回的金额与系统订单的金额进行比对等
            if(sign.equals(map.get("sign"))){
                /**此处添加自己的业务逻辑代码start**/
            	Logs.info("验证成功");
                /**此处添加自己的业务逻辑代码end**/
                //通知微信服务器已经支付成功
                resXml = "<xml>" 
                		+ "<return_code><![CDATA[SUCCESS]]></return_code>"
                        + "<return_msg><![CDATA[OK]]></return_msg>" 
                		+ "</xml> ";
            }
        }else{
        	Logs.info("验证失败");
            resXml = "<xml>" 
            		+ "<return_code><![CDATA[FAIL]]></return_code>"
                    + "<return_msg><![CDATA[报文为空]]></return_msg>" 
            		+ "</xml> ";
        }
        
        Logs.info(resXml);
        Logs.info("微信支付回调数据结束");
 
        BufferedOutputStream out = new BufferedOutputStream(
                response.getOutputStream());
        out.write(resXml.getBytes());
        out.flush();
        out.close();
    }

}
