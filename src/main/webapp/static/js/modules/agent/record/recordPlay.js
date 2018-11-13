layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest'
})

layui.use(['layuiRequest','layer','jquery'],function() {
	var $ = layui.jquery,
		layer = parent.layer === undefined ? layui.layer : top.layer,
		layuiRequest = layui.layuiRequest;
	// Settings
	var	shuffle = localStorage.shuffle || 'false',
		record = JSON.parse(window.sessionStorage.getItem("record"));

	var currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
		timeout,
		nowTime = 0, // 当前播放时间
		sliderTime = 0, // 滑动时间
		contrastTime,
		isPlaying = true;
	var volume = localStorage.volume || 0.5;

	// Volume slider
	var setVolume = function(value){
		$('.volume .pace').css('width', value * 100 + '%');
		$('.volume .slider a').css('left', value * 100 + '%');
	}

	var volume = localStorage.volume || 0.5;
	$('.volume .slider').slider({max: 1, min: 0, step: 0.01, value: volume, slide: function(event, ui){
		setVolume(ui.value);
		$(this).addClass('enable');
		$('.mute').removeClass('enable');
	}, stop: function(){
		$(this).removeClass('enable');
	}}).children('.pace').css('width', volume * 100 + '%');

	$('.mute').click(function(){
		setVolume($(this).data('volume'));
		$(this).removeClass('enable');
	});

	var beforeLoad = function(){
		var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
		$('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) +'%');
	}

	// 更新进度栏
	var setProgress = function(value){
		if (!isPlaying) {
			$('.playback').addClass('playing');
		}
		
		var currentSec = parseInt(value % 60) < 10 ? '0' + parseInt(value % 60) : parseInt(value % 60), //秒
				ratio = value / record.recordTime * 100; // 播放百分比进度

		$('.timer').html(parseInt(value / 60) + ':' + currentSec);
		$('.progress .pace').css('width', ratio + '%');
		$('.progress .slider a').css('left', ratio + '%');
	}
	
	// 更新进度栏
	var updateProgress = function() {
		if (nowTime >= record.recordTime) {
			clearInterval(timeout);
			return;
		}
		nowTime += 1;
		contrastTime = nowTime;
		setProgress(nowTime);
	}
	
	// 播放\暂停
	$('.playback').on('click', function(){
		if ($(this).hasClass('playing')){
			// 暂停
			pause();
		} else {
			// 播放
			play();
		}
	});
	
	// 进度栏滑动监听
	$('.progress .slider').slider({step: 0.1, slide: function(event, ui) {
		$(this).addClass('enable');
		sliderTime = record.recordTime * ui.value / 100; 
	}, stop: function(event, ui) {
		var fastTime = contrastTime - sliderTime;
		if (!isPlaying) {
			//当为暂停状态时先改变为恢复态再进行快进 快退
			record.controlSign = 'resumerecord';
	    	layuiRequest.doPost(record, ctx + '/sys/agent/recordPlay', 
	    			beforeSend = function() {},
	    			success = function(result) {
	    				if (result.code == "0") {
	    					$('.playback').addClass('playing');
	    					timeout = setInterval(updateProgress, 1000);
	    					isPlaying = true;
	    					recordfast(sliderTime, fastTime);
	    				} else {
	    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
	    				}
	    			},
	    			error = function(event) {
	    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
	    			});
		} else {
			recordfast(sliderTime, fastTime);
		}
	}});
	
	// 播放
	var play = function(){
		record.controlSign = 'resumerecord';
    	layuiRequest.doPost(record, ctx + '/sys/agent/recordPlay', 
    			beforeSend = function() {},
    			success = function(result) {
    				if (result.code == "0") {
    					$('.playback').addClass('playing');
    					timeout = setInterval(updateProgress, 1000);
    					isPlaying = true;
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
	}
	
	// 暂停
	var pause = function(){
		record.controlSign = 'pauserecord';
		layuiRequest.doPost(record, ctx + '/sys/agent/recordPlay', 
    			beforeSend = function() {},
    			success = function(result) {
    				if (result.code == "0") {
    					$('.playback').removeClass('playing');
    					clearInterval(timeout);
    					isPlaying = false;
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
	}
	
	// 录音快进 快退
	var recordfast = function (sliderTime, fastTime) {
		record.fastTime = Math.abs(parseInt(fastTime));
		if (fastTime < 0) {
			// 快进
			record.controlSign = 'forefast';
		} else {
			// 快退
			record.controlSign = 'backfast';
		}
		layuiRequest.doPost(record, ctx + '/sys/agent/recordPlay',
    			beforeSend = function() {},
    			success = function(result) {
    				if (result.code == "0") {
    					nowTime = sliderTime; // 更新播放时长
        				setProgress(nowTime);
        				clearInterval(timeout);
        				contrastTime = nowTime;
        				$(this).removeClass('enable');
        				timeout = setInterval(updateProgress, 1000);
    				} else {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				}
    			},
    			error = function(event) {
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
	}
	
	// 上一首
	$('.rewind').on('click', function(){
		layer.msg('功能尚未完善');
	});
	
	// 下一首
	$('.fastforward').on('click', function(){
		layer.msg('功能尚未完善');
	});
	
	// 加载录音
	var loadMusic = function(record){
		$('.playback').addClass('playing');
		timeout = setInterval(updateProgress, 1000);
	}

	loadMusic(record);
})