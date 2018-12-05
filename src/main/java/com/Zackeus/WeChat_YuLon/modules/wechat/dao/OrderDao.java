package com.Zackeus.WeChat_YuLon.modules.wechat.dao;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.OrderDetail;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.OrderRepayPlan;

/**
 * 
 * @Title:OrderDao
 * @Description:TODO(合同Dao)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月14日 上午10:59:25
 */
@MyBatisDao
public interface OrderDao extends CrudDao<OrderDetail> {

	OrderDetail getByPrinciple(@Param("externalContractNbr") String externalContractNbr,
			@Param("openId") String openId);
	
	List<OrderRepayPlan> getOrderRepayPlan();
	
	List<OrderRepayPlan> getOrderRepayPlanParameter(String sql);
	
	List<OrderRepayPlan> getOverdueOrderRepay();
	
	List<OrderRepayPlan> getOverdueOrderRepayParameter(String sql);
	
}
