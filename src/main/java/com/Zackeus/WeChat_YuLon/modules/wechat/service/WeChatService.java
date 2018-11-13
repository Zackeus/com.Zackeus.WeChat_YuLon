package com.Zackeus.WeChat_YuLon.modules.wechat.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.Zackeus.WeChat_YuLon.common.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.common.service.CrudService;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpClientUtil;
import com.Zackeus.WeChat_YuLon.modules.wechat.dao.WeChatDao;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatRegister;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

/**
 * 
 * @Title:WeChatService
 * @Description:TODO(微信Service)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年11月7日 下午3:04:31
 */
@Service("wechatService")
public class WeChatService extends CrudService<WeChatDao, WeChatUser> {
	
	@Autowired
	private WeChatConfig weChatConfig;
	
	private String OPENID_KEY = "openid";
	private String SESSION_KEY = "session_key";
	
	/**
	 * 
	 * @Title：code2Session
	 * @Description: TODO(登录凭证校验)
	 * @see：
	 * @param code
	 * @return
	 */
	public WeChatUser code2Session(String code) {
		WeChatUser weChatUser = new WeChatUser();
		try {
			JSONObject jsonObject = JSON.parseObject(HttpClientUtil.doGet((weChatConfig.code2SessionUrl(code))).getContent());
			weChatUser.setOpenId(jsonObject.getString(OPENID_KEY));
			weChatUser.setSessionkey(jsonObject.getString(SESSION_KEY));
			return weChatUser;
		} catch (Exception e) {
			Logs.error("微信登录凭证校验异常：" + Logs.toLog(e));
			return null;
		}
	}
	
	/**
	 * 
	 * @Title：getByOpenId
	 * @Description: TODO(根据openId获取用户信息)
	 * @see：
	 * @param weChatUser
	 * @return
	 */
	@Cacheable(value = { "wechatUserCache" }, keyGenerator = "cacheKeyGenerator")
	public WeChatUser getByOpenId(WeChatUser weChatUser) {
		return dao.getByOpenId(weChatUser);
	}
	
	/**
	 * 
	 * @Title：getExternalContractNbrs
	 * @Description: TODO(查询符合核实身份信息的合同号)
	 * @see：
	 * @param weChatUser
	 * @return
	 */
	public List<String> getExternalContractNbrs(WeChatRegister weChatRegister) {
		return dao.getExternalContractNbrs(weChatRegister);
	}
	

	/**
	 * 
	 * @Title：registerWechatUser
	 * @Description: TODO(注册微信用户信息)
	 * @see：
	 * @param weChatUser
	 */
	@CacheEvict(value = { "wechatUserCache" }, allEntries = true, beforeInvocation = true)
	public void registerWechatUser(WeChatUser weChatUser) {
		weChatUser.setIsNewRecord(Boolean.TRUE);
		save(weChatUser);
		if (ObjectUtils.isNotEmpty(weChatUser.getWeChatRegister().getExternalContractNbrs()))
			dao.insertContractNbrs(weChatUser.getOpenId(), weChatUser.getWeChatRegister().getExternalContractNbrs());
	}

}
