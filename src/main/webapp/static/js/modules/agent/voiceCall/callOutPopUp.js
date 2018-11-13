layui.use(['layer'], function() {
	var layer = parent.layer === undefined ? layui.layer : top.layer, 
		$ = layui.jquery;
	var hour = 0,
		minute = 0,
		second = 0;
	
	// 监听坐席进入会话
	window.addEventListener('storage', function onStorageChange(event) {
		if (event.key == 'agentState' && window.sessionStorage.getItem("agentState") == 7) {
			setInterval(timer, 1000);
			$('#callEvent').text('通话中');
		}
	});

	function timer() {
		second = second + 1;
		if (second >= 60) {
			second = 0;
			minute = minute + 1;
		}
		
		if (minute >= 60) {
			minute = 0;
			hour = hour + 1;
		}
		$('#callIcon').text(dateFilter(hour) + ':' + dateFilter(minute) + ':' + dateFilter(second));
	}
	
	//值小于10时，在前面补0
	function dateFilter(date) {
	    if(date < 10) {
	    	return "0" + date;
	    }
	    return date;
	}
})