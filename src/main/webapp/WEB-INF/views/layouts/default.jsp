<%@ page contentType="text/html;charset=UTF-8"%>
<%@ include file="/WEB-INF/views/include/taglib.jsp"%>
<%@ taglib prefix="sitemesh" uri="http://www.opensymphony.com/sitemesh/decorator" %>
<!DOCTYPE html>
<html style="overflow-x:auto;overflow-y:auto;height:100%;">
<head>
	<title><sitemesh:title/> - Powered By Zackues</title>
	<%@include file="/WEB-INF/views/include/head.jsp" %>
	<sitemesh:head/>		
</head>
<body <sitemesh:getProperty property="body.class" writeEntireProperty="true" />>
	<sitemesh:body/>
	<%@include file="/WEB-INF/views/include/tail.jsp" %>
</body>
</html>