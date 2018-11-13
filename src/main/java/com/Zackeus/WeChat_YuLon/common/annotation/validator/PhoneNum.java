package com.Zackeus.WeChat_YuLon.common.annotation.validator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.ConstraintValidatorContext;
import javax.validation.Payload;

import com.Zackeus.WeChat_YuLon.common.utils.PatternUtil;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;

/**
 * 
 * @Title:CallNum
 * @Description:TODO(手机号校验器)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月26日 下午4:17:20
 */
@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNum.Validator.class)
public @interface PhoneNum {
	
	String message() default "{IsPhoneNum}";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	public class Validator extends BasicValidator<PhoneNum, String> {

		@Override
		public void initialize(PhoneNum constraintAnnotation) {
			
		}
		
		@Override
		public boolean isValid(String value, ConstraintValidatorContext context) {
			if (StringUtils.isBlank(value))
				return sendErrorMsg(context, "{PhoneNum.NotBlank}");
			return PatternUtil.isPhoneNum(value);
		}
	}

}
