package com.Zackeus.WeChat_YuLon.modules.wechat.web;

import java.util.Calendar;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.validation.groups.Default;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.Zackeus.WeChat_YuLon.common.config.MsgConfig;
import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.service.valid.Register;
import com.Zackeus.WeChat_YuLon.common.utils.AssertUtil;
import com.Zackeus.WeChat_YuLon.common.utils.IdGen;
import com.Zackeus.WeChat_YuLon.common.utils.Logs;
import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StringUtils;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import com.Zackeus.WeChat_YuLon.common.web.BaseHttpController;
import com.Zackeus.WeChat_YuLon.modules.wechat.config.WeChatConfig;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.OrderDetail;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatRegister;
import com.Zackeus.WeChat_YuLon.modules.wechat.entity.WeChatUser;
import com.Zackeus.WeChat_YuLon.modules.wechat.service.WeChatLoginService;
import com.Zackeus.WeChat_YuLon.modules.wechat.utils.WXUtils;

/**
 * 
 * @Title:WeChatUserController
 * @Description:TODO(微信核实注册Controller)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月8日 下午3:31:48
 */
@Controller
@RequestMapping("/wechat/sys")
public class WeChatLoginController extends BaseHttpController {

	@Autowired
	WeChatLoginService weChatService;

	@Autowired
	MsgConfig msgConfig;

	/**
	 * 
	 * @Title：verify
	 * @Description: TODO(微信用户身份核实) @see：
	 * @param session
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/verify", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.POST)
	public void verify(@Validated({ Default.class }) @RequestBody WeChatRegister weChatRegister, HttpSession session,
			HttpServletRequest request, HttpServletResponse response) {

		weChatRegister.setName("王洁");
		weChatRegister.setIdCard("610121198909074245");
		weChatRegister.setPhoneNum("15029673125");

		// 根据待核实身份信息查询符合的合同号列表
		List<OrderDetail> orderDetails = weChatService.getOrderDetails(weChatRegister);
		AssertUtil.isTrue(ObjectUtils.isNotEmpty(orderDetails), HttpStatus.WE_CHAT_REGISTERED_FAIL,
				"此身份信息无法识别.");

		WeChatUser weChatUser = weChatService.code2Session(weChatRegister.getCode());
		AssertUtil.isTrue(ObjectUtils.isNotEmpty(weChatUser), HttpStatus.WE_CHAT_REGISTERED_FAIL, "微信登录凭证校验失败, 请重试.");

		weChatUser = WXUtils.decryptEncryptedData(weChatRegister.getEncryptedData(), weChatUser.getSessionkey(),
				weChatRegister.getIv());
		AssertUtil.isTrue(ObjectUtils.isNotEmpty(weChatUser), HttpStatus.WE_CHAT_REGISTERED_FAIL, "微信信息解密失败, 请重试.");

		String smsCode = IdGen.getRandom(6);
		Logs.info("短信驗證碼：" + smsCode);

		// 发送短信验证码
		// HttpClientResult httpClientResult =
		// SendMsgUtil.sendSMS(msgConfig.getSmsMsgUrl(),
		// new SMSMag(msgConfig.getDefaultRequestSys(),
		// msgConfig.getDefaultRequestSys(), weChatRegister.getName(),
		// "验证码: " + smsCode + " (5分钟内有效), 请不要将短信验证码透露给他人。",
		// msgConfig.getDefaultReceiverCompany(),
		// msgConfig.getDefaultReceiverRole(), null, 1, 60, null, null,
		// weChatRegister.getPhoneNum(),
		// msgConfig.getDefaultPlatform()));
		// AssertUtil.isTrue(HttpStatus.SC_OK == httpClientResult.getCode(),
		// httpClientResult.getCode(), "发送验证码失败，请重试.");
		// AssertUtil.isTrue(HttpStatus.SC_SUCCESS ==
		// JSON.parseObject(httpClientResult.getContent()).getIntValue("Code"),
		// httpClientResult.getCode(), "发送验证码失败，请重试.");

		weChatRegister.setOrderDetails(orderDetails);
		weChatRegister.setSmsCode(smsCode);
		weChatRegister.setSmsTime(Calendar.getInstance().getTimeInMillis());
		weChatUser.setWeChatRegister(weChatRegister);

		// 将注册信息注入session
		request.getSession().setAttribute(WeChatConfig.WE_CHAT_USER, weChatUser);
		renderCookie(response, new AjaxResult(HttpStatus.SC_SUCCESS, "核实信息成功"));
	}

	/**
	 * 
	 * @Title：smsCode
	 * @Description: TODO(获取短信验证码) @see：
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/smsCode", produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.GET)
	public void smsCode(HttpServletRequest request, HttpServletResponse response) {

		WeChatUser weChatUser = (WeChatUser) request.getSession().getAttribute(WeChatConfig.WE_CHAT_USER);

		String smsCode = IdGen.getRandom(6);
		Logs.info("短信驗證碼：" + smsCode);

		// 发送短信验证码
		// HttpClientResult httpClientResult =
		// SendMsgUtil.sendSMS(msgConfig.getSmsMsgUrl(),
		// new SMSMag(msgConfig.getDefaultRequestSys(),
		// msgConfig.getDefaultRequestSys(),
		// weChatUser.getWeChatRegister().getName(), "验证码: " + smsCode + "
		// (5分钟内有效), 请不要将短信验证码透露给他人。",
		// msgConfig.getDefaultReceiverCompany(),
		// msgConfig.getDefaultReceiverRole(), null, 1, 60, null,
		// null, weChatUser.getWeChatRegister().getPhoneNum(),
		// msgConfig.getDefaultPlatform()));
		// AssertUtil.isTrue(HttpStatus.SC_OK == httpClientResult.getCode(),
		// httpClientResult.getCode(), "发送验证码失败，请重试.");
		// AssertUtil.isTrue(HttpStatus.SC_SUCCESS ==
		// JSON.parseObject(httpClientResult.getContent()).getIntValue("Code"),
		// httpClientResult.getCode(), "发送验证码失败，请重试.");

		// 更新注册信息
		weChatUser.getWeChatRegister().setSmsCode(smsCode);
		weChatUser.getWeChatRegister().setSmsTime(Calendar.getInstance().getTimeInMillis());
		request.getSession().setAttribute(WeChatConfig.WE_CHAT_USER, weChatUser);

		renderJson(response, new AjaxResult(HttpStatus.SC_SUCCESS, "发送验证码成功"));
	}

	/**
	 * 
	 * @Title：register
	 * @Description: TODO(信息注册)
	 * @see：
	 * @param weChatRegister
	 * @param session
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.POST)
	public void register(@Validated({ Default.class, Register.class }) @RequestBody WeChatRegister weChatRegister,
			HttpSession session, HttpServletRequest request, HttpServletResponse response) {
		
		WeChatUser weChatUser = (WeChatUser) request.getSession().getAttribute(WeChatConfig.WE_CHAT_USER);
		
		AssertUtil.isTrue(StringUtils.equals(weChatUser.getWeChatRegister().getSmsCode(), weChatRegister.getSmsCode()),
				HttpStatus.WE_CHAT_REGISTERED_FAIL, "验证码错误，请重试.");
		
		weChatService.registerWechatUser(weChatUser);
		
		renderJson(response, new AjaxResult(HttpStatus.SC_SUCCESS, "注册信息成功"));
	}

}
