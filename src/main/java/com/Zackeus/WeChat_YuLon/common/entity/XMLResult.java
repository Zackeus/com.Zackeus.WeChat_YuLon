package com.Zackeus.WeChat_YuLon.common.entity;

import java.io.Serializable;

/**
 * 
 * @Title:XMLResult
 * @Description:TODO(XML响应数据)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月4日 下午3:13:29
 */
public class XMLResult implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private String returnCode;	// 返回代码
	private String returnMsg;	// 返回信息
	
	public XMLResult() {
		super();
	}
	
	public XMLResult(String returnCode, String returnMsg) {
		super();
		this.returnCode = returnCode;
		this.returnMsg = returnMsg;
	}
	
	public String getReturnCode() {
		return returnCode;
	}
	public void setReturnCode(String returnCode) {
		this.returnCode = returnCode;
	}
	public String getReturnMsg() {
		return returnMsg;
	}
	public void setReturnMsg(String returnMsg) {
		this.returnMsg = returnMsg;
	}
	
	@Override
	public String toString() {
		return "<xml>"
				+ "<returnCode><![CDATA[" + this.returnCode + "]]></returnCode>"
				+ "<returnMsg><![CDATA[" + this.returnMsg + "]]></returnMsg>" 
				+ "</xml> ";
	}
	
	public String toCommonString() {
		return "<xml>"
				+ "<return_code><![CDATA[" + this.returnCode + "]]></return_code>"
				+ "<return_msg><![CDATA[" + this.returnMsg + "]]></return_msg>" 
				+ "</xml> ";
	}

}
