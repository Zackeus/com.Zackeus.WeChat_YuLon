package com.Zackeus.WeChat_YuLon.common.plugins;

import java.io.Serializable;
import java.util.Properties;

import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.reflection.MetaObject;
import org.apache.ibatis.reflection.SystemMetaObject;

import com.Zackeus.WeChat_YuLon.common.config.GlobalConfig;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.Dialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.DB2Dialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.DerbyDialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.H2Dialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.HSQLDialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.MySQLDialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.OracleDialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.PostgreSQLDialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.SQLServer2005Dialect;
import com.Zackeus.WeChat_YuLon.common.utils.dialect.DB.SybaseDialect;

/**
 * 
 * @Title:BaseInterceptor
 * @Description:TODO(Mybatis插件基类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年8月6日 上午10:23:29
 */
public abstract class BasePlugin implements Interceptor, Serializable {

	private static final long serialVersionUID = 1L;
	
	protected static final String PAGE = "page";
	
	protected static final String DELEGATE = "delegate";
	
	protected static final String DELEGATE_BOUNTSQL = "delegate.boundSql";
	
	protected static final String DELEGATE_BOUNTSQL_SQL = "delegate.boundSql.sql";
	
	protected static final String DELEGATE_MAPPED_STATEMENT = "delegate.mappedStatement";
	
	protected Dialect DIALECT;
	
	/**
	 * 
	 * @Title:getUnProxyObject
	 * @Description: TODO(从代理对象中分离出真实对象)
	 * @param target
	 * @return 非代理StatementHandler对象
	 */
	protected Object getUnProxyObject(Object target) {
		MetaObject metaStatementHandler = SystemMetaObject.forObject(target);
		// 分离代理对象链(由于目标类可能被多个拦截器拦截，从而形成多次代理，通过循环可以分离出最原始的目标类)
		Object object = null;
		
		// 可以分离出最原始的的目标类)  
        while (metaStatementHandler.hasGetter("h")) {  
            object = metaStatementHandler.getValue("h");  
            metaStatementHandler = SystemMetaObject.forObject(object);  
        }  
        
		if (object == null) {
			return target;
		}
		return object;
	}
	
	/**
	 * 
	 * @Title:initProperties
	 * @Description: TODO( 设置属性，支持自定义方言类和制定数据库的方式)
	 * @param p 属性
	 */
    protected void initProperties(Properties p) {
    	Dialect dialect = null;
    	switch (GlobalConfig.getConfig("jdbc.type")) {
    	
		case "db2":
			dialect = new DB2Dialect();
			break;
		case "derby":
			dialect = new DerbyDialect();
			break;
		case "h2":
			dialect = new H2Dialect();
			break;
		case "hsql":
			dialect = new HSQLDialect();
			break;
		case "mysql":
			dialect = new MySQLDialect();
			break;
		case "oracle":
			dialect = new OracleDialect();
			break;
		case "postgre":
			dialect = new PostgreSQLDialect();
			break;
		case "mssql":
		case "sqlserver":
			dialect = new SQLServer2005Dialect();
			break;
		case "sybase":
			dialect = new SybaseDialect();
			break;

		default:
			throw new RuntimeException("mybatis dialect error.");
		}
        DIALECT = dialect;
    }

}
