layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest',
	customerFrom: '{/}' + ctxStatic + '/layui/lay/custom/from'
})

layui.use(['form','layer','table','laytpl','layuiRequest','customerFrom'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        table = layui.table,
        layuiRequest = layui.layuiRequest,
        customerFrom = layui.customerFrom;

    layer.load();
    var callRecordListtIns =  table.render({
        elem: '#callRecordList',
        title: '通话记录表',								//  定义 table 的大标题（在文件导出等地方会用到）layui 2.4.0 新增
        method : 'post',
        contentType: 'application/json',
        url : ctx + '/sys/agent/callRecordManage',
        toolbar: '#callRecordListToolBar',
        cellMinWidth : 50, 							//	（layui 2.2.1 新增）全局定义所有常规单元格的最小宽度（默认：60），一般用于列宽自动分配的情况。其优先级低于表头参数中的 minWidth
        loading : true, 							//	是否显示加载条
        page : true, 								//	开启分页
        limit : 15, 								//	每页显示的条数（默认：10）。值务必对应 limits 参数的选项。优先级低于 page 参数中的 limit 参数。
        limits : [10,15,20,25], 					//	每页条数的选择项
        id : "callRecordList", 						//	设定容器唯一ID
        text: { 									//	自定义文本
            none: '暂无相关数据' 						//	默认：无数据。注：该属性为 layui 2.2.5 开始新增
        },
        parseData: function(res) { 					//解析成 table 组件所规定的数据 layui 2.4.0 开始新增
        	return {
              'code': res.code, 					//解析接口状态
              'msg': res.msg, 						//解析提示文本
              'count': res.total, 					//解析数据长度
              'data': res.list 						//解析数据列表
            };
        },
        request: {									// 定义前端 json 格式
        	  pageName: 'page', 					// 页码的参数名称，默认：page
        	  limitName: 'pageSize' 				// 每页数据量的参数名，默认：limit
        },  
        cols : [[
            {field: 'userName', title: '受理人', align:'center'},
            {field: 'workNo', title: '坐席号', align:'center'},
            {field: 'otherPhoneWorkno', title: '对方座席号', align:'center'},
            {field: 'phoneNumber', title: '座机号', align:'center'},
            {field: 'otherPhone', title: '对方电话号', align:'center'},
            {templet: '#typeTpl', title: '呼叫类型', align:'center'},
            {templet: '#resultTpl', title: '结果', align:'center'},
            {field: 'createDate', title: '发生时间', sort: true, align:'center'},
            {title: '操作', fixed:"right", align: 'center', templet:'#callRecordListBar'}
        ]],
        done: function(res, curr, count) {
        	layer.closeAll('loading');
        }
    });
    
    //监听行工具事件
    table.on('tool(callRecordList)', function(obj){
		switch (obj.event) {
		
		case "play":
			obj.data.agentRecord.controlSign = obj.event;
			recordPlay(obj.data.agentRecord);
			break;
			
		default:
			break;
		}
    });
    
    form.on('submit(search)', function(data) {
    	layer.load();
    	callRecordListtIns.reload({
    		where: customerFrom.serializeJson($("#sesarchForm")),
    		page: {curr: 1},
            done: function(res, curr, count) {
            	layer.closeAll('loading');
            }
    	});
    	return false;
    });
    
    // 录音回放
    function recordPlay(data) {
    	layuiRequest.doPost(
    			data, 
    			ctx + '/sys/agent/recordPlay', 
    			beforeSend = function() {
    				layer.load();
    			},
    			success = function(result) {
    				layer.closeAll('loading');
    				if (result.code != "0") {
    					layer.msg(result.msg, {icon: 5,time: 2000,shift: 6}, function(){});
    				} 
    			},
    			error = function(event) {
    				// 错误信息
    				layer.closeAll('loading');
    				layer.msg('响应失败', {icon: 5,time: 2000,shift: 6}, function(){});
    			});
    }
    
    //控制表格编辑时文本的位置【跟随渲染时的位置】
    $("body").on("click",".layui-table-body.layui-table-main tbody tr td",function() {
        $(this).find(".layui-table-edit").addClass("layui-"+$(this).attr("align"));
    });

})