package com.Zackeus.WeChat_YuLon.common.utils;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.AlgorithmParameters;
import java.security.Key;
import java.security.Security;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.lang3.StringEscapeUtils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import com.Zackeus.WeChat_YuLon.common.utils.exception.Exceptions;

/**
 * 封装各种格式的编码解码工具类.
 * 1.Commons-Codec的 hex/base64 编码
 * 2.自制的base62 编码
 * 3.Commons-Lang的xml/html escape
 * 4.JDK提供的URLEncoder
 * @author calvin
 * @version 2013-01-15
 */
@SuppressWarnings("deprecation")
public class Encodes {

	private static final char[] BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".toCharArray();
	private static String ENCODE_AES = "AES";
	private static boolean BOUNCY_INIT = Boolean.TRUE;

	/**
	 * Hex编码.
	 */
	public static String encodeHex(byte[] input) {
		return new String(Hex.encodeHex(input));
	}

	/**
	 * Hex解码.
	 */
	public static byte[] decodeHex(String input) {
		try {
			return Hex.decodeHex(input.toCharArray());
		} catch (DecoderException e) {
			throw Exceptions.unchecked(e);
		}
	}

	/**
	 * Base64编码.
	 */
	public static String encodeBase64(byte[] input) {
		return new String(Base64.encodeBase64(input));
	}
	
	/**
	 * Base64编码.
	 */
	public static String encodeBase64(String input) {
		try {
			return new String(Base64.encodeBase64(input.getBytes(WebUtils.UTF_ENCODING)));
		} catch (UnsupportedEncodingException e) {
			return "";
		}
	}

	/**
	 * Base64解码.
	 */
	public static byte[] decodeBase64(String input) {
		return Base64.decodeBase64(input.getBytes());
	}
	
	/**
	 * Base64解码.
	 */
	public static String decodeBase64String(String input) {
		try {
			return new String(Base64.decodeBase64(input.getBytes()), WebUtils.UTF_ENCODING);
		} catch (UnsupportedEncodingException e) {
			return "";
		}
	}

	/**
	 * Base62编码。
	 */
	public static String encodeBase62(byte[] input) {
		char[] chars = new char[input.length];
		for (int i = 0; i < input.length; i++) {
			chars[i] = BASE62[((input[i] & 0xFF) % BASE62.length)];
		}
		return new String(chars);
	}

	/**
	 * Html 转码.
	 */
	public static String escapeHtml(String html) {
		return StringEscapeUtils.escapeHtml4(html);
	}

	/**
	 * Html 解码.
	 */
	public static String unescapeHtml(String htmlEscaped) {
		return StringEscapeUtils.unescapeHtml4(htmlEscaped);
	}

	/**
	 * Xml 转码.
	 */
	public static String escapeXml(String xml) {
		return StringEscapeUtils.escapeXml10(xml);
	}

	/**
	 * Xml 解码.
	 */
	public static String unescapeXml(String xmlEscaped) {
		return StringEscapeUtils.unescapeXml(xmlEscaped);
	}
	/**
	 * URL 编码, Encode默认为UTF-8. 
	 */
	public static String urlEncode(String part) {
		try {
			return URLEncoder.encode(part, WebUtils.UTF_ENCODING);
		} catch (UnsupportedEncodingException e) {
			throw Exceptions.unchecked(e);
		}
	}

	/**
	 * URL 解码, Encode默认为UTF-8. 
	 */
	public static String urlDecode(String part) {

		try {
			return URLDecoder.decode(part, WebUtils.UTF_ENCODING);
		} catch (UnsupportedEncodingException e) {
			throw Exceptions.unchecked(e);
		}
	}
	
	/** 
     * AES解密 
     * @param content 密文 
     * @return 
     * @throws InvalidAlgorithmParameterException  
     * @throws NoSuchProviderException  
     */  
    public static byte[] decodeAES(byte[] content, byte[] keyByte, byte[] ivByte) { 
    	try {
    		/*每次对 BouncyCastleProvider 进行初始化会占用内存，会出现内存泄漏*/
    		if (BOUNCY_INIT) {
    			Security.addProvider(new BouncyCastleProvider());
    			BOUNCY_INIT = Boolean.FALSE;
			}
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS7Padding");  
            Key sKeySpec = new SecretKeySpec(keyByte, ENCODE_AES);  
            AlgorithmParameters parameters = AlgorithmParameters.getInstance(ENCODE_AES);
            parameters.init(new IvParameterSpec(ivByte));
            cipher.init(Cipher.DECRYPT_MODE, sKeySpec, parameters);
            byte[] result = cipher.doFinal(content);  
            return result; 
		} catch (Exception e) {
			Logs.error("微信密文解密异常：" + Logs.toLog(e));
			return null;
		}
    }
}
