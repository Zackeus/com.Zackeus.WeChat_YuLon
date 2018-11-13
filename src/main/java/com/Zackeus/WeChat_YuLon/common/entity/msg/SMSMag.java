package com.Zackeus.WeChat_YuLon.common.entity.msg;

import java.io.Serializable;

/**
 * 短信消息类
 * 
 * @author zhou.zhang
 *
 */
public class SMSMag extends Msg implements Serializable {

	private static final long serialVersionUID = 1L;

	private String Receiver_Tel; 	// 接收人电话(必填)
	private String Platform; 		// 短信发送平台

	public SMSMag() {
		super();
	}

	public SMSMag(String request_sys, String request_user, String receiver_name, String msg_content,
			String receiver_company, String receiver_role, String send_datetime, Integer repeat_times,
			Integer repeat_interval, String application_number, String external_contract_nbr,
			String receiver_Tel, String platform) {
		super(request_sys, request_user, receiver_name, msg_content, receiver_company, receiver_role, send_datetime,
				repeat_times, repeat_interval, application_number, external_contract_nbr);
		Receiver_Tel = receiver_Tel;
		Platform = platform;
	}

	public String getReceiver_Tel() {
		return Receiver_Tel;
	}

	public void setReceiver_Tel(String receiver_Tel) {
		Receiver_Tel = receiver_Tel;
	}

	public String getPlatform() {
		return Platform;
	}

	public void setPlatform(String platform) {
		Platform = platform;
	}

	@Override
	public String toString() {
		return super.toString() + " SMSMag [Receiver_Tel=" + Receiver_Tel + ", Platform=" + Platform + "]";
	}

}
