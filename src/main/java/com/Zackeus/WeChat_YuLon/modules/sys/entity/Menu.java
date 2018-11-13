package com.Zackeus.WeChat_YuLon.modules.sys.entity;

import java.util.List;

import com.Zackeus.WeChat_YuLon.common.entity.DataEntity;

/**
 * 
 * @Title:Menu
 * @Description:TODO(菜单Entity)
 * @Company:
 * @author zhou.zhang
 * @date 2018年8月10日 上午11:07:33
 */
public class Menu extends DataEntity<Menu> {

	private static final long serialVersionUID = 1L;
	
	private String parentId; 		// 父级标识
	private String name; 			// 菜单名称
	private String icon; 			// 菜单图标
	private Integer sort; 			// 排序
	private String href; 			// 链接
	private boolean spread; 		// 是否展开
	private String sysId; 			// 系统ID
	private List<Menu> children; 	// 子菜单
	
	private String userId;

	public Menu() {
		super();
	}

	public Menu(String id) {
		super(id);
	}
	
	public Menu(User user) {
		this.userId = user.getId();
	}
	
	public Menu(Principal principal) {
		this.userId = principal.getId();
	}
	
	public Menu(Principal principal, String id) {
		super(id);
		this.userId = principal.getId();
	}
	
	public Menu(String parentId, String name, String icon, Integer sort, String href, boolean spread, String sysId,
			List<Menu> children) {
		super();
		this.parentId = parentId;
		this.name = name;
		this.icon = icon;
		this.sort = sort;
		this.href = href;
		this.spread = spread;
		this.sysId = sysId;
		this.children = children;
	}

	public String getParentId() {
		return parentId;
	}

	public void setParentId(String parentId) {
		this.parentId = parentId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public Integer getSort() {
		return sort;
	}

	public void setSort(Integer sort) {
		this.sort = sort;
	}

	public String getHref() {
		return href;
	}

	public void setHref(String href) {
		this.href = href;
	}

	public boolean isSpread() {
		return spread;
	}

	public void setSpread(boolean spread) {
		this.spread = spread;
	}

	public String getSysId() {
		return sysId;
	}

	public void setSysId(String sysId) {
		this.sysId = sysId;
	}

	public List<Menu> getChildren() {
		return children;
	}

	public void setChildren(List<Menu> children) {
		this.children = children;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

}