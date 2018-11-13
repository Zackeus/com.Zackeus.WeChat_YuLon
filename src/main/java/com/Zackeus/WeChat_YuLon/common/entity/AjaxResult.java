package com.Zackeus.WeChat_YuLon.common.entity;

import java.io.Serializable;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;

/**
 * 
 * @Title:LayuiResult
 * @Description:TODO(前端Ajax响应实体)
 * @Company:
 * @author zhou.zhang
 * @date 2018年8月16日 下午4:52:45
 */
public class AjaxResult implements Serializable {

	private static final long serialVersionUID = 1L;

	private Integer code; 					// 响应code
	private String msg; 					// 响应内容
	private Object customObj; 				// 自定义参数
	
	public AjaxResult() {
		super();
	}

	public AjaxResult(Integer code, String message) {
		this(code, message, null);
	}
	
	public AjaxResult(Integer code, String msg, Object object) {
		super();
		this.code = code;
		this.msg = msg;
		this.customObj = object;
	}

	public Integer getCode() {
		return code;
	}

	public void setCode(Integer code) {
		this.code = code;
	}
	
    public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public Object getCustomObj() {
		return customObj;
	}

	public void setCustomObj(Object object) {
		this.customObj = object;
	}

	@Override
    public String toString() {
        return ReflectionToStringBuilder.toString(this);
    }

}
