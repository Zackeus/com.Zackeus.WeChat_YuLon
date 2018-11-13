var onCloseEvent,
	onMessageEvent,
	LAY_CALL,
	LAY_RecordPlay;

layui.use(['layer','layuiRequest'],function(){
    var layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        layuiRequest = layui.layuiRequest;
    
    // 关闭事件
    onCloseEvent = function (event) {
		var closeMsg;
		switch (event.code) {
		
		case 1000:
		case 1001:
			break;
		
		case 1006:
			closeMsg = "验证未通过！";
			openCloseLay(closeMsg);
			break;

		default:
			closeMsg = event.reason;
			if ($.isEmptyObject(closeMsg)) {
				closeMsg = "账号已登出！";
			} 
			openCloseLay(closeMsg);
			break;
		}
	}
    
	// 消息事件
	onMessageEvent = function (event) {
		window.sessionStorage.setItem("eventCode", event.eventCode);
		window.sessionStorage.setItem("eventType", event.eventType);
		switch (event.eventCode) {
		
		// 坐席状态切换
		case 1:
			window.sessionStorage.setItem("agentState", event.additionalContent.agentState);
			$(document.getElementById('sysMain').contentWindow.document).find("#agentState").children('span').text(event.additionalContent.agentStateText);
			$(document.getElementById('sysMain').contentWindow.document).find("#agentState").children('span').css('color', event.additionalContent.agentStateColor);
			break;
			
		// 坐席发起呼叫请求
		case 2:
		// 坐席来电
		case 3:
			openCallLay(event);
			break;
			
		// 语音通话结束
		case 4:
			layer.close(LAY_CALL);
			break;
			
		// 录音播放成功
		case 8:
        	var record = event.content;
        	record.recordTime = (new Date(event.content.endDate) - new Date(event.content.startDate)) / 1000 + 2;
			window.sessionStorage.setItem("record", JSON.stringify(record));
			openRecordLay(event.content);
			break;
		
		// 录音播放失败
		case 9:
			window.sessionStorage.removeItem("record");
			layer.close(LAY_RecordPlay);
			layer.msg('录音播放失败', {icon: 5,time: 2000,shift: 6}, function(){});
			break;
			
		// 录音播放停止
		case 10:
			window.sessionStorage.removeItem("record");
			layer.close(LAY_RecordPlay);
			break;

		default:
			break;
		}
	}
	
	// 消息提示框
	function openCloseLay(msg) {
		layer.open({
			type: 1,
			title: false,
			closeBtn: false,
			area: '300px;',
			shade: 0.8,
			id: 'LAY_Onclose',
			btn: ['确认'],
			btnAlign: 'c',
			moveType: 1,
			zIndex: 999,
			content: '<div style="padding: 50px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300; text-align: center;">' + msg + '请重新登录！</div>',
			success: function(layero) {
				layero.find('.layui-layer-btn').find('.layui-layer-btn0').attr({href : ctx + '/sys/logout'});
			}
	    });
	}
	
	// 呼叫弹屏
	function openCallLay(event) {
		LAY_CALL = layer.open({
	          type: 2,
	          title: false, 
	          closeBtn: false,
	          area: ['390px', '180px'],
	          shade: 0.8, 				
	          shadeClose: false, 		
	          anim: 0, 				
	          isOutAnim: true, 			
	          scrollbar: false, 		
	          id: 'LAY_CALL', 			
	          btn: ['挂断'],
	          btnAlign: 'c',
	          moveType: 1,
	          content: [ctx + '/sys/agent/popUp/' + event.eventCode + '/' + event.content.caller, 'no'],
	          success: function(layero) {
	              var btn = layero.find('.layui-layer-btn');
	              btn.css('position', 'absolute');
	              btn.css('bottom', '0');
	              btn.css('margin-left', '38%');
	          },
	          yes: function(index, layero) {
	        	  layuiRequest.callEnd(ctx + '/sys/agent/voiceCallEnd', layero.find('.layui-layer-btn0'));
	          }
	   });
	}
	
	// 录音回放弹屏
	function openRecordLay(record) {
		LAY_RecordPlay = layer.open({
            type: 2,
            title: '录音回放', 		// 不显示标题栏
            closeBtn: 1,			// 关闭按钮
            area: ['600px', '220px'],
            shade: 0, 				// 遮罩
            shadeClose: false, 		// 是否点击遮罩关闭
            offset: 'b',
            anim: 0, 				// 弹出动画
            isOutAnim: true, 		// 关闭动画
            scrollbar: false, 		// 是否允许浏览器出现滚动条
            maxmin: true, 			// 最大最小化
            id: 'LAY_RecordPlay', 	// 用于控制弹层唯一标识
            moveType: 1,
            content: [ctx + '/sys/agent/recordPlayPage/' + record.recordID + '/' + record.recordTitle, 'no'],
            cancel: function(index, layero) {
            	// 停止录音播放
            	record.controlSign = 'stopplay';
            	layuiRequest.doPost(record, ctx + '/sys/agent/recordPlay', 
            			beforeSend = function() {},
            			success = function(result) {
            				if (result.code != "0") {
            					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
            				} 
            			},
            			error = function(event) {
            				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
            			});
            } 
    	});
		
	}
})