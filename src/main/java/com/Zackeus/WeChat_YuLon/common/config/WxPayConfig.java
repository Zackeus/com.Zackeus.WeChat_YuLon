package com.Zackeus.WeChat_YuLon.common.config;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * 
 * @Title:WxPayConfig
 * @Description:TODO(微信支付配置类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年11月20日 上午10:50:24
 */
@Configuration
public class WxPayConfig {
	
	@Value("${wxPayConfig.mch_id}")
	private String mch_id; 			// 微信支付分配的商户号
	
	@Value("${wxPayConfig.key}")
	private String key; 			// 微信商户支付秘钥
	
	@Value("${wxPayConfig.notify_url}")
	private String notify_url; 		// 异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数
	
	@Value("${wxPayConfig.trade_type}")
	private String trade_type; 		// 支付方式：JSAP
	
	@Value("${wxPayConfig.pay_url}")
	private String pay_url;         // 统一下单接口地址

	public String getMch_id() {
		return mch_id;
	}

	public String getKey() {
		return key;
	}

	public String getNotify_url() {
		return notify_url;
	}

	public String getTrade_type() {
		return trade_type;
	}
	
	public String getPay_url() {
		return pay_url;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
