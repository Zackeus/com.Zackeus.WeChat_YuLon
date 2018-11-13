layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest',
	customerFrom: '{/}' + ctxStatic + '/layui/lay/custom/from'
})

layui.use(['layuiRequest','customerFrom','form','layer'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        layuiRequest = layui.layuiRequest,
        customerFrom = layui.customerFrom;
    
    // 接口语音外呼
    form.on('submit(collOutDemo)', function(data) {
    	$.ajax({
			type : 'POST',
			url : ctx + '/sys/demo/voiceCallTest',
			data: {
				userId: data.field.userId,
				postUrl: data.field.postUrl,
				called: data.field.calledDemo
		    },
			dataType : 'json',
			success : function(result) {
				if (result.code == 0) {
					openCallLay(data.field.calledDemo);
				} else {
					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
				}
			},
			error : function(result) {
				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
			}
		});
    	return false;
    });
    
	function openCallLay(called) {
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
	          content: [ctx + '/sys/agent/popUp/2/' + called, 'no'],
	          success: function(layero) {
	              var btn = layero.find('.layui-layer-btn');
	              btn.css('position', 'absolute');
	              btn.css('bottom', '0');
	              btn.css('margin-left', '38%');
	          },
	          yes: function(index, layero) {
	        	  var btn = layero.find('.layui-layer-btn0');
	        	  $.ajax({
						type : 'POST',
						url : ctx + '/sys/demo/voiceCallEndTest',
						dataType : 'json',
						beforeSend: function() {
							btn.text("挂断中...").attr("disabled","disabled").addClass("layui-disabled");
						},
						success : function(result) {
							if (result.code == 0) {
								layer.close(index);
							} else {
								layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
								btn.text("挂断").attr("disabled",false).removeClass("layui-disabled");
							}
						},
						error : function(result) {
							btn.text("挂断").attr("disabled",false).removeClass("layui-disabled");
							layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
						}
					});
	          }
	   });
	}
	
	// 通话记录查询
    form.on('submit(search)', function(data) {
    	$.ajax({
			type : 'POST',
			url : ctx + '/sys/demo/callRecordManage',
			data: {
				userId: data.field.userId,
				page: data.field.page,
				pageSize: data.field.pageSize,
				callid: data.field.callid,
				userName: data.field.userName,
				type: data.field.type
		    },
			dataType : 'json',
			success : function(result) {
				if (result.code == 0) {
					layer.msg(result.msg, {icon: 6,time: 1000});
				} else {
					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
				}
			},
			error : function(result) {
				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
			}
		});
    	return false;
    });
    
    // 录音回放 
    form.on('submit(playSubmit)', function(data) {
    	data.field.controlSign = 'play';
    	layuiRequest.doPost(data.field, ctx + '/sys/demo/recordPlay/' + data.field.userId, 
    			beforeSend = function() {
    				layer.load();
    			},
    			success = function(result) {
    				layer.closeAll('loading');
    				if (result.code == 0) {
    					layer.msg(result.msg, {icon: 6,time: 1000});
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				// 错误信息
    				layer.closeAll('loading');
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
    	return false;
    });
    
    // 录音停止
    form.on('submit(stopplaySubmit)', function(data) {
    	data.field.controlSign = 'stopplay';
    	layuiRequest.doPost(data.field, ctx + '/sys/demo/recordPlay/' + data.field.userId, 
    			beforeSend = function() {
    				layer.load();
    			},
    			success = function(result) {
    				layer.closeAll('loading');
    				if (result.code == 0) {
    					layer.msg(result.msg, {icon: 6,time: 1000});
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				// 错误信息
    				layer.closeAll('loading');
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
    	return false;
    });
    
    // 录音暂停
    form.on('submit(pauserecordSubmit)', function(data) {
    	data.field.controlSign = 'pauserecord';
    	layuiRequest.doPost(data.field, ctx + '/sys/demo/recordPlay/' + data.field.userId, 
    			beforeSend = function() {
    				layer.load();
    			},
    			success = function(result) {
    				layer.closeAll('loading');
    				if (result.code == 0) {
    					layer.msg(result.msg, {icon: 6,time: 1000});
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				// 错误信息
    				layer.closeAll('loading');
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
    	return false;
    });
    
    // 录音恢复
    form.on('submit(resumerecordSubmit)', function(data) {
    	data.field.controlSign = 'resumerecord';
    	layuiRequest.doPost(data.field, ctx + '/sys/demo/recordPlay/' + data.field.userId, 
    			beforeSend = function() {
    				layer.load();
    			},
    			success = function(result) {
    				layer.closeAll('loading');
    				if (result.code == 0) {
    					layer.msg(result.msg, {icon: 6,time: 1000});
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				// 错误信息
    				layer.closeAll('loading');
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
    	return false;
    });
    
    // 录音快进
    form.on('submit(forefastSubmit)', function(data) {
    	data.field.controlSign = 'forefast';
    	layuiRequest.doPost(data.field, ctx + '/sys/demo/recordPlay/' + data.field.userId, 
    			beforeSend = function() {
    				layer.load();
    			},
    			success = function(result) {
    				layer.closeAll('loading');
    				if (result.code == 0) {
    					layer.msg(result.msg, {icon: 6,time: 1000});
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				// 错误信息
    				layer.closeAll('loading');
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
    	return false;
    });
    
    // 录音快退
    form.on('submit(backfastSubmit)', function(data) {
    	data.field.controlSign = 'backfast';
    	layuiRequest.doPost(data.field, ctx + '/sys/demo/recordPlay/' + data.field.userId, 
    			beforeSend = function() {
    				layer.load();
    			},
    			success = function(result) {
    				layer.closeAll('loading');
    				if (result.code == 0) {
    					layer.msg(result.msg, {icon: 6,time: 1000});
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				// 错误信息
    				layer.closeAll('loading');
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
    	return false;
    });
    
})