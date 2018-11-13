package com.Zackeus.WeChat_YuLon.common.entity.msg;

import java.io.Serializable;

/**
 * 通用消息类
 * 
 * @author zhou.zhang
 *
 */
public class Msg implements Serializable {

	private static final long serialVersionUID = 1L;

	private String Request_sys; 			// 来源系统
	private String Request_user; 			// 来源用户
	private String Receiver_name; 			// 接收人
	private String Msg_content; 			// 短信内容(必填)
	private String Receiver_company; 		// 接收人公司
	private String Receiver_role; 			// 接收人角色
	private String Send_datetime; 			// 发送日期时间（为null为立即发送）
	private Integer Repeat_times; 			// 重送次数（默认为1）
	private Integer Repeat_interval; 		// 重送间隔(默认为60分钟)
	private String Application_number; 		// 申请号
	private String External_contract_nbr; 	// 合同号

	public Msg() {
		super();
	}

	public Msg(String request_sys, String request_user, String receiver_name, String msg_content,
			String receiver_company, String receiver_role, String send_datetime, Integer repeat_times,
			Integer repeat_interval, String application_number, String external_contract_nbr) {
		super();
		Request_sys = request_sys;
		Request_user = request_user;
		Receiver_name = receiver_name;
		Msg_content = msg_content;
		Receiver_company = receiver_company;
		Receiver_role = receiver_role;
		Send_datetime = send_datetime;
		Repeat_times = repeat_times;
		Repeat_interval = repeat_interval;
		Application_number = application_number;
		External_contract_nbr = external_contract_nbr;
	}

	public String getRequest_sys() {
		return Request_sys;
	}

	public void setRequest_sys(String request_sys) {
		Request_sys = request_sys;
	}

	public String getRequest_user() {
		return Request_user;
	}

	public void setRequest_user(String request_user) {
		Request_user = request_user;
	}

	public String getReceiver_name() {
		return Receiver_name;
	}

	public void setReceiver_name(String receiver_name) {
		Receiver_name = receiver_name;
	}

	public String getMsg_content() {
		return Msg_content;
	}

	public void setMsg_content(String msg_content) {
		Msg_content = msg_content;
	}

	public String getReceiver_company() {
		return Receiver_company;
	}

	public void setReceiver_company(String receiver_company) {
		Receiver_company = receiver_company;
	}

	public String getReceiver_role() {
		return Receiver_role;
	}

	public void setReceiver_role(String receiver_role) {
		Receiver_role = receiver_role;
	}

	public String getSend_datetime() {
		return Send_datetime;
	}

	public void setSend_datetime(String send_datetime) {
		Send_datetime = send_datetime;
	}

	public Integer getRepeat_times() {
		return Repeat_times;
	}

	public void setRepeat_times(Integer repeat_times) {
		Repeat_times = repeat_times;
	}

	public Integer getRepeat_interval() {
		return Repeat_interval;
	}

	public void setRepeat_interval(Integer repeat_interval) {
		Repeat_interval = repeat_interval;
	}

	public String getApplication_number() {
		return Application_number;
	}

	public void setApplication_number(String application_number) {
		Application_number = application_number;
	}

	public String getExternal_contract_nbr() {
		return External_contract_nbr;
	}

	public void setExternal_contract_nbr(String external_contract_nbr) {
		External_contract_nbr = external_contract_nbr;
	}

	@Override
	public String toString() {
		return "Msg [Request_sys=" + Request_sys + ", Request_user=" + Request_user + ", Receiver_name=" + Receiver_name
				+ ", Msg_content=" + Msg_content + ", Receiver_company=" + Receiver_company + ", Receiver_role="
				+ Receiver_role + ", Send_datetime=" + Send_datetime + ", Repeat_times=" + Repeat_times
				+ ", Repeat_interval=" + Repeat_interval + ", Application_number=" + Application_number
				+ ", External_contract_nbr=" + External_contract_nbr + "]";
	}

}
