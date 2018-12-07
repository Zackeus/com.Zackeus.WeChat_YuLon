package com.Zackeus.WeChat_YuLon.modules.wechat.dao;

import org.apache.ibatis.annotations.Param;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatNotify;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatOrder;

/**
 * 
 * @Title:WeChatPayDao
 * @Description:TODO(微信支付Dao)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月5日 下午2:38:31
 */
@MyBatisDao
public interface WeChatPayDao extends CrudDao<WeChatOrder> {
	
	int insertNotify(@Param("weChatNotify") WeChatNotify weChatNotify);
	
	WeChatNotify getNotifyByTransactionId(String transactionId);

}
