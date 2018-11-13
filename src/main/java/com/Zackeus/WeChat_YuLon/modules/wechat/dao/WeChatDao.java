package com.Zackeus.WeChat_YuLon.modules.wechat.dao;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.Zackeus.WeChat_YuLon.common.annotation.MyBatisDao;
import com.Zackeus.WeChat_YuLon.common.dao.CrudDao;
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
public interface WeChatDao extends CrudDao<WeChatUser> {
	
	public WeChatUser getByOpenId(WeChatUser weChatUser);
	
	public List<String> getExternalContractNbrs(WeChatRegister weChatRegister);
	
	public void insertContractNbrs(@Param("openId") String openId, @Param("externalContractNbrs") List<String> externalContractNbrs);
	
}
