package com.Zackeus.WeChat_YuLon.modules.sys.entity;

import com.Zackeus.WeChat_YuLon.common.entity.DataEntity;

/**
 * 
 * @Title:Dict
 * @Description:TODO(字典Entity)
 * @Company:
 * @author zhou.zhang
 * @date 2018年8月22日 下午2:57:32
 */
public class Dict extends DataEntity<Dict> {

	private static final long serialVersionUID = 1L;

	private String value;			// 数据值
	private String label;			// 标签名
	private String type;			// 类型
	private String description;		// 描述
	private Integer sort = 10;		// 排序

	public Dict() {
		super();
	}

	public Dict(String id) {
		super(id);
	}
	public Dict(String type, String value) {
		super();
		this.type = type;
		this.value = value;
	}

	public Dict(String label, String type, String description, Integer sort) {
		super();
		this.label = label;
		this.type = type;
		this.description = description;
		this.sort = sort;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Integer getSort() {
		return sort;
	}

	public void setSort(Integer sort) {
		this.sort = sort;
	}
	
}
