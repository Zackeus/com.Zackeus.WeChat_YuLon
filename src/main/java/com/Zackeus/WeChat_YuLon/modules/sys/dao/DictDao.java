package com.Zackeus.WeChat_YuLon.modules.sys.dao;

import java.util.List;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.Dict;

/**
 * 
 * @Title:DictDao
 * @Description:TODO(字典DAO接口)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月22日 下午3:06:11
 */
@MyBatisDao
public interface DictDao extends CrudDao<Dict> {
	
	public String getDictLabel(Dict dict);
	
	public List<String> findTypeList();
	
	public List<Dict> findListByType(String type);

}
