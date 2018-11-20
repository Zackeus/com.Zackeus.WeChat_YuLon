package com.Zackeus.WeChat_YuLon.modules.wechat.web;

import java.util.HashMap;
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

import com.Zackeus.WeChat_YuLon.common.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.common.config.WxPayConfig;
import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.entity.HttpClientResult;
import com.Zackeus.WeChat_YuLon.common.utils.IdGen;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.WXUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WebUtils;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpClientUtil;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.common.web.BaseHttpController;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;
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
	WeChatConfig weChatConfig;

	@Autowired
	WxPayConfig wxPayConfig;
	
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
		//生成的随机字符串
		String nonce_str = IdGen.randomBase62(32);
		//商品名称
		String body = "测试商品名称";
		//获取客户端的ip地址
		String spbill_create_ip = WebUtils.getIpAddress(request);
		
		//组装参数，用户生成统一下单接口的签名
		Map<String, String> packageParams = new HashMap<String, String>();
		packageParams.put("appid", weChatConfig.getAppId());
		packageParams.put("mch_id", wxPayConfig.getMch_id());
		packageParams.put("nonce_str", nonce_str);
		packageParams.put("body", body);
		packageParams.put("out_trade_no", "123456789");//商户订单号
		packageParams.put("total_fee", "1");//支付金额，这边需要转成字符串类型，否则后面的签名会失败
		packageParams.put("spbill_create_ip", spbill_create_ip);
		packageParams.put("notify_url", wxPayConfig.getNotify_url());//支付成功后的回调地址
		packageParams.put("trade_type", wxPayConfig.getTrade_type());//支付方式
		packageParams.put("openid", UserUtils.getPrincipal().getOpenId());
		   
        String prestr = WXUtils.createLinkString(packageParams); // 把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串 
        
        Logs.info("字符拼接：" + prestr);
	        
        //MD5运算生成签名，这里是第一次签名，用于调用统一下单接口
        String mysign = WXUtils.sign(prestr, wxPayConfig.getKey());
        
        Logs.info("第一次签名：" + mysign);
	        
        //拼接统一下单接口使用的xml数据，要将上一步生成的签名一起拼接进去
        String xml = "<xml>" + "<appid>" + weChatConfig.getAppId() + "</appid>" 
                + "<body><![CDATA[" + body + "]]></body>" 
                + "<mch_id>" + wxPayConfig.getMch_id() + "</mch_id>" 
                + "<nonce_str>" + nonce_str + "</nonce_str>" 
                + "<notify_url>" + wxPayConfig.getNotify_url() + "</notify_url>" 
                + "<openid>" + UserUtils.getPrincipal().getOpenId() + "</openid>" 
                + "<out_trade_no>" + "123456789" + "</out_trade_no>" 
                + "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>" 
                + "<total_fee>" + "1" + "</total_fee>"
                + "<trade_type>" + wxPayConfig.getTrade_type() + "</trade_type>" 
                + "<sign>" + mysign + "</sign>"
                + "</xml>";
        Logs.info("请求XML数据：" + xml);
 
        //调用统一下单接口，并接受返回的结果
        HttpClientResult result = HttpClientUtil.doPostXml(wxPayConfig.getPay_url(), xml);
        
        Logs.info("返回XML数据: " + result);
        
//	        
//	        // 将解析结果存储在HashMap中   
//	        Map map = PayUtil.doXMLParse(result);
//	        
//	        String return_code = (String) map.get("return_code");//返回状态码
//	        
//		    Map<String, Object> response = new HashMap<String, Object>();//返回给小程序端需要的参数
//	        if(return_code.equals("SUCCESS")){   
//	            String prepay_id = (String) map.get("prepay_id");//返回的预付单信息   
//	            response.put("nonceStr", nonce_str);
//	            response.put("package", "prepay_id=" + prepay_id);
//	            Long timeStamp = System.currentTimeMillis() / 1000;   
//	            response.put("timeStamp", timeStamp + "");//这边要将返回的时间戳转化成字符串，不然小程序端调用wx.requestPayment方法会报签名错误
//	            //拼接签名需要的参数
//	            String stringSignTemp = "appId=" + WxPayConfig.appid + "&nonceStr=" + nonce_str + "&package=prepay_id=" + prepay_id+ "&signType=MD5&timeStamp=" + timeStamp;   
//	            //再次签名，这个签名用于小程序端调用wx.requesetPayment方法
//	            String paySign = PayUtil.sign(stringSignTemp, WxPayConfig.key, "utf-8").toUpperCase();
//	            
//	            response.put("paySign", paySign);
//	        }
//			
//	        response.put("appid", WxPayConfig.appid);
//			
//	        return response;
//		}catch(Exception e){
//			e.printStackTrace();
//		}
//		return null;
		renderString(response, new AjaxResult(HttpStatus.SC_SUCCESS, "查询成功"));
	}

}
