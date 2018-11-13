package com.Zackeus.WeChat_YuLon.common.utils;

/**
 * 
 * @Title:SensitiveInfoUtils
 * @Description:TODO(脱敏处理util类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月13日 上午10:24:23
 */
public class SensitiveInfoUtils {

	/**
	 * 
	 * @Title：chineseName
	 * @Description: TODO([中文姓名] 只显示第一个汉字，其他隐藏为2个星号<例子：李**>)
	 * @see：
	 * @param fullName
	 * @return
	 */
	public static String chineseName(final String fullName) {
		if (StringUtils.isBlank(fullName))
			return StringUtils.EMPTY;
		final String name = StringUtils.left(fullName, 1);
		return StringUtils.rightPad(name, StringUtils.length(fullName), "*");
	}

	/**
	 * 
	 * @Title：chineseName
	 * @Description: TODO([中文姓名] 只显示第一个汉字，其他隐藏为2个星号<例子：李**>)
	 * @see：
	 * @param familyName
	 * @param givenName
	 * @return
	 */
	public static String chineseName(final String familyName, final String givenName) {
		if (StringUtils.isBlank(familyName) || StringUtils.isBlank(givenName))
			return StringUtils.EMPTY;
		return chineseName(familyName + givenName);
	}

	/**
	 * 
	 * @Title：idCardNum
	 * @Description: TODO([身份证号] 显示最后四位，其他隐藏。共计18位或者15位。<例子：*************5762>)
	 * @see：
	 * @param id
	 * @return
	 */
	public static String idCardNum(final String id) {
		if (StringUtils.isBlank(id))
			return StringUtils.EMPTY;
		return StringUtils.left(id, 3).concat(StringUtils
				.removeStart(StringUtils.leftPad(StringUtils.right(id, 4), StringUtils.length(id), "*"), "***"));
	}

	/**
	 * 
	 * @Title：fixedPhone
	 * @Description: TODO([固定电话] 后四位，其他隐藏<例子：****1234>)
	 * @see：
	 * @param num
	 * @return
	 */
	public static String fixedPhone(final String num) {
		if (StringUtils.isBlank(num))
			return StringUtils.EMPTY;
		return StringUtils.leftPad(StringUtils.right(num, 4), StringUtils.length(num), "*");
	}

	/**
	 * 
	 * @Title：mobilePhone
	 * @Description: TODO([手机号码] 前三位，后四位，其他隐藏<例子:138******1234>)
	 * @see：
	 * @param num
	 * @return
	 */
	public static String mobilePhone(final String num) {
		if (StringUtils.isBlank(num))
			return StringUtils.EMPTY;
		return StringUtils.left(num, 3).concat(StringUtils
				.removeStart(StringUtils.leftPad(StringUtils.right(num, 4), StringUtils.length(num), "*"), "***"));

	}

	/**
	 * 
	 * @Title：address
	 * @Description: TODO([地址] 只显示到地区，不显示详细地址；我们要对个人信息增强保护<例子：北京市海淀区****>)
	 * @see：
	 * @param address
	 * @param sensitiveSize 敏感信息长度
	 * @return
	 */
	public static String address(final String address, final int sensitiveSize) {
		if (StringUtils.isBlank(address))
			return StringUtils.EMPTY;
		final int length = StringUtils.length(address);
		return StringUtils.rightPad(StringUtils.left(address, length - sensitiveSize), length, "*");
	}

	/**
	 * 
	 * @Title：email
	 * @Description: TODO([电子邮箱] 邮箱前缀仅显示第一个字母，前缀其他隐藏，用星号代替，@及后面的地址显示<例子:g**@163.com>)
	 * @see：
	 * @param email
	 * @return
	 */
	public static String email(final String email) {
		if (StringUtils.isBlank(email))
			return StringUtils.EMPTY;
		final int index = StringUtils.indexOf(email, "@");
		if (index <= 1) {
			return email;
		} else {
			return StringUtils.rightPad(StringUtils.left(email, 1), index, "*")
					.concat(StringUtils.mid(email, index, StringUtils.length(email)));
		}
	}

	/**
	 * 
	 * @Title：bankCard
	 * @Description: TODO([银行卡号] 前六位，后四位，其他用星号隐藏每位1个星号<例子:6222600**********1234>)
	 * @see：
	 * @param cardNum
	 * @return
	 */
	public static String bankCard(final String cardNum) {
		if (StringUtils.isBlank(cardNum))
			return StringUtils.EMPTY;
		return StringUtils.left(cardNum, 6).concat(StringUtils.removeStart(
				StringUtils.leftPad(StringUtils.right(cardNum, 4), StringUtils.length(cardNum), "*"), "******"));
	}

	/**
	 * 
	 * @Title：cnapsCode
	 * @Description: TODO([公司开户银行联号] 公司开户银行联行号,显示前两位，其他用星号隐藏，每位1个星号<例子:12********>)
	 * @see：
	 * @param code
	 * @return
	 */
	public static String cnapsCode(final String code) {
		if (StringUtils.isBlank(code))
			return StringUtils.EMPTY;
		return StringUtils.rightPad(StringUtils.left(code, 2), StringUtils.length(code), "*");
	}
	
	/**
	 * 
	 * @Title：main
	 * @Description: TODO(测试)
	 * @see：
	 * @param args
	 */
	public static void main(String[] args) {
		System.out.println(mobilePhone("15058041631"));
		System.out.println(idCardNum("341125199503200032"));
	}

}
