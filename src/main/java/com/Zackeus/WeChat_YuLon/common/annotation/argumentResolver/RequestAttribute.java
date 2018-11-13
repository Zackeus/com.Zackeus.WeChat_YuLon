package com.Zackeus.WeChat_YuLon.common.annotation.argumentResolver;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.servlet.http.HttpServletRequest;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.Zackeus.WeChat_YuLon.common.utils.JsonMapper;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.alibaba.fastjson.JSON;

/**
 * 
 * @Title:RequestAttribute
 * @Description:TODO(将request Attribute 参数注入实体)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月29日 上午11:07:53
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequestAttribute {

	String name();

	boolean required() default true;
	
	public class RequestAttributeArgumentResolver extends BasicArgumentResolver {

		/**
		 * 指明处理参数标签
		 */
		@Override
		public boolean supportsParameter(MethodParameter parameter) {
			return parameter.hasParameterAnnotation(RequestAttribute.class);
		}

		/**
		 * 入参解析
		 */
		@Override
		public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
				NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
			HttpServletRequest httpServletRequest = webRequest.getNativeRequest(HttpServletRequest.class);
			final Object parameterJson = httpServletRequest.getAttribute(parameter.getParameterAnnotation(RequestAttribute.class).name());
			if (ObjectUtils.isEmpty(parameterJson)) {
				if (parameter.getParameterAnnotation(RequestAttribute.class).required()) {
					throw new MissingServletRequestParameterException("参数不能为空", "@RequestAttribute");
				}
				return null;
			}
			return JSON.parseObject(JsonMapper.toJsonString(parameterJson), parameter.getGenericParameterType());
		}
	}

}
