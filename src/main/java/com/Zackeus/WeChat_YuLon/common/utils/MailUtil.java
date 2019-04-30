package com.Zackeus.WeChat_YuLon.common.utils;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import java.io.Serializable;
import java.util.Date;
import java.util.Properties;

public final class MailUtil implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	// 邮件发送者地址
	private String sendEmailAddr;
	// 邮件发送者邮箱用户
	private String userName;
	// 邮件发送者邮箱密码
	private String password;
	
	// 属性
	private Properties props;
	
	public MailUtil(String protocol, String host, String sendEmailAddr, String userName, String password) {
		super();
		this.props = new Properties();
		// 传输协议
		this.props.setProperty("mail.transport.protocol", protocol);
		this.props.setProperty("mail.store.protocol", protocol);
		// 开启Debug调试
		this.props.setProperty("mail.debug", "false");
		
		// 存储发送邮件服务器的信息
		this.props.setProperty(String.format("mail.%s.host", protocol), host);
		// 是否要求身份认证
		this.props.setProperty(String.format("mail.%s.auth", protocol), "true");
		this.props.setProperty(String.format("mail.%s.starttls.enable", protocol), "true");
		
		this.props.setProperty("mail.pop3.ssl.enable","true");
		this.props.setProperty("mail.pop3.port", "995");
		this.props.setProperty("mail.pop3.socketFactory.port", "995");
		this.props.setProperty("mail.pop3.socketFactory.class","javax.net.ssl.SSLSocketFactory");
		this.props.setProperty("mail.pop3.socketFactory.fallback", "false");
		
//		this.props.setProperty("mail.imap.ssl.enable","true");
//		this.props.setProperty("mail.imap.port", "993");
//		this.props.setProperty("mail.imap.socketFactory.class","javax.net.ssl.SSLSocketFactory");
		
		this.sendEmailAddr = sendEmailAddr;
		this.userName = userName;
		this.password = password;
	}

	public String getSendEmailAddr() {
		return sendEmailAddr;
	}

	public void setSendEmailAddr(String sendEmailAddr) {
		this.sendEmailAddr = sendEmailAddr;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Properties getProps() {
		return props;
	}

	public void setProps(Properties props) {
		this.props = props;
	}

	public static void activeUser(String to, String code) throws Exception {
		// 1.创建连接对象
		Session session = Session.getDefaultInstance(new Properties(), new Authenticator() {
			@Override
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication("user01@cxx.com", "123456");
			}
		});
		// 2.创建邮件对象
		Message message = new MimeMessage(session);
		message.setFrom(new InternetAddress("user01@cxx.com"));
		message.setRecipient(Message.RecipientType.TO, new InternetAddress(to));
		// 主题
		message.setSubject("欢迎你的注册");
		// 正文
		message.setContent("<h1>来自星云系统的激活邮件，点击链接激活账号：</h1><h3><a href='http://localhost:8081/active?code=" + code
				+ "'>http://localhost:8081/active?code=" + code + "</a></h3>", "text/html;charset=utf-8");
		// 3.发送激活邮件
		Transport.send(message);
	}

	/**
	 * 发送邮件
	 * 
	 * @param emailAddr:收信人邮件地址
	 * @param mailTitle:邮件标题
	 * @param mailConcept:邮件内容
	 */
	public void sendMail(String emailAddr, String mailTitle, String mailConcept) {
		// 根据属性新建一个邮件会话，null参数是一种Authenticator(验证程序) 对象
		Session s = Session.getDefaultInstance(this.props);
		// 设置调试标志,要查看经过邮件服务器邮件命令，可以用该方法
		s.setDebug(false);
		// 由邮件会话新建一个消息对象
		Message message = new MimeMessage(s);
		try {
			// 设置发件人
			Address from = new InternetAddress(this.sendEmailAddr);
			message.setFrom(from);

			// 设置收件人
			Address to = new InternetAddress(emailAddr);
			message.setRecipient(Message.RecipientType.TO, to);

			// 设置主题
			message.setSubject(mailTitle);
			// 设置信件内容
			message.setText(mailConcept);
			// 设置发信时间
			message.setSentDate(new Date());
			// 存储邮件信息
			message.saveChanges();

			Transport transport = s.getTransport();
			// 要填入你的用户名和密码；
			transport.connect(this.userName, this.password);

			// 发送邮件,其中第二个参数是所有已设好的收件人地址
			transport.sendMessage(message, message.getAllRecipients());
			transport.close();
			System.out.println("发送邮件,邮件地址:" + emailAddr + " 标题:" + mailTitle + " 内容:" + mailConcept + "成功!");
		} catch (Exception e) {
			System.out.println(e.getMessage());
			System.out.println(
					"发送邮件,邮件地址:" + emailAddr + " 标题:" + mailTitle + " 内容:" + mailConcept + "失败! 原因是" + e.getMessage());
		}
	}
	
	public void receiveMail() throws MessagingException {
        // 创建Session实例对象  
        Session session = Session.getInstance(props);  
        Store store = session.getStore();  
        store.connect(this.userName, this.password);  
          
        // 获得收件箱  
        Folder folder = store.getFolder("INBOX");  
        /* Folder.READ_ONLY：只读权限 
         * Folder.READ_WRITE：可读可写（可以修改邮件的状态） 
         */  
        folder.open(Folder.READ_WRITE); //打开收件箱  
          
        // 由于POP3协议无法获知邮件的状态,所以getUnreadMessageCount得到的是收件箱的邮件总数  
        System.out.println("未读邮件数: " + folder.getUnreadMessageCount());  
          
        // 由于POP3协议无法获知邮件的状态,所以下面得到的结果始终都是为0  
        System.out.println("删除邮件数: " + folder.getDeletedMessageCount());  
        System.out.println("新邮件: " + folder.getNewMessageCount());  
          
        // 获得收件箱中的邮件总数  
        System.out.println("邮件总数: " + folder.getMessageCount());  
          
        // 得到收件箱中的所有邮件,并解析  
//        Message[] messages = folder.getMessages();  
          
        //释放资源  
        folder.close(true);  
        store.close();
	}
	
	public static void main(String[] args) throws MessagingException {
//		String text="消息发送！！！！";
//		new MailUtil("smtp", "smtp.163.com", "loan_yulon_finance@163.com", "loan_yulon_finance@163.com", "syr391592723").
//		sendMail("zhou.zhang@yulon-finance.com.cn", "来自某某网站", text);
		
//		new MailUtil("pop3", "pop3.163.com", "loan_yulon_finance@163.com", "loan_yulon_finance@163.com", "syr391592723").
//		receiveMail();
		
//		new MailUtil("imap", "imap.163.com", "loan_yulon_finance@163.com", "loan_yulon_finance@163.com", "syr391592723").
//		receiveMail();
		
		new MailUtil("pop3", "10.5.3.3", "fan.chen@yulon-finance.com.cn", "fan.chen@yulon-finance.com.cn", "cf627037#").
		receiveMail();
	}
}
