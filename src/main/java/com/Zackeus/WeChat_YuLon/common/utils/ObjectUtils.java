package com.Zackeus.WeChat_YuLon.common.utils;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

/**
 * 
 * @Title:ObjectUtils
 * @Description:TODO(对象操作工具类, 继承org.apache.commons.lang3.ObjectUtils类)
 * @Company:
 * @author zhou.zhang
 * @date 2018年7月10日 上午10:24:55
 */
public class ObjectUtils extends org.apache.commons.lang3.ObjectUtils {
	
	/**
	 * 
	 * @Title:annotationToObject
	 * @Description: TODO(注解到对象复制，只复制能匹配上的方法)
	 * @param annotation
	 * @param object
	 */
	public static void annotationToObject(Object annotation, Object object) {
		if (annotation != null) {
			Class<?> annotationClass = annotation.getClass();
			if (null == object) {
				return;
			}
			Class<?> objectClass = object.getClass();
			for (Method m : objectClass.getMethods()) {
				if (StringUtils.startsWith(m.getName(), "set")) {
					try {
						String s = StringUtils.uncapitalize(StringUtils.substring(m.getName(), 3));
						Object obj = annotationClass.getMethod(s).invoke(annotation);
						if (obj != null && !"".equals(obj.toString())) {
							m.invoke(object, obj);
						}
					} catch (Exception e) {
						// 忽略所有设置失败方法
					}
				}
			}
		}
	}

	/**
	 * 
	 * @Title:serialize
	 * @Description: TODO(序列化对象)
	 * @param object
	 * @return
	 */
	public static byte[] serialize(Object object) {
		ObjectOutputStream oos = null;
		ByteArrayOutputStream baos = null;
		try {
			if (object != null) {
				baos = new ByteArrayOutputStream();
				oos = new ObjectOutputStream(baos);
				oos.writeObject(object);
				return baos.toByteArray();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 
	 * @Title:unserialize
	 * @Description: TODO(反序列化对象)
	 * @param bytes
	 * @return
	 */
	public static Object unserialize(byte[] bytes) {
		ByteArrayInputStream bais = null;
		try {
			if (bytes != null && bytes.length > 0) {
				bais = new ByteArrayInputStream(bytes);
				ObjectInputStream ois = new ObjectInputStream(bais);
				return ois.readObject();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 
	 * @Title:isEmpty
	 * @Description: TODO(判断对象或对象数组中每一个对象是否为空: 对象为null，字符序列长度为0，集合类、Map为empty)
	 * @param obj
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static boolean isEmpty(Object obj) {
		if (obj == null)
			return Boolean.TRUE;

		if (obj instanceof CharSequence)
			return ((CharSequence) obj).length() == 0;

		if (obj instanceof Collection)
			return ((Collection) obj).isEmpty();

		if (obj instanceof Map)
			return ((Map) obj).isEmpty();

		if (obj instanceof Object[]) {
			Object[] object = (Object[]) obj;
			if (object.length == 0) {
				return Boolean.TRUE;
			}
			boolean empty = Boolean.TRUE;
			for (int i = 0; i < object.length; i++) {
				if (!isEmpty(object[i])) {
					empty = Boolean.FALSE;
					break;
				}
			}
			return empty;
		}
		return Boolean.FALSE;
	}
	
	public static boolean isNotEmpty(Object obj) {
		return !isEmpty(obj);
	}

	/**
	 * 
	 * @Title:mapToObject
	 * @Description: TODO(使用Introspector进行转换)
	 * @param map
	 * @param beanClass
	 * @return
	 * @throws Exception
	 */
	public static Object mapToObject(Map<String, Object> map, Class<?> beanClass) throws Exception {
		if (map == null)
			return null;

		Object obj = beanClass.newInstance();

		BeanInfo beanInfo = Introspector.getBeanInfo(obj.getClass());
		PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
		for (PropertyDescriptor property : propertyDescriptors) {
			Method setter = property.getWriteMethod();
			if (setter != null) {
				setter.invoke(obj, map.get(property.getName()));
			}
		}

		return obj;
	}

	/**
	 * 
	 * @Title:objectToMap
	 * @Description: TODO(使用Introspector进行转换)
	 * @param obj
	 * @return
	 * @throws Exception
	 */
	public static Map<String, Object> objectToMap(Object obj) throws Exception {
		if (obj == null)
			return null;

		Map<String, Object> map = new HashMap<String, Object>();

		BeanInfo beanInfo = Introspector.getBeanInfo(obj.getClass());
		PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
		for (PropertyDescriptor property : propertyDescriptors) {
			String key = property.getName();
			if (key.compareToIgnoreCase("class") == 0) {
				continue;
			}
			Method getter = property.getReadMethod();
			Object value = getter != null ? getter.invoke(obj) : null;
			map.put(key, value);
		}
		return map;
	}
}
