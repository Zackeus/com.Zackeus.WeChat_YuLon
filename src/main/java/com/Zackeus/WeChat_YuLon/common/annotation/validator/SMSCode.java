package com.Zackeus.WeChat_YuLon.common.annotation.validator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.ConstraintValidatorContext;
import javax.validation.Payload;

import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;

@Target({ ElementType.FIELD, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SMSCode.Validator.class)
public @interface SMSCode {
	
	int length() default 6;
	
	String message() default "{IsSMSCode}";
	
	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	public class Validator extends BasicValidator<SMSCode, String> {
		
		private Integer length;

		@Override
		public void initialize(SMSCode constraintAnnotation) {
			length = constraintAnnotation.length();
		}

		@Override
		public boolean isValid(String value, ConstraintValidatorContext context) {
			if (StringUtils.isBlank(value))
				return sendErrorMsg(context, "{SMSCode.NotBlank}");
			if (value.length() != length)
				return Boolean.FALSE;
			return Boolean.TRUE;
		}
	}

}
