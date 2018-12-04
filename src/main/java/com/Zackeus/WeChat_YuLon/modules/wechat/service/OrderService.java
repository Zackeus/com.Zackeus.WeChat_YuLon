package com.Zackeus.WeChat_YuLon.modules.wechat.service;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Zackeus.WeChat_YuLon.common.service.CrudService;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.WXUtils;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WxPayConfig;
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
	 * @Description: TODO(逾期还款下单)
	 * @see：
	 * @param out_trade_no 商户订单号
	 * @param nonce_str 生成的随机字符串
	 * @param ip 用户ip
	 * @param body 商品名称
	 * @return
	 * @throws Exception
	 */
	public Map<String, String> repayOrder(WeChatOrder weChatOrder) throws Exception {
        return WXUtils.orderPay(weChatOrder, weChatConfig, wxPayConfig);
	}

}
