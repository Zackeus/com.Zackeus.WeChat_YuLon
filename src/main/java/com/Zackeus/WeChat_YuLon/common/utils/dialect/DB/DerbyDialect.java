package com.Zackeus.WeChat_YuLon.common.utils.dialect.DB;

import com.Zackeus.WeChat_YuLon.common.utils.dialect.Dialect;

/**
 * 
 * @Title:DerbyDialect
 * @Description:TODO()
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月6日 下午4:23:48
 */
public class DerbyDialect implements Dialect {
	
    @Override
    public boolean supportsLimit() {
        return false;
	}

    @Override
    public String getLimitString(String sql, int offset, int limit) {
        throw new UnsupportedOperationException("paged queries not supported");
    }

    /**
     * 
     * @Title:getLimitString
     * @Description: TODO(将sql变成分页sql语句,提供将offset及limit使用占位符号(placeholder)替换)
     * @param sql 实际SQL语句
     * @param offset 分页开始纪录条数
     * @param offsetPlaceholder 分页开始纪录条数－占位符号
     * @param limit 分页每页显示纪录条数
     * @param limitPlaceholder 分页纪录条数占位符号
     * @return 包含占位符的分页sql
     */
	public String getLimitString(String sql, int offset,String offsetPlaceholder, int limit, String limitPlaceholder) {
		throw new UnsupportedOperationException( "paged queries not supported" );
	}

}
