layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest'
})

layui.use(['layuiRequest','form','layer','table','laytpl'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        table = layui.table,
        layuiRequest = layui.layuiRequest;
    
    form.on('submit(addDict)', function(data) {
    	layuiRequest.addDict(ctx + '/sys/dict/add', data.field, $(this));
    	return false;
    });
    
    $('#closeDict').click(function () {
    	parent.layer.close(parent.layer.getFrameIndex(window.name));
    });
    
})