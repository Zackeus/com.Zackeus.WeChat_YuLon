package com.Zackeus.WeChat_YuLon.modules.wechat.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Zackeus.WeChat_YuLon.common.service.CrudService;
import com.Zackeus.WeChat_YuLon.common.utils.WXUtils;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WxPayConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.dao.WeChatPayDao;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatOrder;

/**
 * 
 * @Title:WeChatPayService
 * @Description:TODO(微信支付Service)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月5日 下午2:43:13
 */
@Service("weChatPayService")
public class WeChatPayService extends CrudService<WeChatPayDao, WeChatOrder> {
	
	@Autowired
	private WeChatConfig weChatConfig;

	@Autowired
	private WxPayConfig wxPayConfig;
	
	/**
	 * 
	 * @Title：wechatOrder
	 * @Description: TODO(逾期还款下单)
	 * @see：
	 * @param out_trade_no 商户订单号
	 * @param nonce_str 生成的随机字符串
	 * @param ip 用户ip
	 * @param body 商品名称
	 * @return
	 * @throws Exception
	 */
	public Map<String, String> overdueRepay(WeChatOrder weChatOrder) throws Exception {
        return WXUtils.orderPay(weChatOrder, weChatConfig, wxPayConfig);
	}

}
