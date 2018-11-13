package com.Zackeus.WeChat_YuLon.common.annotation.jsonSerializer;

/**
 * 
 * @Title:SensitiveType
 * @Description:TODO(脱敏枚举类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月13日 上午10:32:25
 */
public enum SensitiveType {

	/**
	 * 微信唯一标识
	 */
	OPEN_ID,

	/**
	 * 中文名
	 */
	CHINESE_NAME,

	/**
	 * 身份证号
	 */
	ID_CARD,
	/**
	 * 座机号
	 */
	FIXED_PHONE,
	/**
	 * 手机号
	 */
	MOBILE_PHONE,
	/**
	 * 地址
	 */
	ADDRESS,
	/**
	 * 电子邮件
	 */
	EMAIL,
	/**
	 * 银行卡
	 */
	BANK_CARD,
	/**
	 * 公司开户银行联号
	 */
	CNAPS_CODE

}
