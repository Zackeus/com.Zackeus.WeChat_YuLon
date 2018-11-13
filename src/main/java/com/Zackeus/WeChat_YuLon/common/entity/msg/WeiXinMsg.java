package com.Zackeus.WeChat_YuLon.common.entity.msg;

import java.io.Serializable;

/**
 * 微信消息类
 * 
 * @author zhou.zhang
 *
 */
public class WeiXinMsg extends Msg implements Serializable {

	private static final long serialVersionUID = 1L;

	private String Receiver_userid; 	// 员工ID（必填）
	private String Receiver_partyid; 	// 组ID（必填）
	private String Agentid; 			// 应用ID（必填）

	public WeiXinMsg() {
		super();
	}

	public WeiXinMsg(String request_sys, String request_user, String receiver_name, String msg_content,
			String receiver_company, String receiver_role, String send_datetime, Integer repeat_times,
			Integer repeat_interval, String application_number, String external_contract_nbr, String relation_public,
			String receiver_userid, String receiver_partyid, String agentid) {
		super(request_sys, request_user, receiver_name, msg_content, receiver_company, receiver_role, send_datetime,
				repeat_times, repeat_interval, application_number, external_contract_nbr);
		Receiver_userid = receiver_userid;
		Receiver_partyid = receiver_partyid;
		Agentid = agentid;
	}

	public String getReceiver_userid() {
		return Receiver_userid;
	}

	public void setReceiver_userid(String receiver_userid) {
		Receiver_userid = receiver_userid;
	}

	public String getReceiver_partyid() {
		return Receiver_partyid;
	}

	public void setReceiver_partyid(String receiver_partyid) {
		Receiver_partyid = receiver_partyid;
	}

	public String getAgentid() {
		return Agentid;
	}

	public void setAgentid(String agentid) {
		Agentid = agentid;
	}

	@Override
	public String toString() {
		return super.toString() + " WeiXinMsg [Receiver_userid=" + Receiver_userid + ", Receiver_partyid=" + Receiver_partyid + ", Agentid="
				+ Agentid + "]";
	}

}
