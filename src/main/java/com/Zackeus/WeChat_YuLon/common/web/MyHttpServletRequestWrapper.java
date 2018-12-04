package com.Zackeus.WeChat_YuLon.common.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import com.Zackeus.WeChat_YuLon.common.utils.ObjectUtils;
import com.Zackeus.WeChat_YuLon.common.utils.StreamUtils;

/**
 * 
 * @Title:MyHttpServletRequestWrapper
 * @Description:TODO(解决Request流只能读取一次的问题)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月28日 下午5:00:38
 */
public class MyHttpServletRequestWrapper extends HttpServletRequestWrapper {

	private byte[] requestBody = null;

	public MyHttpServletRequestWrapper(HttpServletRequest request) {
		super(request);
		try {
			requestBody = StreamUtils.copyToByteArray(request.getInputStream());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public MyHttpServletRequestWrapper(HttpServletRequest request, Object object, String charset) {
		super(request);
		try {
			requestBody = object.toString().getBytes(charset);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public ServletInputStream getInputStream() throws IOException {
		if (ObjectUtils.isEmpty(requestBody)) {
			requestBody = new byte[0];
		}
		final ByteArrayInputStream bais = new ByteArrayInputStream(requestBody);
		return new ServletInputStream() {
			@Override
			public int read() throws IOException {
				return bais.read();
			}

			@Override
			public boolean isFinished() {
				return Boolean.FALSE;
			}

			@Override
			public boolean isReady() {
				return Boolean.FALSE;
			}

			@Override
			public void setReadListener(ReadListener readListener) {

			}
		};
	}
	
	@Override
	public BufferedReader getReader() throws IOException {
		return new BufferedReader(new InputStreamReader(getInputStream()));
	}

}
