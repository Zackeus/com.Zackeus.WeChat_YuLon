package com.Zackeus.WeChat_YuLon.modules.wechat.config;

import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;

/**
 * 
 * @Title:WxPay
 * @Description:TODO(微信支付关键字)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月3日 下午6:22:26
 */
public enum WxPay {
	
	DEFAULT("underfind", "underfind"),
	OUT_TRADE_NO("out_trade_no", "outTradeNo"),				// 商户订单号
	APP_ID("appid","appId"),								// 小程序ID
	MCH_ID("mch_id", "mchId"),								// 商户号
	OPEN_ID("openid", "openId"),							// 用户标识
	TOTAL_FEE("total_fee", "totalFee"),						// 标价金额
	TRADE_TYPE("trade_type", "tradeType"),					// 交易类型
	BODY("body", "body"),									// 商品描述
	NONCE_STR("nonce_str", "nonceStr"),						// 随机字符串
	SPBILL_CREATE_IP("spbill_create_ip", "spbillCreateIp"),	// 终端IP
	NOTIFY_URL("notify_url", "notifyUrl"),					// 通知地址
	SIGN("sign", "sign"),									// 签名
	SIGN_TYPE("sign_type", "signType");						// 签名类型	
	
	String wxKey; 		// 微信关键字
	String entityKey;	// 实体关键字
	
	WxPay(String wxKey, String entityKey) {
		this.wxKey = wxKey;
		this.entityKey = entityKey;
	}
	
	public String getWxKey() {
		return wxKey;
	}

	public String getEntityKey() {
		return entityKey;
	}
	
	/**
	 * 
	 * @Title：getByWxKey
	 * @Description: TODO(根据微信关键字查找)
	 * @see：
	 * @param wxKey
	 * @return
	 */
	public static WxPay getByWxKey(String wxKey) {
		for (WxPay wxPay : values()) {
			if (StringUtils.equals(wxKey, wxPay.wxKey))
				return wxPay;
		}
		return DEFAULT;
	}
	
	/**
	 * 
	 * @Title：getByEntityKey
	 * @Description: TODO(根据实体关键字查找)
	 * @see：
	 * @param entityKey
	 * @return
	 */
	public static WxPay getByEntityKey(String entityKey) {
		for (WxPay wxPay : values()) {
			if (StringUtils.equals(entityKey, wxPay.entityKey))
				return wxPay;
		}
		return DEFAULT;
	}

}
