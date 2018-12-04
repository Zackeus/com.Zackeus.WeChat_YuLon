package com.Zackeus.WeChat_YuLon.modules.wechat.entity;

import java.io.Serializable;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;

/**
 * 
 * @Title:WeChatNotify
 * @Description:TODO(微信支付通知)
 * @Company:
 * @author zhou.zhang
 * @date 2018年12月4日 上午11:48:45
 */
public class WeChatNotify implements Serializable {

	private static final long serialVersionUID = 1L;

	private String transactionId; 			// 微信订单号
	private String outTradeNo; 				// 商户订单号
	private String appId; 					// 小程序ID	
	private String mchId; 					// 商户号
	private String openId; 					// 用户标识
	private Integer totalFee; 				// 订单金额
	private Integer settlementTotalFee; 	// 应结订单金额
	private Integer cashFee; 				// 现金支付金额
	private String feeType; 				// 货币种类
	private String deviceInfo; 				// 设备号	
	private String nonceStr; 				// 随机字符串	
	private String sign; 					// 签名	
	private String signType; 				// 签名类型
	private String isSubscribe; 			// 是否关注公众账号
	private String tradeType; 				// 交易类型
	private String bankType; 				// 付款银行
	private String attach; 					// 商家数据包
	private String timeEnd; 				// 支付完成时间
	private String returnCode;				// 返回状态码
	private String returnMsg;				// 返回信息
	private String resultCode; 				// 业务结果
	private String errCode; 				// 错误代码	
	private String errCodeDes; 				// 错误代码描述

	public WeChatNotify() {
		super();
	}
	
	public WeChatNotify(String transactionId, String outTradeNo, String appId, String mchId, String openId,
			Integer totalFee, Integer settlementTotalFee, Integer cashFee, String feeType, String deviceInfo,
			String nonceStr, String sign, String signType, String isSubscribe, String tradeType, String bankType,
			String attach, String timeEnd, String returnCode, String returnMsg, String resultCode, String errCode,
			String errCodeDes) {
		super();
		this.transactionId = transactionId;
		this.outTradeNo = outTradeNo;
		this.appId = appId;
		this.mchId = mchId;
		this.openId = openId;
		this.totalFee = totalFee;
		this.settlementTotalFee = settlementTotalFee;
		this.cashFee = cashFee;
		this.feeType = feeType;
		this.deviceInfo = deviceInfo;
		this.nonceStr = nonceStr;
		this.sign = sign;
		this.signType = signType;
		this.isSubscribe = isSubscribe;
		this.tradeType = tradeType;
		this.bankType = bankType;
		this.attach = attach;
		this.timeEnd = timeEnd;
		this.returnCode = returnCode;
		this.returnMsg = returnMsg;
		this.resultCode = resultCode;
		this.errCode = errCode;
		this.errCodeDes = errCodeDes;
	}

	public String getTransactionId() {
		return transactionId;
	}

	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
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

	public Integer getSettlementTotalFee() {
		return settlementTotalFee;
	}

	public void setSettlementTotalFee(Integer settlementTotalFee) {
		this.settlementTotalFee = settlementTotalFee;
	}

	public Integer getCashFee() {
		return cashFee;
	}

	public void setCashFee(Integer cashFee) {
		this.cashFee = cashFee;
	}

	public String getFeeType() {
		return feeType;
	}

	public void setFeeType(String feeType) {
		this.feeType = feeType;
	}

	public String getDeviceInfo() {
		return deviceInfo;
	}

	public void setDeviceInfo(String deviceInfo) {
		this.deviceInfo = deviceInfo;
	}

	public String getNonceStr() {
		return nonceStr;
	}

	public void setNonceStr(String nonceStr) {
		this.nonceStr = nonceStr;
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

	public String getIsSubscribe() {
		return isSubscribe;
	}

	public void setIsSubscribe(String isSubscribe) {
		this.isSubscribe = isSubscribe;
	}

	public String getTradeType() {
		return tradeType;
	}

	public void setTradeType(String tradeType) {
		this.tradeType = tradeType;
	}

	public String getBankType() {
		return bankType;
	}

	public void setBankType(String bankType) {
		this.bankType = bankType;
	}

	public String getAttach() {
		return attach;
	}

	public void setAttach(String attach) {
		this.attach = attach;
	}

	public String getTimeEnd() {
		return timeEnd;
	}

	public void setTimeEnd(String timeEnd) {
		this.timeEnd = timeEnd;
	}

	public String getReturnCode() {
		return returnCode;
	}

	public void setReturnCode(String returnCode) {
		this.returnCode = returnCode;
	}

	public String getReturnMsg() {
		return returnMsg;
	}

	public void setReturnMsg(String returnMsg) {
		this.returnMsg = returnMsg;
	}

	public String getResultCode() {
		return resultCode;
	}

	public void setResultCode(String resultCode) {
		this.resultCode = resultCode;
	}

	public String getErrCode() {
		return errCode;
	}

	public void setErrCode(String errCode) {
		this.errCode = errCode;
	}

	public String getErrCodeDes() {
		return errCodeDes;
	}

	public void setErrCodeDes(String errCodeDes) {
		this.errCodeDes = errCodeDes;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
