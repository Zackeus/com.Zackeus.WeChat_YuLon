package com.Zackeus.WeChat_YuLon.common.utils;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.reflect.FieldUtils;

import com.Zackeus.WeChat_YuLon.common.entity.HttpClientResult;
import com.Zackeus.WeChat_YuLon.common.entity.msg.SMSMag;
import com.Zackeus.WeChat_YuLon.common.entity.msg.WeiXinMsg;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpClientUtil;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import net.sf.json.JSONObject;

/**
 * 发送信息工具类
 * 
 * @author zhou.zhang
 *
 */
public class SendMsgUtil {
	
	/**
	 * 发送短信信息
	 * @param url 短信提交接口地址
	 * @param smsMag 短信信息实体类
	 * @return
	 * @throws  
	 * @throws Exception 
	 */
	public static HttpClientResult sendSMS(String url, SMSMag smsMag) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			// 利用反射获取当前类和父类的所有属性
			Field[] fields = FieldUtils.getAllFields(smsMag.getClass());
			for (Field field : fields) {
				field.setAccessible(true);
				Object value = field.get(smsMag);
				if (!ObjectUtils.isEmpty(value)) {
					map.put(field.getName(), value);
				}
			}
			return HttpClientUtil.doPostJson(url, JSONObject.fromObject(map));
		} catch (Exception e) {
			Logs.error("发送短信信息异常：" + Logs.toLog(e));
			return new HttpClientResult(HttpStatus.SC_INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * 发送微信信息
	 * @param url 微信提交接口地址
	 * @param weiXinMsg 微信信息实体类
	 * @return
	 * @throws Exception
	 */
	public static HttpClientResult sendWX(String url, WeiXinMsg weiXinMsg) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			// 利用反射获取当前类和父类的所有属性
			Field[] fields = FieldUtils.getAllFields(weiXinMsg.getClass());
			for (Field field : fields) {
				field.setAccessible(true);
				Object value = field.get(weiXinMsg);
				if (!ObjectUtils.isEmpty(value)) {
					map.put(field.getName(), value);
				}
			}
			return HttpClientUtil.doPostJson(url, JSONObject.fromObject(map));
		} catch (Exception e) {
			Logs.error("发送微信信息异常：" + Logs.toLog(e));
			return new HttpClientResult(HttpStatus.SC_INTERNAL_SERVER_ERROR);
		}
	}
}
