package com.Zackeus.WeChat_YuLon.common.annotation.argumentResolver;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.MediaType;

import org.springframework.core.MethodParameter;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

/**
 * 
 * @Title:PageRequestBody
 * @Description:TODO(分页参数解析器 实体属性直接注入 分页参数注入 HttpServletRequest 中)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月6日 上午11:00:25
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface PageRequestBody {
	
	String value() default "";
	
	String page() default "page";  			// 当前页吗字段
	String pageSize() default "pageSize";  	// 每页限制条数字段

	boolean required() default true;

	public class PageRequestBodyArgumentResolver extends BasicArgumentResolver {

		/**
		 * 方法指明RequestModelArgumentResolver只处理带有@RequestModel注解的参数
		 */
		@Override
		public boolean supportsParameter(MethodParameter parameter) {
			return parameter.hasParameterAnnotation(PageRequestBody.class);
		}

		/**
		 * 对入参进行解析：首先获取参数值（json串），然后获取参数的完整类型（带泛型），最后使用fastjson解析器将json格式的参数值转化为具体类型的对象
		 */
		@Override
		public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
				NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
			
			HttpServletRequest httpServletRequest = webRequest.getNativeRequest(HttpServletRequest.class);
			if (!StringUtils.equals(MediaType.APPLICATION_JSON, httpServletRequest.getContentType())) {
				throw new HttpMediaTypeNotSupportedException("@PageRequestBody注解仅支持 " + MediaType.APPLICATION_JSON);
			}
			
			final String parameterJson = getRequestBody(webRequest);
			
			if (parameter.getParameterAnnotation(PageRequestBody.class).required() && 
					StringUtils.isBlank(parameterJson)) {
				throw new MissingServletRequestParameterException("参数不能为空", "@PageRequestBody");
			}
			
			JSONObject pageJson = JSONObject.parseObject(parameterJson);
			httpServletRequest.setAttribute(parameter.getParameterAnnotation(PageRequestBody.class).page(), 
					pageJson.get(parameter.getParameterAnnotation(PageRequestBody.class).page()));
			httpServletRequest.setAttribute(parameter.getParameterAnnotation(PageRequestBody.class).pageSize(), 
					pageJson.get(parameter.getParameterAnnotation(PageRequestBody.class).pageSize()));

			// parameter.getGenericParameterType() 返回参数的完整类型（带泛型）
			return JSON.parseObject(parameterJson, parameter.getGenericParameterType());
		}
	}
}
