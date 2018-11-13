package com.Zackeus.WeChat_YuLon.modules.sys.dao;

import java.util.List;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.Menu;

/**
 * 
 * @Title:MenuDao
 * @Description:TODO(菜单DAO接口)
 * @Company:
 * @author zhou.zhang
 * @date 2018年8月14日 上午11:06:55
 */
@MyBatisDao
public interface MenuDao extends CrudDao<Menu> {
	
	public List<Menu> getAllMenuList(Menu menu);
	
	public List<Menu> getMenuListByUser(Menu menu);
	
	public Integer getMaxSortById(String id);
	
}
