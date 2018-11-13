package com.Zackeus.WeChat_YuLon.common.utils.httpClient;

import java.net.URI;

import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;

/**
 * 
 * @Title:MyHttpDelete
 * @Description:TODO(自定义DELETE)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月21日 下午3:52:08
 */
public class MyHttpDelete extends HttpEntityEnclosingRequestBase {
	
	@Override
	public String getMethod() {
		return HttpDelete.METHOD_NAME;
	}

	public MyHttpDelete(final String uri) {
        super();
        setURI(URI.create(uri));
    }

    public MyHttpDelete(final URI uri) {
        super();
        setURI(uri);
    }

    public MyHttpDelete() {
        super();
    }

}
