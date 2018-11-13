package com.Zackeus.WeChat_YuLon.common.utils;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;

/**
 * 
 * @Title:WebUtils
 * @Description:TODO(web 工具类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月11日 下午3:35:36
 */
public class WebUtils extends org.apache.shiro.web.util.WebUtils {
	
	public static final String X_FORWARDED_FOR = "X-Forwarded-For";
	
	public static final String PROXY_CLIENT_IP = "Proxy-Client-IP";

	public static final String WL_PROXY_CLIENT_IP = "WL-Proxy-Client-IP";
	
	public static final String HTTP_CLIENT_IP = "HTTP_CLIENT_IP";
	
	public static final String HTTP_X_FORWARDED_FOR = "HTTP_X_FORWARDED_FOR";
	
	public static final String X_REQUESTED_WITH = "x-requested-with";
	
	public static final String XML_HTTP_REQUEST = "XMLHttpRequest";
	
    public static final String GBK_ENCODING = "GBK";
    
    public static final String UTF_ENCODING = "UTF-8";
    
    public static final String SET_COOKIE = "Set-Cookie";
    
    public static final String COOKIE_KEY = "sid";

	/**
	 * 
	 * @Title：isAjaxRequest
	 * @Description: TODO(是否是Ajax请求)
	 * @see：
	 * @param request
	 * @return
	 */
    public static boolean isAjaxRequest(HttpServletRequest request) {
        String requestedWith = request.getHeader(X_REQUESTED_WITH);
        return StringUtils.isNoneEmpty(requestedWith) && StringUtils.equals(requestedWith, XML_HTTP_REQUEST);
    }
    
    /**
     * 
     * @Title：getIpAddress
     * @Description: TODO(获取请求主机IP地址,如果通过代理进来，则透过防火墙获取真实IP地址)
     * @see：
     * @param request
     * @return
     * @throws IOException
     */
	public static String getIpAddress(HttpServletRequest request) {
		// 获取请求主机IP地址,如果通过代理进来，则透过防火墙获取真实IP地址
		String ip = request.getHeader(X_FORWARDED_FOR);
		if (StringUtils.isEmpty(ip) || StringUtils.UNKNOWN.equalsIgnoreCase(ip)) {
			if (StringUtils.isEmpty(ip) || StringUtils.UNKNOWN.equalsIgnoreCase(ip)) {
				ip = request.getHeader(PROXY_CLIENT_IP);
			}
			if (StringUtils.isEmpty(ip) || StringUtils.UNKNOWN.equalsIgnoreCase(ip)) {
				ip = request.getHeader(WL_PROXY_CLIENT_IP);
			}
			if (StringUtils.isEmpty(ip) || StringUtils.UNKNOWN.equalsIgnoreCase(ip)) {
				ip = request.getHeader(HTTP_CLIENT_IP);
			}
			if (StringUtils.isEmpty(ip) || StringUtils.UNKNOWN.equalsIgnoreCase(ip)) {
				ip = request.getHeader(HTTP_X_FORWARDED_FOR);
			}
			if (StringUtils.isEmpty(ip) || StringUtils.UNKNOWN.equalsIgnoreCase(ip)) {
				ip = request.getRemoteAddr();
			}
		} else if (ip.length() > 15) {
			String[] ips = ip.split(",");
			for (int index = 0; index < ips.length; index++) {
				String strIp = (String) ips[index];
				if (!(StringUtils.UNKNOWN.equalsIgnoreCase(strIp))) {
					ip = strIp;
					break;
				}
			}
		}
		return ip;
	}
	
    /**
     * 
     * @Title：TruncateUrlPage
     * @Description: TODO(解析出url参数中的键值对)
     * @see：
     * @param strURL
     * @return
     */
    public static Map<String, String> truncateUrlPage(String strURL) {
        String strAllParam = null;
        String[] arrSplit = null;
        strURL = strURL.trim();
        arrSplit = strURL.split("[?]");
        return getRequestQuery(strURL.length() > 1 && arrSplit.length > 1 && StringUtils.isNotBlank(arrSplit[1]) ?
        		arrSplit[1] : strAllParam);
    }
    
	/**
	 * 
	 * @Title：URLRequest
	 * @Description: TODO(解析出url参数中的键值对)
	 * @see：
	 * @param URL
	 * @return
	 */
    public static Map<String, String> getRequestQuery(String strUrlParam) {
        Map<String, String> mapRequest = new HashMap<String, String>();
        String[] arrSplit = null;
        if (StringUtils.isBlank(strUrlParam)) {
            return mapRequest;
        }
        //每个键值为一组 
        arrSplit = strUrlParam.split("[&]");
        for (String strSplit : arrSplit) {
            String[] arrSplitEqual = null;
            arrSplitEqual = strSplit.split("[=]");
            //解析出键值
            if (arrSplitEqual.length > 1) {
                //正确解析
                mapRequest.put(arrSplitEqual[0], arrSplitEqual[1]);
            } else if (!StringUtils.equals(StringUtils.EMPTY, arrSplitEqual[0])) {
                //只有参数没有值，不加入
                mapRequest.put(arrSplitEqual[0], StringUtils.EMPTY);
            }
        }
        return mapRequest;
    }
    
    /**
     * 
     * @Title：isHeadTrue
     * @Description: TODO(判断请求头是否包含某参数)
     * @see：
     * @param request
     * @param paramName
     * @return
     */
    public static boolean isHeadTrue(ServletRequest request, String paramName) {
    	String value = org.apache.shiro.util.StringUtils.clean(toHttp(request).getHeader(paramName));
    	return StringUtils.isNotBlank(value);
    }

}