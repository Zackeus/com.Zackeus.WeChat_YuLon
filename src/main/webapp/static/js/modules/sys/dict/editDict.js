layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest'
})

layui.use(['layuiRequest','form','layer','laytpl'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        layuiRequest = layui.layuiRequest;
    
    $('#closeDict').click(function () {
    	parent.layer.close(parent.layer.getFrameIndex(window.name));
    });
    
    form.on('submit(editDict)', function(data) {
    	layuiRequest.editDict(ctx + '/sys/dict/edit', data.field, $(this));
    	return false;
    });
    
})