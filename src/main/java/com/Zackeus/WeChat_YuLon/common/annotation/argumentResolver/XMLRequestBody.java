package com.Zackeus.WeChat_YuLon.common.annotation.argumentResolver;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.Zackeus.WeChat_YuLon.common.utils.JsonMapper;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.XmlUtil;
import com.alibaba.fastjson.JSON;

/**
 * 
 * @Title:WeChatNotifyBody
 * @Description:TODO(XML参数解析器)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月4日 下午1:58:57
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface XMLRequestBody {
	
	String value() default "";
	
	boolean required() default true;

	public class XMLRequestBodyArgumentResolver extends BasicArgumentResolver {

		/**
		 * 方法指明RequestModelArgumentResolver只处理带有@RequestModel注解的参数
		 */
		@Override
		public boolean supportsParameter(MethodParameter parameter) {
			return parameter.hasParameterAnnotation(XMLRequestBody.class);
		}

		/**
		 * xml格式通知信息解析，转为驼峰命名并注入实体
		 */
		@Override
		public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
				NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
			
			final String xmlData = getRequestBody(webRequest);
			
			if (parameter.getParameterAnnotation(XMLRequestBody.class).required() && 
					StringUtils.isBlank(xmlData)) 
				throw new MissingServletRequestParameterException("参数不能为空", "@XMLRequestBody");
			
			Map<String, String> xmlMap = XmlUtil.xmlToMap(xmlData);
			Map<String, String> jsonMap = new HashMap<>();
			// 转驼峰命名
	        for(Map.Entry<String, String> entry : xmlMap.entrySet()) {
	        	jsonMap.put(XmlUtil.camelName(entry.getKey()), entry.getValue());
	        }
			
			return JSON.parseObject(JsonMapper.toJsonString(jsonMap), parameter.getGenericParameterType());
		}
	}

}
