package com.Zackeus.WeChat_YuLon.common.entity;

import java.io.Serializable;

import org.apache.commons.lang.builder.ReflectionToStringBuilder;

/**
 * 
 * @Title:HttpClientResult
 * @Description:TODO(封装httpClient响应结果)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年7月6日 上午11:13:51
 */
public class HttpClientResult implements Serializable {

	private static final long serialVersionUID = 2168152194164783950L;

	/**
	 * 响应状态码
	 */
	private int code;

	/**
	 * 响应数据
	 */
	private String content;

	public HttpClientResult() {
	}

	public HttpClientResult(int code) {
		this.code = code;
	}

	public HttpClientResult(String content) {
		this.content = content;
	}

	public HttpClientResult(int code, String content) {
		this.code = code;
		this.content = content;
	}

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}