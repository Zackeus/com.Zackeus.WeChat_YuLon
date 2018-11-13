layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest',
	customerFrom: '{/}' + ctxStatic + '/layui/lay/custom/from'
})

layui.use(['layuiRequest','form','layer','customerFrom'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        layuiRequest = layui.layuiRequest,
        customerFrom = layui.customerFrom;
    
    $('#closeUser').click(function () {
    	parent.layer.close(parent.layer.getFrameIndex(window.name));
    });
    
    form.on('submit(editUser)', function(data) {
    	layuiRequest.editUser(ctx + '/sys/user/edit', customerFrom.serializeJson($('#editFrom')), $(this));
    	return false;
    });
    
    form.verify({
    	myNumber: function(value, item) {
    		if(value.trim().length != 0 && !/^[-+]?\d*$/.test(value.trim())) {
    			return '只能填写数字';
    		}
    	}
    });
    
})