package com.Zackeus.WeChat_YuLon.modules.wechat.entity;

import com.Zackeus.WeChat_YuLon.common.entity.DataEntity;

/**
 * 
 * @Title:WeChatOrder
 * @Description:TODO(微信支付订单)
 * @Company:
 * @author zhou.zhang
 * @date 2018年12月3日 下午7:01:35
 */
public class WeChatOrder extends DataEntity<WeChatOrder> {

	private static final long serialVersionUID = 1L;

	private String outTradeNo;		// 商户订单号
	private String appId;			// 小程序ID
	private String mchId;			// 商户号
	private String openId;			// 用户标识
	private Integer totalFee;		// 标价金额(单位：分)
	private String tradeType;		// 交易类型
	private String body;			// 商品描述
	private String nonceStr;		// 随机字符串
	private String spbillCreateIp;	// 终端IP
	private String notifyUrl;		// 通知地址
	private String sign;			// 签名
	private String signType;		// 签名类型

	public WeChatOrder() {
		super();
	}

	public WeChatOrder(String id) {
		super(id);
	}

	public WeChatOrder(String outTradeNo, String appId, String mchId, String openId, Integer totalFee, String tradeType,
			String body, String nonceStr, String spbillCreateIp, String notifyUrl, String sign, String signType) {
		super();
		this.outTradeNo = outTradeNo;
		this.appId = appId;
		this.mchId = mchId;
		this.openId = openId;
		this.totalFee = totalFee;
		this.tradeType = tradeType;
		this.body = body;
		this.nonceStr = nonceStr;
		this.spbillCreateIp = spbillCreateIp;
		this.notifyUrl = notifyUrl;
		this.sign = sign;
		this.signType = signType;
	}

	public String getOutTradeNo() {
		return outTradeNo;
	}

	public void setOutTradeNo(String outTradeNo) {
		this.outTradeNo = outTradeNo;
	}

	public String getAppId() {
		return appId;
	}

	public void setAppId(String appId) {
		this.appId = appId;
	}

	public String getMchId() {
		return mchId;
	}

	public void setMchId(String mchId) {
		this.mchId = mchId;
	}

	public String getOpenId() {
		return openId;
	}

	public void setOpenId(String openId) {
		this.openId = openId;
	}

	public Integer getTotalFee() {
		return totalFee;
	}

	public void setTotalFee(Integer totalFee) {
		this.totalFee = totalFee;
	}

	public String getTradeType() {
		return tradeType;
	}

	public void setTradeType(String tradeType) {
		this.tradeType = tradeType;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}

	public String getNonceStr() {
		return nonceStr;
	}

	public void setNonceStr(String nonceStr) {
		this.nonceStr = nonceStr;
	}

	public String getSpbillCreateIp() {
		return spbillCreateIp;
	}

	public void setSpbillCreateIp(String spbillCreateIp) {
		this.spbillCreateIp = spbillCreateIp;
	}

	public String getNotifyUrl() {
		return notifyUrl;
	}

	public void setNotifyUrl(String notifyUrl) {
		this.notifyUrl = notifyUrl;
	}

	public String getSign() {
		return sign;
	}

	public void setSign(String sign) {
		this.sign = sign;
	}

	public String getSignType() {
		return signType;
	}

	public void setSignType(String signType) {
		this.signType = signType;
	}

}
