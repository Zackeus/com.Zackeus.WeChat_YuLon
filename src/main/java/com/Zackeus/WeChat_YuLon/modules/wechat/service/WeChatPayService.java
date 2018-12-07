package com.Zackeus.WeChat_YuLon.modules.wechat.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Zackeus.WeChat_YuLon.common.service.CrudService;
import com.Zackeus.WeChat_YuLon.common.utils.AssertUtil;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.exception.XmlException;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WxPayConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.dao.WeChatPayDao;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatNotify;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatOrder;
import com.Zackeus.WeChat_YuLon.modules.wechat.utils.WXUtils;

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
		weChatOrder.preInsert();
		dao.insert(weChatOrder);
        return WXUtils.orderPay(weChatOrder, weChatConfig, wxPayConfig);
	}
	
	/**
	 * 
	 * @Title：wxNotify
	 * @Description: TODO(微信支付通知，更新订单状态)
	 * @see：
	 * @param weChatNotify
	 */
	public void wxNotify(WeChatNotify weChatNotify) {
		WeChatNotify checkNotify = dao.getNotifyByTransactionId(weChatNotify.getTransactionId());
		// 处理重复订单信息
		AssertUtil.isXmlTrue(ObjectUtils.isEmpty(checkNotify), WXUtils.SUCCESS_CODE, WXUtils.OK_CODE);
		
		WeChatOrder weChatOrder = dao.get(weChatNotify.getOutTradeNo());
		AssertUtil.isXmlTrue(ObjectUtils.isNotEmpty(weChatOrder), WXUtils.FAIL_CODE, "查无此订单");
		// 商户系统对于支付结果通知的内容一定要做签名验证,并校验返回的订单金额是否与商户侧的订单金额一致，防止数据泄漏导致出现“假通知”，造成资金损失
		AssertUtil.isXmlTrue(weChatOrder.getTotalFee() == weChatNotify.getTotalFee(), WXUtils.FAIL_CODE, "订单金额不符合");
		weChatOrder.preUpdate();
		
		switch (weChatNotify.getResultCode()) {
		
		case WXUtils.SUCCESS_CODE:
			// 支付成功
			weChatOrder.setResult(Boolean.TRUE);
			break;

		case WXUtils.FAIL_CODE:
			// 支付失败
			weChatOrder.setResult(Boolean.FALSE);
			break;
			
		default:
			// 无效的业务结果码
			throw new XmlException(WXUtils.FAIL_CODE, "无效的业务结果码");
		}
		// 更新订单状态
		dao.update(weChatOrder);
		dao.insertNotify(weChatNotify);
	}

}
