package com.Zackeus.WeChat_YuLon.modules.sys.service;

import org.springframework.stereotype.Service;

import com.Zackeus.WeChat_YuLon.common.service.CrudService;
import com.Zackeus.WeChat_YuLon.modules.sys.dao.UserDao;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.User;

/**
 * 
 * @Title:UserService
 * @Description:TODO(用户Service)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月4日 下午4:06:33
 */
@Service("userService")
public class UserService extends CrudService<UserDao, User> {
	
	/**
	 * 
	 * @Title：getByLoginName
	 * @Description: TODO(根据登录名称查询用户)
	 * @see：
	 * @param user
	 * @return
	 */
	public User getByLoginName(User user) {
		return dao.getByLoginName(user);
	}
	
}
