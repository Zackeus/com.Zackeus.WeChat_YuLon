layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest'
})

layui.use(['layuiRequest','form','layer'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        layuiRequest = layui.layuiRequest;
    
    //语音外呼
    form.on('submit(collOut)', function(data) {
    	layuiRequest.callOut(ctx + '/sys/agent/voiceCallOut/' + data.field.called);
    	return false;
    });
})