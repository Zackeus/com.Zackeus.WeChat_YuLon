package com.Zackeus.WeChat_YuLon.common.utils.exception;

/**
 * 
 * @Title:XmlException
 * @Description:TODO(返回XML异常信息)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月7日 下午1:54:05
 */
public class XmlException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;

	/**
	 * 错误编码
	 */
	private String errorCode;
	
	/**
	 * 附加信息
	 */
	private Object object;

	/**
	 * 消息是否为属性文件中的Key
	 */
	private boolean propertiesKey = true;

	/**
	 * 构造一个基本异常.
	 * 
	 * @param message
	 */
	public XmlException(String message) {
		super(message);
	}

	/**
	 * 构造一个基本异常
	 * @param errorCode 错误编码
	 * @param message 信息描述
	 */
	public XmlException(String errorCode, String message) {
		this(errorCode, message, true);
	}
	
	/**
	 * 构造一个基本异常
	 * @param errorCode
	 * @param message
	 * @param object 附加信息
	 */
	public XmlException(String errorCode, String message, Object object) {
		this(errorCode, message, object, true);
	}

	/**
	 * 
	 * @param errorCode 造一个基本异常.
	 * @param message
	 * @param cause
	 */
	public XmlException(String errorCode, String message, Throwable cause) {
		this(errorCode, message, cause, true);
	}

	/**
	 * 构造一个基本异常. 
	 * @param errorCode 错误编码
	 * @param message 信息描述
	 * @param propertiesKey 消息是否为属性文件中的Key
	 */ 
	public XmlException(String errorCode, String message, boolean propertiesKey) {
		super(message);
		this.setErrorCode(errorCode);
		this.setPropertiesKey(propertiesKey);
	}
	
	/**
	 * 构造一个基本异常. 
	 * @param errorCode
	 * @param message
	 * @param object 附加信息
	 * @param propertiesKey
	 */
	public XmlException(String errorCode, String message, Object object, boolean propertiesKey) {
		super(message);
		this.setErrorCode(errorCode);
		this.setPropertiesKey(propertiesKey);
		this.setObject(object);
	}

	/**
	 * 
	 * @param errorCode
	 * @param message
	 * @param cause
	 * @param propertiesKey
	 */
	public XmlException(String errorCode, String message, Throwable cause, boolean propertiesKey) {
		super(message, cause);
		this.setErrorCode(errorCode);
		this.setPropertiesKey(propertiesKey);
	}

	/**
	 * 
	 * @param message
	 * @param cause 根异常类（可以存入任何异常）
	 */
	public XmlException(String message, Throwable cause) {
		super(message, cause);
	}

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}
	
	public Object getObject() {
		return object;
	}

	public void setObject(Object object) {
		this.object = object;
	}

	public boolean isPropertiesKey() {
		return propertiesKey;
	}

	public void setPropertiesKey(boolean propertiesKey) {
		this.propertiesKey = propertiesKey;
	}

}
