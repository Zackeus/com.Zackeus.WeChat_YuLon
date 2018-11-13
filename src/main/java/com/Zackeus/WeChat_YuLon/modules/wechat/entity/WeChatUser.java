package com.Zackeus.WeChat_YuLon.modules.wechat.entity;

import javax.validation.GroupSequence;

import com.Zackeus.WeChat_YuLon.common.annotation.jsonSerializer.SensitiveInfo;
import com.Zackeus.WeChat_YuLon.common.annotation.jsonSerializer.SensitiveType;
import com.Zackeus.WeChat_YuLon.common.entity.DataEntity;
import com.Zackeus.WeChat_YuLon.common.service.valid.First;
import com.Zackeus.WeChat_YuLon.common.service.valid.Second;
import com.Zackeus.WeChat_YuLon.common.service.valid.Third;

/**
 * 
 * @Title:WeChatUser
 * @Description:TODO(微信用户)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月7日 上午11:37:00
 */

@GroupSequence({WeChatRegister.class, First.class, Second.class, Third.class})
public class WeChatUser extends DataEntity<WeChatUser> {

	private static final long serialVersionUID = 1L;

	@SensitiveInfo(SensitiveType.OPEN_ID)
	private String openId;					// 微信用户唯一标识
	private String userId;					// 用户系统唯一标识
	private String unionId;					// 用户在开放平台的唯一标识符
	private String nickName;				// 用户昵称
	private Integer gender;					// 用户性别;0：未知、1：男、2：女
	private String city;					// 用户所在城市
	private String province;				// 用户所在省份
	private String country;					// 用户所在国家
	private String language; 				// 显示 country，province，city 所用的语言;en：英文、zh_CN：简体中文、zh_TW：繁体中文
	private String avatarUrl;				// 用户头像图片的 URL
	private String sessionkey;				// 会话密钥
	private WeChatRegister weChatRegister; 	// 注册信息(真实身份信息)

	public WeChatUser() {
		super();
	}

	public WeChatUser(String openId) {
		super();
		this.openId = openId;
	}

	public WeChatUser(String openId, String userId, String unionId, String nickName, Integer gender, String city,
			String province, String country, String language, String avatarUrl) {
		super();
		this.openId = openId;
		this.userId = userId;
		this.unionId = unionId;
		this.nickName = nickName;
		this.gender = gender;
		this.city = city;
		this.province = province;
		this.country = country;
		this.language = language;
		this.avatarUrl = avatarUrl;
	}

	public String getOpenId() {
		return openId;
	}

	public void setOpenId(String openId) {
		this.openId = openId;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getUnionId() {
		return unionId;
	}

	public void setUnionId(String unionId) {
		this.unionId = unionId;
	}

	public String getNickName() {
		return nickName;
	}

	public void setNickName(String nickName) {
		this.nickName = nickName;
	}

	public Integer getGender() {
		return gender;
	}

	public void setGender(Integer gender) {
		this.gender = gender;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getProvince() {
		return province;
	}

	public void setProvince(String province) {
		this.province = province;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}

	public String getSessionkey() {
		return sessionkey;
	}
	
	public WeChatRegister getWeChatRegister() {
		return weChatRegister;
	}

	public void setWeChatRegister(WeChatRegister weChatRegister) {
		this.weChatRegister = weChatRegister;
	}

	public void setSessionkey(String sessionkey) {
		this.sessionkey = sessionkey;
	}

}
