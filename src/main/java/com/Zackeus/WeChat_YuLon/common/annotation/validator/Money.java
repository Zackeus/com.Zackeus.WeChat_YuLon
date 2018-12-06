package com.Zackeus.WeChat_YuLon.common.annotation.validator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.ConstraintValidatorContext;
import javax.validation.Payload;

import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.PatternUtil;

/**
 * 
 * @Title:Money
 * @Description:TODO(金额校验类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月28日 下午2:48:44
 */
@Target({ ElementType.FIELD, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = Money.Validator.class)
public @interface Money {

	String message() default "不是金额形式";
	
	boolean isZero() default true;

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	public class Validator extends BasicValidator<Money, Object> {
		
		private boolean isZero;

		@Override
		public void initialize(Money constraintAnnotation) {
			isZero = constraintAnnotation.isZero();
		}
		
		@Override
		public boolean isValid(Object value, ConstraintValidatorContext context) {
			if (ObjectUtils.isEmpty(value))
				return Boolean.FALSE;
			if (!PatternUtil.isMoney(String.valueOf(value)))
				return Boolean.FALSE;
			if (isZero) {
				try {
					Integer money = Integer.parseInt(String.valueOf(value));
					if (0 == money)
						return sendErrorMsg(context, "{Money.isZero}");
				} catch (Exception e) {
				}
			}
			return Boolean.TRUE;
		}
	}

}
