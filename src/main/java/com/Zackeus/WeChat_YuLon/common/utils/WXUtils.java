package com.Zackeus.WeChat_YuLon.common.utils;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.codec.digest.DigestUtils;
import org.bouncycastle.util.Arrays;

import com.alibaba.fastjson.JSON;
import com.Zackeus.WeChat_YuLon.common.entity.HttpClientResult;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpClientUtil;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.Md5Util;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WxPay;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WxPayConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatOrder;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;

/**
 * 
 * @Title:WXUtils
 * @Description:TODO(微信工具类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年10月19日 上午11:23:36
 */
public class WXUtils {

	private static int BAES_KEY_BYTE = 16;
	
	private static String SUCCESS_CODE = "SUCCESS";
	private static String OK_CODE = "OK";

	/**
	 * 
	 * @Title：decryptEncryptedData
	 * @Description: TODO(解密用户加密数据) 
	 * @see： 对称解密使用的算法为 AES-128-CBC，数据采用PKCS#7填充。
	 *               对称解密的目标密文为 Base64_Decode(encryptedData)。 对称解密秘钥 aeskey =
	 *               Base64_Decode(session_key), aeskey 是16字节。 对称解密算法初始向量
	 *               为Base64_Decode(iv)，其中iv由数据接口返回。
	 * @param encryptedData
	 *            被加密的数据
	 * @param sessionKey
	 *            加密秘钥
	 * @param iv
	 *            偏移量
	 * @return
	 */
	public static WeChatUser decryptEncryptedData(String encryptedData, String sessionKey, String iv) {
		byte[] keyByte = Encodes.decodeBase64(sessionKey);
		/* 如果密钥不足16位，那么就补足. 这个if 中的内容很重要 */
		if (keyByte.length % BAES_KEY_BYTE != 0) {
			int groups = keyByte.length / BAES_KEY_BYTE + (keyByte.length % BAES_KEY_BYTE != 0 ? 1 : 0);
			byte[] temp = new byte[groups * BAES_KEY_BYTE];
			Arrays.fill(temp, (byte) 0);
			System.arraycopy(keyByte, 0, temp, 0, keyByte.length);
			keyByte = temp;
		}
		byte[] resultByte = Encodes.decodeAES(Encodes.decodeBase64(encryptedData), keyByte, Encodes.decodeBase64(iv));
		if (ObjectUtils.isNotEmpty(resultByte)) {
			try {
				return JSON.parseObject(new String(resultByte, WebUtils.UTF_ENCODING), WeChatUser.class);
			} catch (UnsupportedEncodingException e) {
				Logs.error("解密用户数据异常：" + Logs.toLog(e));
				return null;
			}
		} else {
			return null;
		}
	}
	
	/**
	 * 
	 * @Title：createMap
	 * @Description: TODO(生成统一下单接口参数)
	 * @see：
	 * @param weChatOrder
	 * @param weChatConfig
	 * @param wxPayConfig
	 * @return
	 */
	public static Map<String, String> createMap(WeChatOrder weChatOrder, WeChatConfig weChatConfig, WxPayConfig wxPayConfig) {
		Map<String, String> packageParams = new HashMap<String, String>();
		packageParams.put(WxPay.APP_ID.getWxKey(), weChatConfig.getAppId());
		packageParams.put(WxPay.MCH_ID.getWxKey(), wxPayConfig.getMch_id());
		packageParams.put(WxPay.OPEN_ID.getWxKey(), weChatOrder.getOpenId());
		packageParams.put(WxPay.OUT_TRADE_NO.getWxKey(), weChatOrder.getOutTradeNo());
		packageParams.put(WxPay.TOTAL_FEE.getWxKey(), String.valueOf(weChatOrder.getTotalFee()));						
		packageParams.put(WxPay.TRADE_TYPE.getWxKey(), wxPayConfig.getTrade_type());
		packageParams.put(WxPay.BODY.getWxKey(), weChatOrder.getBody());
		packageParams.put(WxPay.NONCE_STR.getWxKey(), weChatOrder.getNonceStr());
		packageParams.put(WxPay.SPBILL_CREATE_IP.getWxKey(), weChatOrder.getSpbillCreateIp()); 
		packageParams.put(WxPay.NOTIFY_URL.getWxKey(), wxPayConfig.getNotify_url());
		return packageParams;
	}

	/**
	 * 
	 * @Title：createXML
	 * @Description: TODO(生成带有 sign 的 XML 格式字符串) @see：
	 * @param wxPayConfig
	 * @param packageParams
	 * @return
	 */
	public static String createSignedXml(WxPayConfig wxPayConfig, Map<String, String> packageParams) {
		// MD5运算生成签名
		packageParams.put(WxPay.SIGN.getWxKey(), sign(createLinkString(packageParams), wxPayConfig.getKey()));
		return XmlUtil.mapToXml(packageParams);
	}

	/**
	 * 
	 * @Title：createLinkString
	 * @Description: TODO(把数组所有元素排序，并按照“参数=参数值”的模式用“&”字符拼接成字符串) @see：
	 * @param params
	 *            需要排序并参与字符拼接的参数组
	 * @return 拼接后字符串
	 */
	public static String createLinkString(Map<String, String> params) {
		List<String> keys = new ArrayList<String>(params.keySet());
		Collections.sort(keys);
		String prestr = StringUtils.EMPTY;
		for (int i = 0; i < keys.size(); i++) {
			String key = keys.get(i);
			String value = params.get(key);
			if (i == keys.size() - 1)
				// 拼接时，不包括最后一个&字符
				prestr = prestr + key + "=" + value;
			else
				prestr = prestr + key + "=" + value + "&";
		}
		return prestr;
	}

	/**
	 * 
	 * @Title：sign
	 * @Description: TODO(签名字符串)
	 * @see：
	 * @param text 需要签名的字符串
	 * @param key 密钥
	 * @return
	 */
	public static String sign(String text, String key) {
		text = text + "&" + WxPay.KEY.getWxKey() + "=" + key;
		return DigestUtils.md5Hex(StringUtils.getBytes(text)).toUpperCase();
	}
	
	/**
	 * 
	 * @Title：paySign
	 * @Description: TODO(支付参数)
	 * @see：
	 * @param prepayId 预支付交易会话标识
	 * @param nonceStr 随机字符串
	 * @param wxPayConfig 
	 * @param weChatConfig
	 * @return
	 */
	public static Map<String, String> createPayMap(String prepayId, String nonceStr, 
			WxPayConfig wxPayConfig, WeChatConfig weChatConfig) {
		Long timeStamp = System.currentTimeMillis() / 1000;
		Map<String, String> resMap = new HashMap<String, String>();
		
        resMap.put(WxPay.NONCE_STR.getEntityKey(), nonceStr);
        resMap.put(WxPay.PACKAGE.getEntityKey(), WxPay.PREPAY_ID.getWxKey() + "=" + prepayId);
        resMap.put(WxPay.SIGN_TYPE.getEntityKey(), Md5Util.MD5);								
        resMap.put(WxPay.TIME_STAMP.getEntityKey(), String.valueOf(timeStamp));			
        // 拼接签名需要的参数
        resMap.put(WxPay.APP_ID.getEntityKey(), weChatConfig.getAppId());
        resMap.put(WxPay.PAY_SIGN.getEntityKey(), sign(createLinkString(resMap), wxPayConfig.getKey()));
        // 返回时移除appId参数
        resMap.remove(WxPay.APP_ID.getEntityKey());
		return resMap;
	}
	
	/**
	 * 
	 * @Title：paraFilter
	 * @Description: TODO(除去数组中的空值和签名参数 ) @see：
	 * @param sArray
	 *            签名参数组
	 * @return 去掉空值与签名参数后的新签名参数组
	 */
	public static Map<String, String> paraFilter(Map<String, String> sArray) {
		Map<String, String> result = new HashMap<String, String>();
		if (ObjectUtils.isEmpty(sArray))
			return result;
		for (String key : sArray.keySet()) {
			String value = sArray.get(key);
			if (StringUtils.isBlank(value) || key.equalsIgnoreCase(WxPay.SIGN.getWxKey())
					|| key.equalsIgnoreCase(WxPay.SIGN_TYPE.getWxKey()))
				continue;
			result.put(key, value);
		}
		return result;
	}
	
	/**
	 * 
	 * @Title：orderPay
	 * @Description: TODO(微信支付统一下单)
	 * @see：
	 * @param weChatOrder
	 * @param weChatConfig
	 * @param wxPayConfig
	 * @return
	 * @throws Exception
	 */
	public static Map<String, String> orderPay(WeChatOrder weChatOrder, WeChatConfig weChatConfig, WxPayConfig wxPayConfig) throws Exception {
		String xml = createSignedXml(wxPayConfig, createMap(weChatOrder, weChatConfig, wxPayConfig));
		AssertUtil.isTrue(StringUtils.isNotBlank(xml), HttpStatus.SC_INTERNAL_SERVER_ERROR, "统一下单签名失败");
		// 调用统一下单接口，并接受返回的结果
        HttpClientResult result = HttpClientUtil.doPostXml(wxPayConfig.getPay_url(), xml);
        AssertUtil.isTrue(HttpStatus.SC_OK == result.getCode(), result.getCode(), "统一下单接口请求失败");
        Map<String, String> map = XmlUtil.xmlToMap(result.getContent());
        AssertUtil.isTrue(ObjectUtils.isNotEmpty(map), HttpStatus.SC_INTERNAL_SERVER_ERROR, "解析统一下单XML信息失败");
        AssertUtil.isTrue(StringUtils.equals(SUCCESS_CODE, map.get(WxPay.RETURN_CODE.getWxKey())) &&
        		StringUtils.equals(OK_CODE, map.get(WxPay.RETURN_MSG.getWxKey())), 
        		HttpStatus.SC_INTERNAL_SERVER_ERROR, "统一下单失败: " + map.get(WxPay.RETURN_MSG.getWxKey()));
        AssertUtil.isTrue(ObjectUtils.isEmpty(map.get(WxPay.ERR_CODE.getWxKey())), 
        		HttpStatus.SC_INTERNAL_SERVER_ERROR, "统一下单失败: " + map.get(WxPay.ERR_CODE_DES.getWxKey()));
        return createPayMap(map.get(WxPay.PREPAY_ID.getWxKey()), weChatOrder.getNonceStr(), wxPayConfig, weChatConfig);
	}

}
