package com.Zackeus.WeChat_YuLon.common.utils;

import java.util.regex.Pattern;

/**
 * 
 * @Title:PatternUtil
 * @Description:TODO(正则工具类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年9月29日 下午4:08:26
 */
public class PatternUtil {

	/**
	 * 身份证正则
	 */
	private static final String ID_CARD = "(^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$)|"
			+ "(^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}$)";

	/*
	 * 手机号码正则
	 */
	private static final String PATTEN_CALL_NUM = "^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$";

	/**
	 * URL正则
	 */
	private static final String PATTEN_URL = "^([hH][tT]{2}[pP]:/*|[hH][tT]{2}[pP][sS]:/*|[fF][tT][pP]:/*)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\\/])+(\\?{0,1}(([A-Za-z0-9-~]+\\={0,1})([A-Za-z0-9-~]*)\\&{0,1})*)$";

	/**
	 * 金额正则
	 */
	private static final String MONEY = "^\\d+(\\.\\d{1,2})?$";
	
	/**
	 * 
	 * @Title：name
	 * @Description: TODO(正则校验) @see：
	 * @param pattern
	 *            正则字符
	 * @param value
	 *            校验字符
	 * @return
	 */
	public static Boolean check(String pattern, String value) {
		return Pattern.compile(pattern).matcher(value).matches();
	}

	/**
	 * 
	 * @Title：isPhoneNum
	 * @Description: TODO(校验手机号格式) @see：
	 * @param value
	 * @return
	 */
	public static Boolean isPhoneNum(String value) {
		return check(PATTEN_CALL_NUM, value);
	}

	/**
	 * 
	 * @Title：isUrl
	 * @Description: TODO(url校验) @see：
	 * @param value
	 * @return
	 */
	public static Boolean isUrl(String value) {
		return check(PATTEN_URL, value);
	}
	
	/**
	 * 
	 * @Title：isIdCard
	 * @Description: TODO(身份证校验)
	 * @see：
	 * @param value
	 * @return
	 */
	public static Boolean isIdCard(String value) {
		return check(ID_CARD, value);
	}
	
	/**
	 * 
	 * @Title：isMoney
	 * @Description: TODO(金额正则)
	 * @see：
	 * @param value
	 * @return
	 */
	public static Boolean isMoney(String value) {
		return check(MONEY, value);
	}

	public static void main(String[] args) {
		System.out.println(check(PATTEN_URL, "http://10.5.133.244:8008/com.Zackeus.CTI/sys/demo/receive"));
	}
}
