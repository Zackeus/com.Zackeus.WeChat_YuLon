package com.Zackeus.WeChat_YuLon.common.utils;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.commons.codec.digest.DigestUtils;
import org.bouncycastle.util.Arrays;

import com.alibaba.fastjson.JSON;
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
	 * @Title：createLinkString
	 * @Description: TODO(把数组所有元素排序，并按照“参数=参数值”的模式用“&”字符拼接成字符串)
	 * @see：
	 * @param params 需要排序并参与字符拼接的参数组
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
    * 签名字符串  
    * @param text需要签名的字符串  
    * @param key 密钥  
    * @param input_charset编码格式  
    * @return 签名结果  
    */   
   public static String sign(String text, String key) {   
       text = text + "&key=" + key;   
       return DigestUtils.md5Hex(StringUtils.getBytes(text)).toUpperCase();   
   }  
   
}
