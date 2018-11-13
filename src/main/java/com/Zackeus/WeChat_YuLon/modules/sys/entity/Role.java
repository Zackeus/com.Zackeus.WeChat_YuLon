package com.Zackeus.WeChat_YuLon.modules.sys.entity;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Length;

import com.Zackeus.WeChat_YuLon.common.entity.DataEntity;
import com.google.common.collect.Lists;

/**
 * 
 * @Title:Role
 * @Description:TODO(角色Entity)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月10日 上午11:07:01
 */
public class Role extends DataEntity<Role> {
	
	private static final long serialVersionUID = 1L;
	private String name; 				// 角色名称
	private String enName;				// 英文名称
	
	private User user;					// 根据用户ID查询角色列表

	private List<Menu> menuList = Lists.newArrayList(); 	// 拥有菜单列表
	
	public Role() {
		super();
	}
	
	public Role(String id){
		super(id);
	}

	public Role(Principal principal) {
		this();
		this.user = new User(principal.getId(), principal.getLoginName());
	}
	
	public Role(User user) {
		this();
		this.user = user;
	}
	
	@Length(min=1, max=100)
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Length(min=1, max=100)
	public String getEnName() {
		return enName;
	}

	public void setEnName(String enName) {
		this.enName = enName;
	}

	public List<Menu> getMenuList() {
		return menuList;
	}

	public void setMenuList(List<Menu> menuList) {
		this.menuList = menuList;
	}

	public List<String> getMenuIdList() {
		List<String> menuIdList = Lists.newArrayList();
		for (Menu menu : menuList) {
			menuIdList.add(menu.getId());
		}
		return menuIdList;
	}

	public void setMenuIdList(List<String> menuIdList) {
		menuList = Lists.newArrayList();
		for (String menuId : menuIdList) {
			Menu menu = new Menu();
			menu.setId(menuId);
			menuList.add(menu);
		}
	}

	public String getMenuIds() {
		return StringUtils.join(getMenuIdList(), ",");
	}
	
	public void setMenuIds(String menuIds) {
		menuList = Lists.newArrayList();
		if (menuIds != null){
			String[] ids = StringUtils.split(menuIds, ",");
			setMenuIdList(Lists.newArrayList(ids));
		}
	}
	
	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
