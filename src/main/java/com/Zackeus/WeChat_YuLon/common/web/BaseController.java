package com.Zackeus.WeChat_YuLon.common.web;

import java.beans.PropertyEditorSupport;
import java.io.IOException;
import java.util.Date;
import java.util.Iterator;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.ValidationException;
import javax.xml.rpc.ServiceException;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.UnauthorizedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.ui.Model;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.Zackeus.WeChat_YuLon.common.entity.AjaxResult;
import com.Zackeus.WeChat_YuLon.common.entity.XMLResult;
import com.Zackeus.WeChat_YuLon.common.utils.DateUtils;
import com.Zackeus.WeChat_YuLon.common.utils.JsonMapper;
import com.Zackeus.WeChat_YuLon.common.utils.WebUtils;
import com.Zackeus.WeChat_YuLon.common.utils.exception.MyException;
import com.Zackeus.WeChat_YuLon.common.utils.exception.XmlException;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;
import net.sf.json.JSONObject;

/**
 * 
 * @Title:BaseController
 * @Description:TODO(控制器支持类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月9日 下午5:12:20
 */
@SuppressWarnings("deprecation")
public abstract class BaseController {
	
	/**
	 * 
	 * @Title：addMessage
	 * @Description: TODO(添加Model消息)
	 * @see：
	 * @param model
	 * @param messages
	 */
	protected void addMessage(Model model, String... messages) {
		StringBuilder sb = new StringBuilder();
		for (String message : messages){
			sb.append(message).append(messages.length>1?"<br/>":"");
		}
		model.addAttribute("message", sb.toString());
	}
	
	/**
	 * 
	 * @Title：addMessage
	 * @Description: TODO(添加Flash消息)
	 * @see：
	 * @param redirectAttributes
	 * @param messages
	 */
	protected void addMessage(RedirectAttributes redirectAttributes, String... messages) {
		StringBuilder sb = new StringBuilder();
		for (String message : messages){
			sb.append(message).append(messages.length>1?"<br/>":"");
		}
		redirectAttributes.addFlashAttribute("message", sb.toString());
	}
	
	/**
	 * 
	 * @Title：renderString
	 * @Description: TODO(客户端返回JSON字符串)
	 * @see：
	 * @param response
	 * @param object
	 * @return
	 */
	protected String renderJson(HttpServletResponse response, Object object) {
		return renderString(response, JsonMapper.toJsonString(object), MediaType.APPLICATION_JSON_VALUE);
	}
	
	/**
	 * 
	 * @Title：renderJson
	 * @Description: TODO(客户端返回XML字符串)
	 * @see：
	 * @param response
	 * @param xmlMsg
	 * @return
	 */
	protected String renderXML(HttpServletResponse response, String xmlMsg) {
		return renderString(response, xmlMsg, MediaType.TEXT_XML_VALUE);
	}
	
	/**
	 * 
	 * @Title：renderString
	 * @Description: TODO(客户端返回字符串)
	 * @see：
	 * @param response
	 * @param string
	 * @param type
	 * @return
	 */
	protected String renderString(HttpServletResponse response, String string, String type) {
		try {
			response.reset();
	        response.setContentType(type);
	        response.setCharacterEncoding(WebUtils.UTF_ENCODING);
			response.getWriter().print(string);
			return null;
		} catch (IOException e) {
			return null;
		}
	}
	
	/**
	 * 
	 * @Title：renderInfo
	 * @Description: TODO(处理返回信息；Ajax返回json；普通请求将信息加入Model中并返回)
	 * @see：
	 * @param response
	 * @param url
	 * @param code
	 * @param message
	 * @return
	 */
	@SuppressWarnings("unchecked")
	protected String renderInfo(HttpServletRequest request, HttpServletResponse response, Model model, String url, JSONObject jsonObject) {
		if (WebUtils.isAjaxRequest(request)) {
			return renderJson(response, jsonObject);
		}
		
		Iterator<String> it = jsonObject.keys(); 
		while(it.hasNext()) {
			String key = it.next(); 
			model.addAttribute(key, jsonObject.getString(key));
		}
		return url;
	}
	
	/**
	 * 
	 * @Title：handleMissingServletRequestParameterException
	 * @Description: TODO(400 - 缺少请求参数)
	 * @see：
	 * @param e
	 * @return
	 */
	@ExceptionHandler({MissingServletRequestParameterException.class})
	public String handleMissingServletRequestParameterException(HttpServletRequest request, HttpServletResponse response,
			MissingServletRequestParameterException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "缺少请求参数：" + e.getMessage()));
            return null;
        } else {
            return "sys/400";
        }
	}
	
	/**
	 * 
	 * @Title：handleHttpMessageNotReadableException
	 * @Description: TODO(400 - 参数解析失败)
	 * @see：
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler({HttpMessageNotReadableException.class})
	public String handleHttpMessageNotReadableException(HttpServletRequest request, HttpServletResponse response,
			HttpMessageNotReadableException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "参数解析失败：" + e.getMessage()));
            return null;
        } else {
            return "sys/400";
        }
	}
	
    /**
     * 
     * @Title：runTimeException
     * @Description: TODO(400 - 参数校验异常)
     * @see：
     * @param request
     * @param response
     * @param e
     * @return
     */
    @ExceptionHandler({ MethodArgumentNotValidException.class })
    public String methodArgumentNotValidExceptio(HttpServletRequest request, HttpServletResponse response, 
    		MethodArgumentNotValidException e) {
		if (WebUtils.isAjaxRequest(request)) {
	    	String errorMesssage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
	        renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "参数校验异常：" + errorMesssage));
	        return null;
		} else {
			return "sys/400";
		}
    }
    
    /**
     * 
     * @Title：methodArgumentNotValidExceptio
     * @Description: TODO(400 - 参数绑定失败)
     * @see：
     * @param request
     * @param response
     * @param e
     * @return
     */
    @ExceptionHandler({ BindException.class })
    public String handleBindException(HttpServletRequest request, HttpServletResponse response, 
    		BindException e) {
		if (WebUtils.isAjaxRequest(request)) {
	    	String errorMesssage = e.getBindingResult().getFieldError().getField();
	        renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "参数绑定失败：" + errorMesssage));
	        return null;
		} else {
			return "sys/400";
		}
    }

    /**
     * 
     * @Title：bindException
     * @Description: TODO(400 - 参数校验异常)
     * @see：
     * @param request
     * @param response
     * @param e
     * @return
     */
	@ExceptionHandler({ConstraintViolationException.class})
    public String handleServiceException(HttpServletRequest request, HttpServletResponse response, 
    		ConstraintViolationException e) {
	    Set<ConstraintViolation<?>> violations = e.getConstraintViolations();
	    ConstraintViolation<?> violation = violations.iterator().next();
	    String message = violation.getMessage();
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "参数校验异常:" + message));
            return null;
        } else {
            return "sys/400";
        }
    }
	
	/**
	 * 
	 * @Title：bindException
	 * @Description: TODO(400 - 参数验证失败)
	 * @see：
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler({ValidationException.class})
    public String handleValidationException(HttpServletRequest request, HttpServletResponse response, 
    		ValidationException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "参数验证失败：" + e.getMessage()));
            return null;
        } else {
            return "sys/400";
        }
    }
	
	/**
	 * 
	 * @Title：handleIllegalArgumentException
	 * @Description: TODO(400 - 参数不合法)
	 * @see：
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler({IllegalArgumentException.class})
    public String handleIllegalArgumentException(HttpServletRequest request, HttpServletResponse response, 
    		IllegalArgumentException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "参数不合法：" + e.getMessage()));
            return null;
        } else {
            return "sys/400";
        }
    }
	
	/**
	 * 
	 * @Title：handleIllegalAccessException
	 * @Description: TODO(400 - 安全权限异常)
	 * @see：安全权限异常，一般来说，是由于java在反射时调用了private方法所导致的
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler({IllegalAccessException.class})
    public String handleIllegalAccessException(HttpServletRequest request, HttpServletResponse response, 
    		IllegalAccessException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_BAD_REQUEST, "安全权限异常：" + e.getMessage()));
            return null;
        } else {
            return "sys/400";
        }
    }
	
	/**
	 * 
	 * @Title：handleHttpRequestMethodNotSupportedException
	 * @Description: TODO(405 - 不支持当前请求方法)
	 * @see：
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler({HttpRequestMethodNotSupportedException.class})
    public String handleHttpRequestMethodNotSupportedException(HttpServletRequest request, HttpServletResponse response, 
    		HttpRequestMethodNotSupportedException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_METHOD_NOT_ALLOWED, "不支持当前请求方法：" + e.getMessage()));
            return null;
        } else {
            return "sys/405";
        }
    }
	
	/**
	 * 
	 * @Title：handleHttpMediaTypeNotSupportedException
	 * @Description: TODO(415 - 不支持当前媒体类型)
	 * @see：
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	public String handleHttpMediaTypeNotSupportedException(HttpServletRequest request, HttpServletResponse response,
			HttpMediaTypeNotSupportedException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_UNSUPPORTED_MEDIA_TYPE, "不支持当前媒体类型：" + e.getMessage()));
            return null;
        } else {
            return "sys/415";
        }
	}
    
	/**
	 * 
	 * @Title：authorizationException
	 * @Description: TODO(403 - 授权登录异常)
	 * @see：
	 * @param request
	 * @param response
	 * @return
	 */
    @ExceptionHandler({ UnauthorizedException.class, AuthorizationException.class })
    public String authorizationException(HttpServletRequest request, HttpServletResponse response) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_FORBIDDEN, "当前账号无权进行此操作!!!"));
            return null;
        } else {
            return "sys/403";
        }
    }
    
    /**
     * 
     * @Title：handleServiceException
     * @Description: TODO(500 - 业务逻辑异常)
     * @see：
     * @param request
     * @param response
     * @param e
     * @return
     */
    @ExceptionHandler(ServiceException.class)
    public String handleServiceException(HttpServletRequest request, HttpServletResponse response, ServiceException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_INTERNAL_SERVER_ERROR, "业务逻辑异常：" + e.getMessage()));
            return null;
        } else {
            return "sys/500";
        }
    }
    
    /**
     * 
     * @Title：handleException
     * @Description: TODO(数据库异常)
     * @see：
     * @param request
     * @param response
     * @param e
     * @return
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public String handleException(HttpServletRequest request, HttpServletResponse response, DataIntegrityViolationException e) {
        if (WebUtils.isAjaxRequest(request)) {
            renderJson(response, new AjaxResult(HttpStatus.SC_SQL_SERROR, "操作数据库异常：" + e.getMessage()));
            return null;
        } else {
            return "sys/Error";
        }
    }
    
	/**
	 * 
	 * @Title：schedulerException
	 * @Description: TODO(自定义异常) 
	 * @see：
	 * @param request
	 * @param response
	 * @return
	 */
	@ExceptionHandler({ MyException.class })
	public String schedulerException(HttpServletRequest request, HttpServletResponse response, MyException e) {
		if (WebUtils.isAjaxRequest(request)) {
			renderJson(response, new AjaxResult(e.getErrorCode(), e.getMessage(), e.getObject()));
			return null;
		} else {
			return "sys/Error";
		}
	}
	
	/**
	 * 
	 * @Title：exception
	 * @Description: TODO(未知异常)
	 * @see：
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler({ Exception.class })
	public String exception(HttpServletRequest request, HttpServletResponse response, Exception e) {
		if (WebUtils.isAjaxRequest(request)) {
			renderJson(response, new AjaxResult(HttpStatus.SC_UNKNOWN, "未知的错误：" + e.getMessage()));
			return null;
		} else {
			return "sys/Error";
		}
	}
	
	/**
	 * 
	 * @Title：xmlException
	 * @Description: TODO(XML信息异常)
	 * @see：
	 * @param request
	 * @param response
	 * @param e
	 * @return
	 */
	@ExceptionHandler({ XmlException.class })
	public String xmlException(HttpServletRequest request, HttpServletResponse response, XmlException e) {
		if (WebUtils.isAjaxRequest(request))
			return renderXML(response, new XMLResult(e.getErrorCode(), e.getMessage()).toCommonString());
		else 
			return "sys/Error";
	}
	
	/**
	 * 
	 * @Title：initBinder
	 * @Description: TODO(初始化数据绑定)
	 * @see：
	 * 1. 将所有传递进来的String进行HTML编码，防止XSS攻击
	 * 2. 将字段中Date类型转换为String类型
	 * @param binder
	 */
	@InitBinder
	protected void initBinder(WebDataBinder binder) {
		// String类型转换，将所有传递进来的String进行HTML编码，防止XSS攻击
		binder.registerCustomEditor(String.class, new PropertyEditorSupport() {
			@Override
			public void setAsText(String text) {
				setValue(text == null ? null : StringEscapeUtils.escapeHtml4(text.trim()));
			}
			@Override
			public String getAsText() {
				Object value = getValue();
				return value != null ? value.toString() : "";
			}
		});
		// Date 类型转换
		binder.registerCustomEditor(Date.class, new PropertyEditorSupport() {
			@Override
			public void setAsText(String text) {
				setValue(DateUtils.parseDate(text));
			}
		});
	}
	
}
