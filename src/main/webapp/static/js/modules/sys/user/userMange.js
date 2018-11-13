layui.extend({
	layuiRequest: '{/}' + ctxStatic + '/layui/layuiRequest',
	customerFrom: '{/}' + ctxStatic + '/layui/lay/custom/from'
})

layui.use(['form','layer','table','laytpl','tree','layuiRequest','customerFrom'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        tree = layui.tree,
        table = layui.table,
        layuiRequest = layui.layuiRequest,
        customerFrom = layui.customerFrom,
        treeSelectData;
    
    // 树形菜单下拉选点击
	$(".downpanel").on("click",".layui-select-title",function(e) {
		if (!treeSelectData) {
			getTreeSelect();
		}
		$(".layui-form-select").not($(this).parents(".layui-form-select")).removeClass("layui-form-selected");
		$(this).parents(".downpanel").toggleClass("layui-form-selected");
		layui.stope(e);
	}).on("click","dl i",function(e) {
		layui.stope(e);
	});
	  
	$(document).on("click",function(e) {
		$(".layui-form-select").removeClass("layui-form-selected");
	});
	
	// Select 渲染
	function getTreeSelect() {
	    $.ajax({
			method: 'POST',
			url : ctx + '/sys/office/mange',
			dataType : 'json',
	        success: function (result) {
	            // 选择菜单下拉选
	            layui.tree({
	            	elem:'#classtree',
	            	href:'javascript:;',
	            	nodes:result,
	            	click:function(node) {
	            		var $select=$($(this)[0].elem).parents(".layui-form-select");
	            		$select.removeClass("layui-form-selected").find(".layui-select-title span").html(node.name).end().find("input:hidden[name='office.id']").val(node.id);
	            	}
	            });
	            treeSelectData = result;
	        },
			error : function(result) {
				layer.msg('加载组织架构列表失败', {icon: 5,time: 2000,shift: 6}, function(){});
			}
	    })
	}

    layer.load();
    var userListtIns =  table.render({
        elem: '#userList',
        title: '用户表',								//  定义 table 的大标题（在文件导出等地方会用到）layui 2.4.0 新增
        method : 'post',
        contentType: 'application/json',
        url : ctx + '/sys/user/list',
        toolbar: '#userListToolBar',
        cellMinWidth : 50, 							//	（layui 2.2.1 新增）全局定义所有常规单元格的最小宽度（默认：60），一般用于列宽自动分配的情况。其优先级低于表头参数中的 minWidth
        loading : true, 							//	是否显示加载条
        page : true, 								//	开启分页
        limit : 15, 								//	每页显示的条数（默认：10）。值务必对应 limits 参数的选项。优先级低于 page 参数中的 limit 参数。
        limits : [10,15,20,25], 					//	每页条数的选择项
        id : "userList", 							//	设定容器唯一ID
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
            {templet: '<div>{{d.company.name}}</div>', title: '归属公司', align:'center'},
            {templet: '<div>{{d.office.name}}</div>', title: '归属部门', align:'center'},
            {field: 'loginName', title: '登录名', align:'center'},
            {field: 'agent.workno', templet: '#workNoTpl', title: '坐席工号', align:'center'},
            {field: 'name', title: '姓名', align:'center'},
            {field: 'userTypeName', title: '用户类型', align:'center'},
            {templet: '#phoneTpl', title: '座机', align:'center'},
            {field: 'mobile', title: '手机', align:'center'},
            {title: '操作', fixed:"right", align: 'center', templet:'#timerListBar'}
        ]],
        done: function(res, curr, count) {
        	layer.closeAll('loading');
        }
    });
    
    //监听行工具事件
    table.on('tool(userList)', function(obj){
		switch (obj.event) {
		
		case "edit":
			editUser(obj.data);
			break;
		
		case "cancer":
			cancerUser(obj.data);
			break;
			
		default:
			break;
		}
    });
    
    function editUser(data) {
    	var editUserIndex = layui.layer.open({
            type: 2,
            title: '编辑用户', 		// 不显示标题栏
            closeBtn: 1,			// 关闭按钮
            shade: 0, 				// 遮罩
            shadeClose: false, 		// 是否点击遮罩关闭
            anim: 0, 				// 弹出动画
            isOutAnim: true, 		// 关闭动画
            scrollbar: false, 		// 是否允许浏览器出现滚动条
            maxmin: true, 			// 最大最小化
            id: 'LAY_EditUser', 	// 用于控制弹层唯一标识
            moveType: 1,
            content: [ctx + '/sys/user/edit/' + data.id],
            success : function(layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function(){
                    layui.layer.tips('点击此处返回用户列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            },
            end:function(index) {
            	userListtIns.reload();
           }
    	});
    	layui.layer.full(editUserIndex);
        window.sessionStorage.setItem("editUserIndex", editUserIndex);
        $(window).on("resize",function() {
        	layui.layer.full(window.sessionStorage.getItem("editUserIndex"));
        })
	}
    
    function cancerUser(data) {
        layer.msg("是否注销此账号？", {
        	time: 0, 
        	btn: ['确定', '取消'],
        	btnAlign: 'c',
            btn1: function(index, layero) {
            	layuiRequest.cancelUser(data, index, ctx + '/sys/user/cancel', userListtIns);
            },
            btn2: function(index, layero) {
            	layer.close(index);
            }
        });
    }
    
    form.on('submit(search)', function(data) {
    	layer.load();
    	userListtIns.reload({
    		where: customerFrom.serializeJson($("#sesarchForm")),
    		page: {curr: 1},
            done: function(res, curr, count) {
            	layer.closeAll('loading');
            }
    	});
    	return false;
    });
    
    form.verify({
    	myNumber: function(value, item) {
    		if(value.trim().length != 0 && !/^[-+]?\d*$/.test(value.trim())) {
    			return '只能填写数字';
    		}
    	}
    });  
    
    //控制表格编辑时文本的位置【跟随渲染时的位置】
    $("body").on("click",".layui-table-body.layui-table-main tbody tr td",function() {
        $(this).find(".layui-table-edit").addClass("layui-"+$(this).attr("align"));
    });

})