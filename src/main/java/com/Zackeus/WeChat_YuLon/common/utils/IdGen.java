package com.Zackeus.WeChat_YuLon.common.utils;

import java.io.Serializable;
import java.security.SecureRandom;
import java.util.Random;
import java.util.UUID;

import org.activiti.engine.impl.cfg.IdGenerator;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.mgt.eis.SessionIdGenerator;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

/**
 * 
 * @Title:IdGen
 * @Description:TODO(封装各种生成唯一性ID算法的工具类.)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月7日 上午10:57:58
 */
@Service
@Lazy(false)
public class IdGen implements IdGenerator, SessionIdGenerator {

	private static SecureRandom random = new SecureRandom();
	
	/**
	 * 
	 * @Title：uuid
	 * @Description: TODO(封装JDK自带的UUID, 通过Random数字生成, 中间无-分割.)
	 * @see：
	 * @return
	 */
	public static String uuid() {
		return UUID.randomUUID().toString().replaceAll("-", "");
	}
	
	/**
	 * 
	 * @Title：randomLong
	 * @Description: TODO(使用SecureRandom随机生成Long.)
	 * @see：
	 * @return
	 */
	public static long randomLong() {
		return Math.abs(random.nextLong());
	}

	/**
	 * 
	 * @Title：randomBase62
	 * @Description: TODO(基于Base62编码的SecureRandom随机生成bytes.)
	 * @see：
	 * @param length
	 * @return
	 */
	public static String randomBase62(int length) {
		byte[] randomBytes = new byte[length];
		random.nextBytes(randomBytes);
		return Encodes.encodeBase62(randomBytes);
	}
	
	/**
	 * Activiti ID 生成
	 */
	@Override
	public String getNextId() {
		return IdGen.uuid();
	}

	@Override
	public Serializable generateId(Session session) {
		return IdGen.uuid();
	}
	
	/**
	 * 
	 * @Title：getRandom
	 * @Description: TODO(生成指定位数随机数字)
	 * @see：
	 * @param length
	 * @return
	 */
	public static String getRandom(int length) {
		Random random = new Random();
		String fourRandom = random.nextInt((int) Math.pow(10, length)) + "";
		int randLength = fourRandom.length();
		if (randLength < length) {
			for (int i = 1; i <= length - randLength; i++)
				fourRandom = "0" + fourRandom;
		}
		return fourRandom;
	}
	
	/**
	 * 
	 * @Title：getOrder
	 * @Description: TODO(订单号生成器)
	 * @see：头标签  + 18位
	 * @param header
	 * @return
	 */
	public static String getOrder(String header) {
		String order = String.valueOf(new SnowFlake(1, 1).nextId());
		return StringUtils.isNotBlank(header) ? header + order : order;
	}

	/**
	 * 测试
	 */
	public static void main(String[] args) {
		System.out.println(getOrder("OR"));
		
//		System.out.println(randomBase62(32));
//		System.out.println(IdGen.uuid());
//		System.out.println(IdGen.uuid().length());
//		System.out.println(new IdGen().getNextId());
//		for (int i=0; i<1000; i++){
//			System.out.println(IdGen.randomLong() + "  " + IdGen.randomBase62(5));
//		}
	}

}
