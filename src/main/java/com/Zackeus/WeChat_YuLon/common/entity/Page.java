package com.Zackeus.WeChat_YuLon.common.entity;

import java.io.Serializable;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;

/**
 * 
 * @Title:Page
 * @Description:TODO(分页实体)
 * @Company:
 * @author zhou.zhang
 * @param <T>
 * @date 2018年8月6日 上午9:27:28
 */
public class Page<T> implements Serializable {

	private static final long serialVersionUID = 1L;

	private Integer code; 			// 数据状态的字段名称 陈功默认为0
	private String msg; 			// 状态信息的字段名称
	private Integer page; 			// 当前页码
	private Integer pageSize; 		// 每页限制条数
	private Boolean useFlag; 		// 是否启动插件。如果不启动，则不作分页
	private Boolean checkFlag; 		// 是否检测页码有效性，如果为true，则页码大于最大页数，则抛出异常
	private Boolean cleanOrderBy; 	// 是否清除最后order by后面的语句
	private Integer total;			// 总条数，插件会回填这个值
	private Integer totalPage; 		// 总页数，插件会回填这个值
	private List<T> list;			// 分页实体数据
	
	public Page() {
		super();
	}
	
	/**
	 * 构造方法(初始化显示条数)
	 * @param pageSize 限制条数
	 */
	public Page(Integer pageSize) {
		this(null, null, null, pageSize, null, null, null, null, null);
	}
	
	/**
	 * 构造方法(初始化页码和显示条数)
	 * @param page 页码
	 * @param pageSize 限制条数
 	 */
	public Page(Integer page, Integer pageSize) {
		this(null, null, page, pageSize, null, null, null, null, null);
	}
	
	/**
	 * 构造方法(初始化数据状态和状态信息)
	 * @param page 页码
	 * @param pageSize 限制条数
 	 */
	public Page(Integer code, String msg) {
		this(code, msg, null, null, null, null, null, null, null);
	}
	
	public Page(Integer code, String msg, Integer page, Integer pageSize, Boolean useFlag, Boolean checkFlag,
			Boolean cleanOrderBy, Integer total, Integer totalPage) {
		super();
		this.code = code;
		this.msg = msg;
		this.page = page;
		this.pageSize = pageSize;
		this.useFlag = useFlag;
		this.checkFlag = checkFlag;
		this.cleanOrderBy = cleanOrderBy;
		this.total = total;
		this.totalPage = totalPage;
	}
	
	/**
	 * 构造方法
	 * @param request 传递 repage 参数
	 */
	public Page(HttpServletRequest request) {
		// 默认数据查询成功
		this(0, "");
		
		// 设置页码参数（传递page参数，来记住页码）
		if (StringUtils.isNumeric(request.getParameter("page"))) {
			this.setPage(Integer.parseInt(request.getParameter("page")));
		} else if (request.getAttribute("page") instanceof Integer) {
			this.setPage((Integer) request.getAttribute("page"));
		}
		
		// 设置页面大小参数（传递pageSize参数，来记住页码大小）
		if (StringUtils.isNumeric(request.getParameter("pageSize"))) {
			this.setPageSize(Integer.parseInt(request.getParameter("pageSize")));
		} else if (request.getAttribute("pageSize") instanceof Integer) {
			this.setPageSize((Integer) request.getAttribute("pageSize"));
		}
	}
	
	public Integer getCode() {
		return code;
	}

	public void setCode(Integer code) {
		this.code = code;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public Integer getPage() {
		return page;
	}

	public void setPage(Integer page) {
		this.page = page;
	}

	public Integer getPageSize() {
		return pageSize;
	}

	public void setPageSize(Integer pageSize) {
		this.pageSize = pageSize;
	}
	
	public Boolean getUseFlag() {
		return useFlag;
	}

	public void setUseFlag(Boolean useFlag) {
		this.useFlag = useFlag;
	}

	public Boolean getCheckFlag() {
		return checkFlag;
	}

	public void setCheckFlag(Boolean checkFlag) {
		this.checkFlag = checkFlag;
	}

	public Boolean getCleanOrderBy() {
		return cleanOrderBy;
	}

	public void setCleanOrderBy(Boolean cleanOrderBy) {
		this.cleanOrderBy = cleanOrderBy;
	}

	public Integer getTotal() {
		return total;
	}

	public void setTotal(Integer total) {
		this.total = total;
	}

	public Integer getTotalPage() {
		return totalPage;
	}

	public void setTotalPage(Integer totalPage) {
		this.totalPage = totalPage;
	}
	
	public List<T> getList() {
		return list;
	}

	public void setList(List<T> list) {
		this.list = list;
	}

    @Override
    public String toString() {
        return ReflectionToStringBuilder.toString(this);
    }
}
