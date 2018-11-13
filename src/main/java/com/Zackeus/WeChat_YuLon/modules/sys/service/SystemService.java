package com.Zackeus.WeChat_YuLon.modules.sys.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Zackeus.WeChat_YuLon.common.service.BaseService;
import com.Zackeus.WeChat_YuLon.common.utils.Digests;
import com.Zackeus.WeChat_YuLon.common.utils.Encodes;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.User;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;

/**
 * 
 * @Title:SystemService
 * @Description:TODO(系统管理，安全相关实体的管理类,包括用户、角色、菜单.)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月11日 下午1:28:21
 */
@Service
@Transactional(readOnly = true)
public class SystemService extends BaseService {
	
	public static final String HASH_ALGORITHM = "SHA-1";
	public static final int HASH_INTERATIONS = 1024;
	public static final int SALT_SIZE = 8;
	
	/**
	 * 
	 * @Title：getUserById
	 * @Description: TODO(根据用户id获取用户)
	 * @see：
	 * @param id
	 * @return
	 */
	public User getUserById(String id) {
		return UserUtils.get(id);
	}
	
	/**
	 * 
	 * @Title：getUserByLoginName
	 * @Description: TODO(根据登录名获取用户)
	 * @see：
	 * @param loginName
	 * @return
	 */
	public User getUserByLoginName(String loginName) {
		return UserUtils.getByLoginName(loginName);
	}
	
	/**
	 * 
	 * @Title：getUserByOpenId
	 * @Description: TODO(根据微信OpenId获取用户)
	 * @see：
	 * @return
	 */
	public WeChatUser getWeChatUserByOpenId(String openId) {
		return UserUtils.getWeChatUserByOpenId(openId);
	}
	
	/**
	 * 
	 * @Title：entryptPassword
	 * @Description: TODO(生成安全的密码，生成随机的16位salt并经过1024次 sha-1 hash)
	 * @see：
	 * @param plainPassword
	 * @return
	 */
	public static String entryptPassword(String plainPassword) {
		String plain = Encodes.unescapeHtml(plainPassword);
		byte[] salt = Digests.generateSalt(SALT_SIZE);
		byte[] hashPassword = Digests.sha1(plain.getBytes(), salt, HASH_INTERATIONS);
		return Encodes.encodeHex(salt) + Encodes.encodeHex(hashPassword);
	}
	
	/**
	 * 
	 * @Title：validatePassword
	 * @Description: TODO(验证密码)
	 * @see：
	 * @param plainPassword 明文密码
	 * @param password 密文密码
	 * @return
	 */
	public static boolean validatePassword(String plainPassword, String password) {
		String plain = Encodes.unescapeHtml(plainPassword);
		byte[] salt = Encodes.decodeHex(password.substring(0,16));
		byte[] hashPassword = Digests.sha1(plain.getBytes(), salt, HASH_INTERATIONS);
		return password.equals(Encodes.encodeHex(salt) + Encodes.encodeHex(hashPassword));
	}
	
}
