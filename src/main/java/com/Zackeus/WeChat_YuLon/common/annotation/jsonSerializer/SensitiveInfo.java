package com.Zackeus.WeChat_YuLon.common.annotation.jsonSerializer;

import java.io.IOException;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.Objects;

import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.SensitiveInfoUtils;
import com.Zackeus.WeChat_YuLon.modules.sys.service.SystemService;
import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.BeanProperty;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.ContextualSerializer;

/**
 * 
 * @Title:SensitiveInfo
 * @Description:TODO(数据脱敏注解类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月13日 上午10:15:50
 */
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonSerialize(using = SensitiveInfo.SensitiveInfoSerialize.class)
public @interface SensitiveInfo {

	public SensitiveType value();

	public class SensitiveInfoSerialize extends JsonSerializer<String> implements ContextualSerializer {

		private SensitiveType type;

		public SensitiveInfoSerialize() {
		}

		public SensitiveInfoSerialize(final SensitiveType type) {
			this.type = type;
		}

		@Override
		public void serialize(final String s, final JsonGenerator jsonGenerator,
				final SerializerProvider serializerProvider) throws IOException, JsonProcessingException {
			switch (this.type) {
			case OPEN_ID:
				// 微信唯一标识，加密处理
				jsonGenerator.writeString(SystemService.entryptPassword(s));
				break;

			case CHINESE_NAME:
				jsonGenerator.writeString(SensitiveInfoUtils.chineseName(s));
				break;
			case ID_CARD:
				jsonGenerator.writeString(SensitiveInfoUtils.idCardNum(s));
				break;
			case FIXED_PHONE:
				jsonGenerator.writeString(SensitiveInfoUtils.fixedPhone(s));
				break;
			case MOBILE_PHONE:
				jsonGenerator.writeString(SensitiveInfoUtils.mobilePhone(s));
				break;
			case ADDRESS:
				jsonGenerator.writeString(SensitiveInfoUtils.address(s, 4));
				break;
			case EMAIL:
				jsonGenerator.writeString(SensitiveInfoUtils.email(s));
				break;
			case BANK_CARD:
				jsonGenerator.writeString(SensitiveInfoUtils.bankCard(s));
				break;
			case CNAPS_CODE:
				jsonGenerator.writeString(SensitiveInfoUtils.cnapsCode(s));
				break;

			default:
				break;
			}
		}

		@Override
		public JsonSerializer<?> createContextual(final SerializerProvider serializerProvider,
				final BeanProperty beanProperty) throws JsonMappingException {
			// 为空直接跳过
			if (ObjectUtils.isNotEmpty(beanProperty)) {
				// 非 String类直接跳过
				if (Objects.equals(beanProperty.getType().getRawClass(), String.class)) {
					SensitiveInfo sensitiveInfo = beanProperty.getAnnotation(SensitiveInfo.class);
					if (ObjectUtils.isEmpty(sensitiveInfo))
						sensitiveInfo = beanProperty.getContextAnnotation(SensitiveInfo.class);
					if (ObjectUtils.isNotEmpty(sensitiveInfo))
						// 如果能得到注解，就将注解的 value 传入SensitiveInfoSerialize
						return new SensitiveInfoSerialize(sensitiveInfo.value());
				}
				return serializerProvider.findValueSerializer(beanProperty.getType(), beanProperty);
			}
			return serializerProvider.findNullValueSerializer(beanProperty);
		}
	}

}
