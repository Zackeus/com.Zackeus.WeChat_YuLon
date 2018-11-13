<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/views/include/taglib.jsp"%>
<html>
<head>
	<title>呼叫中心</title>
	<meta name="decorator" content="default"/>
	<link rel="icon" href="${ctxStatic}/images/favicon.ico">
</head>
<body class="loginBody">
	<form class="layui-form">
		<div class="login_face"><img src="${ctxStatic}/images/face.jpg" class="userAvatar"></div>
		<div class="layui-form-item input-item">
			<label for="userName">用户名</label>
			<input id="userName" name="userName" type="text" placeholder="请输入用户名" class="layui-input" autocomplete="off" lay-verify="required">
		</div>
		<div class="layui-form-item input-item">
			<label for="passWord">密码</label>
			<input id="passWord" name="passWord" type="password" placeholder="请输入密码" class="layui-input" autocomplete="off" lay-verify="required">
		</div>
		<div class="layui-form-item">
			<button class="layui-btn layui-block" lay-filter="login" lay-submit>登录</button>
		</div>
		<div class="layui-form-item layui-row">
			<a href="javascript:;" class="seraph icon-qq layui-col-xs4 layui-col-sm4 layui-col-md4 layui-col-lg4"></a>
			<a href="javascript:;" class="seraph icon-wechat layui-col-xs4 layui-col-sm4 layui-col-md4 layui-col-lg4"></a>
			<a href="javascript:;" class="seraph icon-sina layui-col-xs4 layui-col-sm4 layui-col-md4 layui-col-lg4"></a>
		</div>
	</form>
	<script type="text/javascript" src="${ctxStatic}/js/login.js"></script>
</body>
</html>