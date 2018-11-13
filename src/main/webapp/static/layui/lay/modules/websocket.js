layui.define(['jquery','layer'],function(exports) {
	var $ = layui.jquery,
		layer = layui.layer;
	var websocket = {
			// 初始化
			init: function (webUrl, sockUrl) {
				var socket = null;
				if ('WebSocket' in window) {
					socket = new WebSocket('ws://' + webUrl);  
				} else if ('MozWebSocket' in window) {
					socket = new MozWebSocket('ws://' + webUrl);  
				} else {
					// 低版本的浏览器，则用SockJS
					socket = new SockJS('http://' + sockUrl);  
				}
				return socket;
			}
	};
	exports('websocket', websocket);
})
