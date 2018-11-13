package com.Zackeus.WeChat_YuLon.common.config;

import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import com.Zackeus.WeChat_YuLon.common.utils.PropertiesLoader;
import com.google.common.collect.Maps;

/**
 * 
 * @Title:GlobalConfig
 * @Description:TODO(通用配置类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年7月20日 下午4:34:45
 */
@Component
public class GlobalConfig {
	
	/**
	 * 当前对象实例
	 */
	private static GlobalConfig globalConfig = new GlobalConfig();
	
	/**
	 * 全局属性值
	 */
	private static Map<String, String> map = Maps.newHashMap();
	
	/**
	 * 属性文件加载对象
	 */
	private static PropertiesLoader loader = new PropertiesLoader("properties/yulon.properties");
	
	/**
	 * 显示/隐藏
	 */
	public static final String SHOW = "1";
	public static final String HIDE = "0";

	/**
	 * 是/否
	 */
	public static final String YES = "1";
	public static final String NO = "0";
	
	/**
	 * 
	 * @Title:getInstance
	 * @Description: TODO(获取当前对象实例)
	 * @return
	 */
	public static GlobalConfig getInstance() {
		return globalConfig;
	}
	
	/**
	 * 
	 * @Title:getConfig
	 * @Description: TODO(获取配置)
	 * @param key
	 * @return
	 */
	public static String getConfig(String key) {
		String value = map.get(key);
		if (value == null){
			value = loader.getProperty(key);
			map.put(key, value != null ? value : StringUtils.EMPTY);
		}
		return value;
	}
}
