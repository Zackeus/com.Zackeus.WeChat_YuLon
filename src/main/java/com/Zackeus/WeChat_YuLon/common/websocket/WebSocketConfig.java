package com.Zackeus.WeChat_YuLon.common.websocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * 
 * @Title:WebSocketConfig
 * @Description:TODO(websocket配置类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月19日 上午8:44:51
 */
@Configuration
@EnableWebMvc
@EnableWebSocket
public class WebSocketConfig extends WebMvcConfigurerAdapter implements WebSocketConfigurer {

	/**
	 * 配置websocket入口，允许访问的域、注册Handler、SockJs支持和拦截器
	 */
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(webSocketHandler(), "/websocket/socketsever").addInterceptors(webSocketInterceptor());
		registry.addHandler(webSocketHandler(), "/sockjs/socketsever").addInterceptors(webSocketInterceptor()).withSockJS();
	}
	
	@Bean
	public WebSocketHandler webSocketHandler() {
		return new WebSocketHandler();
	}

	@Bean
	public WebSocketInterceptor webSocketInterceptor() {
		return new WebSocketInterceptor();
	}
}
