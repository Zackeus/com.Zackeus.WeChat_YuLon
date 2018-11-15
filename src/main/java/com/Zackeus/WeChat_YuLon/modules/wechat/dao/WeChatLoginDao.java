package com.Zackeus.WeChat_YuLon.modules.wechat.dao;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.OrderDetail;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatRegister;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;


/**
 * 
 * @Title:WeChatDao
 * @Description:TODO(微信Dao接口)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年11月9日 下午1:59:21
 */
@MyBatisDao
public interface WeChatLoginDao extends CrudDao<WeChatUser> {
	
	public WeChatUser getByOpenId(WeChatUser weChatUser);
	
	public List<OrderDetail> getOrderDetails(WeChatRegister weChatRegister);
	
	public void insertSimpleOrderDetails(@Param("openId") String openId, @Param("orderDetails") List<OrderDetail> orderDetails);
	
}
