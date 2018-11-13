package com.Zackeus.WeChat_YuLon.modules.sys.dao;

import java.util.List;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.Office;

/**
 * 
 * @Title:OfficeDao
 * @Description:TODO(机构DAO接口)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月17日 上午11:07:43
 */
@MyBatisDao
public interface OfficeDao extends CrudDao<Office> {
	
	public List<Office> getAllOffuceList(Office office);

}
