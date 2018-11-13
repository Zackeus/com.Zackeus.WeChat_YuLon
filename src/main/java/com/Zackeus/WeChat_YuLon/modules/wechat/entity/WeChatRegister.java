package com.Zackeus.WeChat_YuLon.modules.wechat.entity;

import java.io.Serializable;
import java.util.List;

import javax.validation.GroupSequence;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.hibernate.validator.constraints.NotBlank;

import com.Zackeus.WeChat_YuLon.common.annotation.jsonSerializer.SensitiveInfo;
import com.Zackeus.WeChat_YuLon.common.annotation.jsonSerializer.SensitiveType;
import com.Zackeus.WeChat_YuLon.common.annotation.validator.IdCard;
import com.Zackeus.WeChat_YuLon.common.annotation.validator.PhoneNum;
import com.Zackeus.WeChat_YuLon.common.annotation.validator.SMSCode;
import com.Zackeus.WeChat_YuLon.common.service.valid.First;
import com.Zackeus.WeChat_YuLon.common.service.valid.Register;
import com.Zackeus.WeChat_YuLon.common.service.valid.Second;
import com.Zackeus.WeChat_YuLon.common.service.valid.Third;

/**
 * 
 * @Title:WeChatRegister
 * @Description:TODO(微信注册信息(真实身份信息))
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月9日 上午9:58:27
 */
@GroupSequence({WeChatRegister.class, First.class, Second.class, Third.class})
public class WeChatRegister implements Serializable {

	private static final long serialVersionUID = 1L;

	@SensitiveInfo(SensitiveType.OPEN_ID)
	private String openId; 						// 微信用户唯一标识
	
	@NotBlank(message = "{weChatRegister.name.NotBlank}")
	private String name; 						// 用户姓名
	
	@SensitiveInfo(SensitiveType.ID_CARD)
	@IdCard
	private String idCard; 						// 用户身份证号
	
	@SensitiveInfo(SensitiveType.MOBILE_PHONE)
	@PhoneNum
	private String phoneNum; 					// 用户手机号
	
	private List<String> externalContractNbrs; 	// 用户绑定的合同号
	
	@NotBlank(message = "{weChatRegister.registerData.NotBlank}")
	private String code; 						// 微信用户登录凭证
	
	@NotBlank(message = "{weChatRegister.registerData.NotBlank}")
	private String encryptedData; 				// 包括敏感数据在内的完整用户信息的加密数据
	
	@NotBlank(message = "{weChatRegister.registerData.NotBlank}")
	private String iv; 							// 加密算法的初始向量
	
	@SMSCode(groups = {Register.class})
	private String smsCode;						// 短信验证码
	
	private long smsTime;						// 验证码创建时间戳

	public WeChatRegister() {
		super();
	}
	
	public String getSmsCode() {
		return smsCode;
	}

	public void setSmsCode(String smsCode) {
		this.smsCode = smsCode;
	}

	public long getSmsTime() {
		return smsTime;
	}

	public void setSmsTime(long smsTime) {
		this.smsTime = smsTime;
	}

	public String getOpenId() {
		return openId;
	}

	public void setOpenId(String openId) {
		this.openId = openId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getIdCard() {
		return idCard;
	}

	public void setIdCard(String idCard) {
		this.idCard = idCard;
	}

	public String getPhoneNum() {
		return phoneNum;
	}

	public void setPhoneNum(String phoneNum) {
		this.phoneNum = phoneNum;
	}

	public List<String> getExternalContractNbrs() {
		return externalContractNbrs;
	}

	public void setExternalContractNbrs(List<String> externalContractNbrs) {
		this.externalContractNbrs = externalContractNbrs;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getEncryptedData() {
		return encryptedData;
	}

	public void setEncryptedData(String encryptedData) {
		this.encryptedData = encryptedData;
	}

	public String getIv() {
		return iv;
	}

	public void setIv(String iv) {
		this.iv = iv;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
