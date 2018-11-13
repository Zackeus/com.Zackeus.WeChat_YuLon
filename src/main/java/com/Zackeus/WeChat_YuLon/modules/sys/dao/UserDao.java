package com.Zackeus.WeChat_YuLon.modules.sys.dao;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.User;

/**
 * 
 * @Title:UserDao
 * @Description:TODO(用户DAO接口)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月13日 下午4:14:30
 */
@MyBatisDao
public interface UserDao extends CrudDao<User> {
	
	public User getByLoginName(User user);
	
}
