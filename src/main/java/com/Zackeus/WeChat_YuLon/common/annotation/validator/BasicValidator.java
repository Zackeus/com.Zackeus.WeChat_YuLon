package com.Zackeus.WeChat_YuLon.common.annotation.validator;

import java.lang.annotation.Annotation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

/**
 * 
 * @Title:BasicValidator
 * @Description:TODO(校验器基类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月12日 上午11:00:31
 */
public abstract class BasicValidator<A extends Annotation, T> implements ConstraintValidator<A, T> {
	
	/**
	 * 
	 * @Title：sendErrorMsg
	 * @Description: TODO(返回校验错误信息)
	 * @see：
	 * @param context
	 * @param msg
	 * @return
	 */
	protected boolean sendErrorMsg(ConstraintValidatorContext context, String msg) {
		context.disableDefaultConstraintViolation();
		context.buildConstraintViolationWithTemplate(msg).addConstraintViolation();
		return Boolean.FALSE;
	}

}
