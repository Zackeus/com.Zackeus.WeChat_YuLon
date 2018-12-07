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

	private String outTradeNo;				// 商户订单号
	private String openId;					// 用户标识
	private Integer totalFee;				// 标价金额(单位：分)
	private String body;					// 商品描述
	private String nonceStr;				// 随机字符串
	private String spbillCreateIp;			// 终端IP
	private OrderRepayPlan overdueContract; // 逾期合同
	private boolean result;					// 支付结果

	public WeChatOrder() {
		super();
	}

	public WeChatOrder(String id) {
		super(id);
	}
	
	public WeChatOrder(String outTradeNo, String openId, Integer totalFee, String body, String nonceStr,
			String spbillCreateIp, OrderRepayPlan overdueContract, boolean result) {
		super();
		this.outTradeNo = outTradeNo;
		this.openId = openId;
		this.totalFee = totalFee;
		this.body = body;
		this.nonceStr = nonceStr;
		this.spbillCreateIp = spbillCreateIp;
		this.overdueContract = overdueContract;
		this.result = result;
	}

	public WeChatOrder (OrderRepayPlan overdueContract) {
		super();
		this.overdueContract = overdueContract;
	}

	public String getOutTradeNo() {
		return outTradeNo;
	}

	public void setOutTradeNo(String outTradeNo) {
		this.outTradeNo = outTradeNo;
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

	public OrderRepayPlan getOverdueContract() {
		return overdueContract;
	}

	public void setOverdueContract(OrderRepayPlan overdueContract) {
		this.overdueContract = overdueContract;
	}

	public boolean isResult() {
		return result;
	}

	public void setResult(boolean result) {
		this.result = result;
	}
	
}
