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
 * @Title:IdCard
 * @Description:TODO(身份证号校验器)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月9日 上午11:22:11
 */
@Target({ ElementType.FIELD, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IdCard.Validator.class)
public @interface IdCard {

	String message() default "{IsIdCard}";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	public class Validator extends BasicValidator<IdCard, String> {

		@Override
		public void initialize(IdCard constraintAnnotation) {

		}

		@Override
		public boolean isValid(String value, ConstraintValidatorContext context) {
			if (StringUtils.isBlank(value))
				return sendErrorMsg(context, "{IdCard.NotBlank}");
			return PatternUtil.isIdCard(value);
		}
	}

}
