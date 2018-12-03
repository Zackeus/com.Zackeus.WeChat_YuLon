package com.Zackeus.WeChat_YuLon.modules.wechat.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Zackeus.WeChat_YuLon.common.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.common.config.WxPayConfig;
import com.Zackeus.WeChat_YuLon.common.entity.HttpClientResult;
import com.Zackeus.WeChat_YuLon.common.service.CrudService;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WXUtils;
import com.Zackeus.WeChat_YuLon.common.utils.XmlUtil;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpClientUtil;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;
import com.Zackeus.WeChat_YuLon.modules.wechat.dao.OrderDao;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.OrderDetail;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.OrderRepayPlan;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatOrder;

/**
 * 
 * @Title:OrderService
 * @Description:TODO(合同service)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年11月14日 上午11:03:54
 */
@Service("orderService")
public class OrderService extends CrudService<OrderDao, OrderDetail> {
	
	@Autowired
	private SqlSessionFactory sqlSessionFactory;
	
	@Autowired
	private WeChatConfig weChatConfig;

	@Autowired
	private WxPayConfig wxPayConfig;
	
	/**
	 * 
	 * @Title：getByPrinciple
	 * @Description: TODO(根据合同号获取当前用户合同详情)
	 * @see：
	 * @param externalContractNbr
	 * @return
	 */
	public OrderDetail getByPrinciple(String externalContractNbr) {
		OrderDetail orderDetail = dao.getByPrinciple(externalContractNbr, UserUtils.getPrincipal().getOpenId());
		if (ObjectUtils.isNotEmpty(orderDetail))
			orderDetail.setOrderRepayPlans(getOrderRepayPlan(externalContractNbr));
		// 计算还款进度
		double schedule = 0;
		for (OrderRepayPlan orderRepayPlan : orderDetail.getOrderRepayPlans()) {
			if (StringUtils.equals("finish", orderRepayPlan.getRepaymentStatus()))
				schedule += 1;
		}
		orderDetail.setRepaymentSchedule((int) (schedule / orderDetail.getOrderRepayPlans().size() * 100));
		return orderDetail;
	}
	
	/**
	 * 
	 * @Title：getOrderRepayPlan
	 * @Description: TODO(获取还款计划)
	 * @see：
	 * @param externalContractNbr
	 * @return
	 */
	public List<OrderRepayPlan> getOrderRepayPlan(String externalContractNbr) {
		String sqlcode = sqlSessionFactory .getConfiguration().getMappedStatement("com.Zackeus.WeChat_YuLon.modules.wechat.dao.OrderDao.getOrderRepayPlan")
				.getBoundSql(null).getSql();
		sqlcode = sqlcode.replace("{externalContractNbr}", externalContractNbr);
		return dao.getOrderRepayPlanParameter(sqlcode);
	}
	
	/**
	 * 
	 * @Title：wechatOrder
	 * @Description: TODO(微信支付统一下单)
	 * @see：
	 * @param out_trade_no 商户订单号
	 * @param nonce_str 生成的随机字符串
	 * @param ip 用户ip
	 * @param body 商品名称
	 * @return
	 * @throws Exception
	 */
	public Map<String, String> unifiedOrder(WeChatOrder weChatOrder) throws Exception {
		Map<String, String> packageParams = WXUtils.createMap(weChatOrder, weChatConfig, wxPayConfig);
		
		String xml = WXUtils.createSignedXml(wxPayConfig, packageParams);
        Logs.info("请求XML数据：" + xml);
 
        //调用统一下单接口，并接受返回的结果
        HttpClientResult result = HttpClientUtil.doPostXml(wxPayConfig.getPay_url(), xml);
        
        Logs.info("返回XML数据: " + result);
	        
        // 将解析结果存储在HashMap中   
        Map<String, String> map = XmlUtil.xmlToMap(result.getContent());
	        
        String return_code = (String) map.get("return_code");//返回状态码
        Logs.info("统一下单状态码：" + return_code);
	    
        //返回给小程序端需要的参数(二次签名)
		Map<String, String> resMap = new HashMap<String, String>();
        if(return_code.equals("SUCCESS")){
        	Long timeStamp = System.currentTimeMillis() / 1000;
            resMap.put("nonceStr", weChatOrder.getNonceStr());			// 随机字符串
            resMap.put("package", "prepay_id=" + map.get("prepay_id")); // 统一下单接口返回的 prepay_id 参数值
            resMap.put("signType", "MD5");								// 签名算法
            resMap.put("timeStamp", String.valueOf(timeStamp));			// 这边要将返回的时间戳转化成字符串，不然小程序端调用wx.requestPayment方法会报签名错误
            //拼接签名需要的参数
//            String stringSignTemp = WXUtils.createLinkString(resMap);
            String stringSignTemp = "appId=" + weChatConfig.getAppId() + "&nonceStr=" + weChatOrder.getNonceStr() + "&package=prepay_id=" + map.get("prepay_id") + "&signType=MD5&timeStamp=" + timeStamp;
            Logs.info("在签名拼接字符：" + stringSignTemp);
            //再次签名，这个签名用于小程序端调用wx.requesetPayment方法
            String paySign = WXUtils.sign(stringSignTemp, wxPayConfig.getKey());
            resMap.put("paySign", paySign);
        }
        
        return resMap;
	}

}
