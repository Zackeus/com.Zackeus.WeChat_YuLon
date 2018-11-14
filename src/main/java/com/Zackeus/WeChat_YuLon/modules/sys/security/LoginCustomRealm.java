package com.Zackeus.WeChat_YuLon.modules.sys.security;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.util.ByteSource;
import org.springframework.beans.factory.annotation.Autowired;

import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.entity.UsernamePasswordToken;
import com.Zackeus.WeChat_YuLon.common.utils.AssertUtil;
import com.Zackeus.WeChat_YuLon.common.utils.Encodes;
import com.Zackeus.WeChat_YuLon.common.utils.JsonMapper;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.Principal;
import com.Zackeus.WeChat_YuLon.modules.sys.entity.User;
import com.Zackeus.WeChat_YuLon.modules.sys.service.SystemService;
import com.Zackeus.WeChat_YuLon.modules.sys.utils.UserUtils;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;
import com.Zackeus.WeChat_YuLon.modules.wechat.service.WeChatService;


/**
 * 
 * @Title:CustomRealm
 * @Description:TODO(登录认证校验器)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月10日 上午10:49:28
 */
public class LoginCustomRealm extends AuthorizingRealm {
	
	@Autowired
	SystemService systemService;
	
	@Autowired
	WeChatService weChatService;
	
	 /** 
     * 登陆认证
     */
	@Override  
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) {
    	Logs.info("*************** 登陆认证 ******************");
    	//令牌——基于用户名和密码的令牌,把AuthenticationToken转换成UsernamePasswordToken
    	UsernamePasswordToken token = (UsernamePasswordToken) authenticationToken;
    	if (token.isWechatLogin()) {
    		// 是微信客户端登录，passWord是code
			WeChatUser weChatUser = weChatService.code2Session(String.valueOf(token.getPassword()));
			AssertUtil.isAuthenTrue(ObjectUtils.isNotEmpty(weChatUser), JsonMapper.toJsonString(new AjaxResult(
					HttpStatus.WE_CHAT_CODE_FAIL, "微信登录凭证校验失败, 请重试.")));
			
			weChatUser = systemService.getWeChatUserByOpenId(weChatUser.getOpenId());
			
			AssertUtil.isAuthenTrue(ObjectUtils.isNotEmpty(weChatUser), JsonMapper.toJsonString(new AjaxResult(
					HttpStatus.WE_CHAT_UN_REGISTERED, "账号未注册！")));
			
			// 使用code模拟密码登入
			String password = SystemService.entryptPassword(String.valueOf(token.getPassword()));
        	byte[] salt = Encodes.decodeHex(password.substring(0,16));
        	return new SimpleAuthenticationInfo(new Principal(weChatUser), password.substring(16), ByteSource.Util.bytes(salt), 
        			getName());
		}
    	
    	User user = systemService.getUserByLoginName(token.getUsername());
    	
    	if (!ObjectUtils.isEmpty(user)) {
        	byte[] salt = Encodes.decodeHex(user.getPassword().substring(0,16));
        	return new SimpleAuthenticationInfo(new Principal(user), 
        			user.getPassword().substring(16), ByteSource.Util.bytes(salt), getName());
    	} 
    	return null;
    } 
    
	/**
	 * 获取权限授权信息，如果缓存中存在，则直接从缓存中获取，否则就重新获取， 登录成功后调用
	 */
	protected AuthorizationInfo getAuthorizationInfo(PrincipalCollection principals) {
		return super.getAuthorizationInfo(principals);
	}
    
    /**
     * 获取授权
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
    	Logs.info("获取授权----------------");
    	Principal principal = UserUtils.getPrincipal();
		if (ObjectUtils.isNotEmpty(principal)) {
			SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
			if (StringUtils.isNotBlank(principal.getId()))
				info.addStringPermission("userser");
			if (StringUtils.isNotBlank(principal.getOpenId()))
				info.addStringPermission("wechatUser");
			return info;
		} else {
			return null;
		}
    }
    
	/**
	 * 
	 * @Title：clearCached
	 * @Description: TODO(清除缓存)
	 * @see：
	 */
    public void clearCached() {
        PrincipalCollection principals = SecurityUtils.getSubject().getPrincipals();  
        super.clearCache(principals);  
    }  
}