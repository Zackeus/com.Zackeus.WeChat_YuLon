// namespace
var REST = {
	apiURL : null,
	loglevel : 0
};
var cookiestring;
// constructor
REST.Request = function (){
	REST.log("Creating new Request");
	this.uri = null;
	this.method = "GET";
	this.username = null;
	this.password = null;
	this.acceptHeader = "*/*";
	this.contentTypeHeader = null;
	this.async = true;
	this.queryParameters = [];
	this.matrixParameters = [];
	this.formParameters = [];
	this.cookies = [];
	this.headers = [];
	this.entity = null;
	this.isForSpecial = false;
	this.timeout = 120000;
	this.timeoutHandle = null;
}

var sepcailRequest = new XMLHttpRequest();
REST.Request.prototype = {
		execute : function(callback){
			var request = null;
			if (this.isForSpecial)
			{
				if (sepcailRequest != null)
				{
					request = sepcailRequest;
				}
				else
				{
					sepcailRequest = new XMLHttpRequest();
					request = sepcailRequest;
				}
			}
			else
			{
				request = new XMLHttpRequest();
			}
			var url = this.uri;

			for(var i=0;i<this.matrixParameters.length;i++){
				url += ";" + REST.Encoding.encodePathParamName(this.matrixParameters[i][0]);
				url += "=" + REST.Encoding.encodePathParamValue(this.matrixParameters[i][1]);
			}
			for(var i=0;i<this.queryParameters.length;i++){
				if(i == 0)
					url += "?";
				else
					url += "&";
				url += REST.Encoding.encodeQueryParamNameOrValue(this.queryParameters[i][0]);
				url += "=" + REST.Encoding.encodeQueryParamNameOrValue(this.queryParameters[i][1]);
			}
			for(var i=0;i<this.cookies.length;i++){
				document.cookie = escape(this.cookies[i][0]) 
					+ "=" + escape(this.cookies[i][1]);
			}
			request.open(this.method, url, this.async, this.username, this.password);
			
			if ($.browser.msie)
			{	
				if(this.isForSpecial)
				{
					request.timeout = 60000; 
					request.ontimeout = this.timeoutHandle;
				}
				else
			    {
			    	request.timeout = this.timeout;
			    	var httpUrl = this.url;
			    	request.ontimeout = function ()
					{
						try 
						{
//							console.dir("date : " + new Date().format("yyyy-MM-dd hh:mm:ss.S") + "; time out");
//							console.dir("url :" + url);
							agentSetting_debugLogger_error("url is timeout. url : " + httpUrl);
						}
						catch (e)
						{
							
						}
					};
			    }
			}
			if (null != cookiestring && "" != cookiestring)
			{
				request.setRequestHeader('Guid', cookiestring);
			}
			var acceptSet = false;
			var contentTypeSet = false;
			for(var i=0;i<this.headers.length;i++){
				if(this.headers[i][0].toLowerCase() == 'accept')
					acceptSet = this.headers[i][1];
				if(this.headers[i][0].toLowerCase() == 'content-type')
					contentTypeSet = this.headers[i][1];
				request.setRequestHeader(REST.Encoding.encodeHeaderName(this.headers[i][0]),
						REST.Encoding.encodeHeaderValue(this.headers[i][1]));
			}
			if(!acceptSet)
				request.setRequestHeader('Accept', this.acceptHeader);
			REST.log("Got form params: "+this.formParameters.length);
			// see if we're sending an entity or a form
			if(this.entity && this.formParameters.length > 0)
				throw "Cannot have both an entity and form parameters";
			// form
			if(this.formParameters.length > 0){
				if(contentTypeSet && contentTypeSet != "application/x-www-form-urlencoded")
					throw "The ContentType that was set by header value ("+contentTypeSet+") is incompatible with form parameters";
				if(this.contentTypeHeader && this.contentTypeHeader != "application/x-www-form-urlencoded")
					throw "The ContentType that was set with setContentType ("+this.contentTypeHeader+") is incompatible with form parameters";
				contentTypeSet = "application/x-www-form-urlencoded";
				request.setRequestHeader('Content-Type', contentTypeSet);
			}else if(this.entity && !contentTypeSet && this.contentTypeHeader){
				// entity
				contentTypeSet = this.contentTypeHeader;
				request.setRequestHeader('Content-Type', this.contentTypeHeader);
			}
			// we use this flag to work around buggy browsers
			var gotReadyStateChangeEvent = false;
			if(callback){
				request.onreadystatechange = function() {
					gotReadyStateChangeEvent = true;
					REST.log("Got readystatechange");
					REST._complete(this, callback);
				};
			}
			var data = this.entity;
			if(this.entity){
				// Modify by chengaoqi:delete document && element for ie
				if(this.entity instanceof Object){
					if(!contentTypeSet || REST._isJSONMIME(contentTypeSet))
						data = JSON.stringify(this.entity);
				}
			}else if(this.formParameters.length > 0){
				data = '';
				for(var i=0;i<this.formParameters.length;i++){
					if(i > 0)
						data += "&";
					data += REST.Encoding.encodeFormNameOrValue(this.formParameters[i][0]);
					data += "=" + REST.Encoding.encodeFormNameOrValue(this.formParameters[i][1]);
				}
			}
			REST.log("Content-Type set to "+contentTypeSet);
			REST.log("Entity set to "+data);
			request.send(data);
			// now if the browser did not follow the specs and did not fire the events while synchronous,
			// handle it manually
			if(!this.async && !gotReadyStateChangeEvent && callback){
				REST.log("Working around browser readystatechange bug");
				REST._complete(request, callback);
			}
			
			if(!this.async)
				request = null;
		},
		setAccepts : function(acceptHeader){
			REST.log("setAccepts("+acceptHeader+")");
			this.acceptHeader = acceptHeader;
		},
		setCredentials : function(username, password){
			this.password = password;
			this.username = username;
		},
		setEntity : function(entity){
			REST.log("setEntity("+entity+")");
			this.entity = entity;
		},
		setContentType : function(contentType){
			REST.log("setContentType("+contentType+")");
			this.contentTypeHeader = contentType;
		},
		setURI : function(uri){
			REST.log("setURI("+uri+")");
			this.uri = uri;
		},
		setMethod : function(method){
			REST.log("setMethod("+method+")");
			this.method = method;
		},
		setAsync : function(async){
			REST.log("setAsync("+async+")");
			this.async = async;
		},
		addCookie : function(name, value){
			REST.log("addCookie("+name+"="+value+")");
			this.cookies.push([name, value]);
		},
		addQueryParameter : function(name, value){
			REST.log("addQueryParameter("+name+"="+value+")");
			this.queryParameters.push([name, value]);
		},
		addMatrixParameter : function(name, value){
			REST.log("addMatrixParameter("+name+"="+value+")");
			this.matrixParameters.push([name, value]);
		},
		addFormParameter : function(name, value){
			REST.log("addFormParameter("+name+"="+value+")");
			this.formParameters.push([name, value]);
		},
		addHeader : function(name, value){
			REST.log("addHeader("+name+"="+value+")");
			this.headers.push([name, value]);
		},
		setSpecial : function(value) {
			REST.log("setSpecial(" + value + ")");
			this.isForSpecial = value;
		},
		setTimeoutHandle : function(value) {
			this.timeoutHandle = value;
		}
}

REST.log = function(string){
	if(REST.loglevel > 0)
		print(string);
}

REST._complete = function(request, callback){
	REST.log("Request ready state: "+request.readyState);
	if(request.readyState == 4) {
		var entity;
		REST.log("Request status: "+request.status);
		REST.log("Request response: "+request.responseText);
		if(request.status >= 200 && request.status < 300){
			var contentType = request.getResponseHeader("Content-Type");
			if(contentType != null){
				if(REST._isXMLMIME(contentType))
					entity = request.responseXML;
				else if(REST._isJSONMIME(contentType))
					entity = JSON.parse(request.responseText);
				else
					entity = request.responseText;
			}else
				entity = request.responseText;
			var jsonType = request.getResponseHeader("JSON-Type");
			if(jsonType != null){
				if(REST._isJSONMIME(jsonType))
					entity = JSON.parse(request.responseText);
			}
			var Cookie = request.getResponseHeader("Set-GUID");
			if (null != Cookie && "" != Cookie)
			{
				try
				{
					var guid = Cookie.split("=")[1];
					if (cookiestring != guid)
					{
						agentSetting_debugLogger_debug("guid has changed from " + cookiestring + " to "+  guid);
					}
				}
				catch(e)
				{
				}
				cookiestring = Cookie.split("=")[1];
			}
			jsonType =  null;
			contentType = null;
		}
		REST.log("Calling callback with: "+entity);
		callback(request.status, request, entity);
		entity = null;
		request = null;
		callback = null;
	}
}

REST._isXMLMIME = function(contentType){
	return contentType == "text/xml"
			|| contentType == "application/xml"
			|| (contentType.indexOf("application/") == 0
				&& contentType.lastIndexOf("+xml") == (contentType.length - 4));
}

REST._isJSONMIME = function(contentType){
	return  contentType.indexOf("application/json") !=-1
			|| (contentType.indexOf("application/") == 0
				&& contentType.lastIndexOf("+json") == (contentType.length - 5));
}

/* Encoding */

REST.Encoding = {};

REST.Encoding.hash = function(a){
	var ret = {};
	for(var i=0;i<a.length;i++)
		ret[a[i]] = 1;
	return ret;
}

//
// rules

REST.Encoding.Alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                       'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

REST.Encoding.Numeric = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

REST.Encoding.AlphaNum = [].concat(REST.Encoding.Alpha, REST.Encoding.Numeric); 

REST.Encoding.AlphaNumHash = REST.Encoding.hash(REST.Encoding.AlphaNum);

/**
 * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
 */
REST.Encoding.Unreserved = [].concat(REST.Encoding.AlphaNum, ['-', '.', '_', '~']);

/**
 * gen-delims = ":" / "/" / "?" / "#" / "[" / "]" / "@"
 */
REST.Encoding.GenDelims = [':', '/', '?', '#', '[', ']', '@'];

/**
 * sub-delims = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 */
REST.Encoding.SubDelims = ['!','$','&','\'','(', ')', '*','+',',',';','='];

/**
 * reserved = gen-delims | sub-delims
 */
REST.Encoding.Reserved = [].concat(REST.Encoding.GenDelims, REST.Encoding.SubDelims);

/**
 * pchar = unreserved | escaped | sub-delims | ":" | "@"
 * 
 * Note: we don't allow escaped here since we will escape it ourselves, so we don't want to allow them in the
 * unescaped sequences
 */
REST.Encoding.PChar = [].concat(REST.Encoding.Unreserved, REST.Encoding.SubDelims, [':', '@']);

/**
 * path_segment = pchar <without> ";"
 */
REST.Encoding.PathSegmentHash = REST.Encoding.hash(REST.Encoding.PChar);
delete REST.Encoding.PathSegmentHash[";"];

/**
 * path_param_name = pchar <without> ";" | "="
 */
REST.Encoding.PathParamHash = REST.Encoding.hash(REST.Encoding.PChar);
delete REST.Encoding.PathParamHash[";"];
delete REST.Encoding.PathParamHash["="];

/**
 * path_param_value = pchar <without> ";"
 */
REST.Encoding.PathParamValueHash = REST.Encoding.hash(REST.Encoding.PChar);
delete REST.Encoding.PathParamValueHash[";"];

/**
 * query = pchar / "/" / "?"
 */
REST.Encoding.QueryHash = REST.Encoding.hash([].concat(REST.Encoding.PChar, ['/', '?']));
// deviate from the RFC to disallow separators such as "=", "@" and the famous "+" which is treated as a space
// when decoding
delete REST.Encoding.QueryHash["="];
delete REST.Encoding.QueryHash["&"];
delete REST.Encoding.QueryHash["+"];

/**
 * fragment = pchar / "/" / "?"
 */
REST.Encoding.FragmentHash = REST.Encoding.hash([].concat(REST.Encoding.PChar, ['/', '?']));

// HTTP

REST.Encoding.HTTPSeparators = ["(" , ")" , "<" , ">" , "@"
                                , "," , ";" , ":" , "\\" , "\""
                                , "/" , "[" , "]" , "?" , "="
                                , "{" , "}" , ' ' , '\t'];

// This should also hold the CTLs but we never need them
REST.Encoding.HTTPChar = [];
(function(){
	for(var i=32;i<127;i++)
		REST.Encoding.HTTPChar.push(String.fromCharCode(i));
})()

// CHAR - separators
REST.Encoding.HTTPToken = REST.Encoding.hash(REST.Encoding.HTTPChar);
(function(){
	for(var i=0;i<REST.Encoding.HTTPSeparators.length;i++)
		delete REST.Encoding.HTTPToken[REST.Encoding.HTTPSeparators[i]];
})()

//
// functions

//see http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
//and http://www.apps.ietf.org/rfc/rfc1738.html#page-4
REST.Encoding.encodeFormNameOrValue = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.AlphaNumHash, true);
}

//see http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
REST.Encoding.encodeHeaderName = function (val){
	// token+ from http://www.w3.org/Protocols/rfc2616/rfc2616-sec2.html#sec2
	
	// There is no way to encode a header name. it is either a valid token or invalid and the 
	// XMLHttpRequest will fail (http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method)
	// What we could do here is throw if the value is invalid
	return val;
}

//see http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
REST.Encoding.encodeHeaderValue = function (val){
	// *TEXT or combinations of token, separators, and quoted-string from http://www.w3.org/Protocols/rfc2616/rfc2616-sec2.html#sec2
	// FIXME: implement me. Stef has given up, since it involves latin1, quoted strings, MIME encoding (http://www.ietf.org/rfc/rfc2047.txt)
	// which mentions a limit on encoded value of 75 chars, which should be split into several lines. This is mad.
	return val;
}

// see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodeQueryParamNameOrValue = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.QueryHash);
}

//see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodePathSegment = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.PathSegmentHash);
}

//see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodePathParamName = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.PathParamHash);
}

//see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodePathParamValue = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.PathParamValueHash);
}

REST.Encoding.encodeValue = function (val, allowed, form){
	if(typeof val != "string"){
		REST.log("val is not a string");
		return val;
	}
	if(val.length == 0){
		REST.log("empty string");
		return val;
	}
	var ret = '';
	for(var i=0;i<val.length;i++){
		var first = val[i];
		if(allowed[first] == 1){
			REST.log("char allowed: "+first);
			ret = ret.concat(first);
		}else if(form && (first == ' ' || first == '\n')){
			// special rules for application/x-www-form-urlencoded
			if(first == ' ')
				ret += '+';
			else
				ret += '%0D%0A';
		}else{
			// See http://www.faqs.org/rfcs/rfc2781.html 2.2
			
			// switch to codepoint
			first = val.charCodeAt(i);
			// utf-16 pair?
			if(first < 0xD800 || first > 0xDFFF){
				// just a single utf-16 char
				ret = ret.concat(REST.Encoding.percentUTF8(first));
			}else{
				if(first > 0xDBFF || i+1 >= val.length)
					throw "Invalid UTF-16 value: " + val;
				var second = val.charCodeAt(++i);
				if(second < 0xDC00 || second > 0xDFFF)
					throw "Invalid UTF-16 value: " + val;
				// char = 10 lower bits of first shifted left + 10 lower bits of second 
				var c = ((first & 0x3FF) << 10) | (second & 0x3FF);
				// and add this
				c += 0x10000;
				// char is now 32 bit unicode
				ret = ret.concat(REST.Encoding.percentUTF8(c));
			}
		}
	}
	return ret;
}

// see http://tools.ietf.org/html/rfc3629
REST.Encoding.percentUTF8 = function(c){
	if(c < 0x80)
		return REST.Encoding.percentByte(c);
	if(c < 0x800){
		var first = 0xC0 | ((c & 0x7C0) >> 6);
		var second = 0x80 | (c & 0x3F);
		return REST.Encoding.percentByte(first, second);
	}
	if(c < 0x10000){
		var first = 0xE0 | ((c >> 12) & 0xF);
		var second = 0x80 | ((c >> 6) & 0x3F);
		var third = 0x80 | (c & 0x3F);
		return REST.Encoding.percentByte(first, second, third);
	}
	if(c < 0x110000){
		var first = 0xF0 | ((c >> 18) & 0x7);
		var second = 0x80 | ((c >> 12) & 0x3F);
		var third = 0x80 | ((c >> 6) & 0x3F);
		var fourth = 0x80 | (c & 0x3F);
		return REST.Encoding.percentByte(first, second, third, fourth);
	}
	throw "Invalid character for UTF-8: "+c;
}

REST.Encoding.percentByte = function(){
	var ret = '';
	for(var i=0;i<arguments.length;i++){
		var b = arguments[i];
		if (b >= 0 && b <= 15)
			ret += "%0" + b.toString(16);
		else
			ret += "%" + b.toString(16);
	}
	return ret;
}

REST.serialiseXML = function(node){
	if (typeof XMLSerializer != "undefined")
		return (new XMLSerializer()).serializeToString(node) ;
	else if (node.xml) return node.xml;
	else throw "XML.serialize is not supported or can't serialize " + node;
}
REST.apiURL = 'https://10.5.64.135:8043/agentgateway/resource/';
var QualityControl = {};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/beginmonitor
QualityControl.beginMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/beginmonitor';
 if(Object.prototype.hasOwnProperty.call(params, 'agents'))
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var OnlineAgent = {};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}
OnlineAgent.login = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/deleteVideoTask
QualityControl.deleteVideoTask = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deleteVideoTask';
 if(Object.prototype.hasOwnProperty.call(params, 'monitoragent'))
  request.addQueryParameter('monitoragent', params.monitoragent);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentGroup = {};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/restreason
AgentGroup.getAgentRestReason = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/restreason';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var VoiceCall = {};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/endmutevideo
VoiceCall.endMuteVideo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/endmutevideo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentbyskill/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentInfoBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyskill/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var RecordPlayVoice = {};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryrecordscore
RecordPlayVoice.queryVoiceRecordScore = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryrecordscore';
 if(Object.prototype.hasOwnProperty.call(params, 'workno'))
  request.addQueryParameter('workno', params.workno);
 if(Object.prototype.hasOwnProperty.call(params, 'recordstartdate'))
  request.addQueryParameter('recordstartdate', params.recordstartdate);
 if(Object.prototype.hasOwnProperty.call(params, 'recordenddate'))
  request.addQueryParameter('recordenddate', params.recordenddate);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/beginmutevideo
VoiceCall.beginMuteVideo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/beginmutevideo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var CallData = {};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/ivrcallcount/{ivrid:[1-9][\d]{0,}}
CallData.queryCallCountByIVRId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ivrcallcount/';
 uri += REST.Encoding.encodePathSegment(params.ivrid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/recordfilefromrecordid
RecordPlayVoice.queryRecordFileFromRecordID = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordfilefromrecordid';
 if(Object.prototype.hasOwnProperty.call(params, 'recordid'))
  request.addQueryParameter('recordid', params.recordid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/loginex
OnlineAgent.loginEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/loginex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forcerest/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}/{time}/{reason}
QualityControl.forceRest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcerest/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.time);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.reason);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryagentstatus
AgentGroup.queryAgentStatusAndTimeOnVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryagentstatus';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/callout
VoiceCall.callout = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callout';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/cancelrest
OnlineAgent.cancelRest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelrest';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/release
VoiceCall.release = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/release';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/cancelselfrecord
QualityControl.qcCancelAgentSelfRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelselfrecord';
 if(Object.prototype.hasOwnProperty.call(params, 'agents'))
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/iscallout
AgentGroup.isCallOut = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/iscallout';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/iscensor
AgentGroup.isCensor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/iscensor';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/registerDataToServer
QualityControl.registerDataToServer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/registerDataToServer';
 if(Object.prototype.hasOwnProperty.call(params, 'port'))
  request.addQueryParameter('port', params.port);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var TextChat = {};
// PUT /textchat/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}/internalcall/{destno:[1-9][\d]{0,3}|[1-5][\d]{4}}
TextChat.internalCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/internalcall/';
 uri += REST.Encoding.encodePathSegment(params.destno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var QueueDevice = {};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/ivrinfo
QueueDevice.queryIVRInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ivrinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/holdlist
CallData.queryHoldListInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/holdlist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forceloginex
OnlineAgent.forceLoginEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forceloginex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/loggedinagentphoneonvdn
AgentGroup.queryAllLoggedInAgentPhonesOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/loggedinagentphoneonvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forcelogin
OnlineAgent.forceLogin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogin';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentlistbystatus
AgentGroup.getAgentListByStatus = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentlistbystatus';
 if(Object.prototype.hasOwnProperty.call(params, 'status'))
  request.addQueryParameter('status', params.status);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forefast/{time:[1-9][\d]{0,}}
RecordPlayVoice.foreFastPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forefast/';
 uri += REST.Encoding.encodePathSegment(params.time);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var QueryMonitor = {};
// POST /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/setagenttimeout/{flag}
QueryMonitor.setAgentTimeOut = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setagenttimeout/';
 uri += REST.Encoding.encodePathSegment(params.flag);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/rest/{time:[1-9][\d]{0,3}|[1-7][\d]{4}|8[0-5][0-9][0-9][0-9]|86[0-3][0-9][0-9]}/{restcause:[0-9]|[1-9][0-9]|2[5][0-5]|2[0-4][0-9]|1[\d]{2}}
OnlineAgent.rest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/rest/';
 uri += REST.Encoding.encodePathSegment(params.time);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.restcause);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentstatus
OnlineAgent.getAgentStatus = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentstatus';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/resetskill/{autoflag}
OnlineAgent.resetSkill = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/resetskill/';
 uri += REST.Encoding.encodePathSegment(params.autoflag);
 if(Object.prototype.hasOwnProperty.call(params, 'skillid'))
  request.addQueryParameter('skillid', params.skillid);
 if(Object.prototype.hasOwnProperty.call(params, 'phonelinkage'))
  request.addQueryParameter('phonelinkage', params.phonelinkage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/innerhelp
VoiceCall.innerHelp = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/innerhelp';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/systemversion
QueryMonitor.querySysVersion = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/systemversion';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/endmonitor
QualityControl.endMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/endmonitor';
 if(Object.prototype.hasOwnProperty.call(params, 'agents'))
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentrestinfo
AgentGroup.queryAgentRestDetailInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentrestinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/addsupervise/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.addSupervise = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/addsupervise/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/saybusy
OnlineAgent.sayBusy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/saybusy';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/appdata
CallData.queryCallAppData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/appdata';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentbyworkno/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
AgentGroup.queryAgentInfoByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyworkno/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/startOrStopVideoPlay
QualityControl.startOrStopVideoPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/startOrStopVideoPlay';
 if(Object.prototype.hasOwnProperty.call(params, 'monitoragent'))
  request.addQueryParameter('monitoragent', params.monitoragent);
 if(Object.prototype.hasOwnProperty.call(params, 'isstart'))
  request.addQueryParameter('isstart', params.isstart);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentclusterinfo/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
QueryMonitor.queryAgentClusterInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentclusterinfo/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/endmute
VoiceCall.endMute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/endmute';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryqctasks
QualityControl.queryQcTasks = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryqctasks';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forcelogout
OnlineAgent.forceLogout = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogout';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/isspymonitor
AgentGroup.isSpyMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/isspymonitor';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/idleagent
AgentGroup.getIdleStatusAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/idleagent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forcebusy/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.forceBusy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcebusy/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/ismonitor
AgentGroup.isMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ismonitor';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/recordfile
RecordPlayVoice.queryRecordFile = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordfile';
 if(Object.prototype.hasOwnProperty.call(params, 'workno'))
  request.addQueryParameter('workno', params.workno);
 if(Object.prototype.hasOwnProperty.call(params, 'skillid'))
  request.addQueryParameter('skillid', params.skillid);
 if(Object.prototype.hasOwnProperty.call(params, 'startdate'))
  request.addQueryParameter('startdate', params.startdate);
 if(Object.prototype.hasOwnProperty.call(params, 'enddate'))
  request.addQueryParameter('enddate', params.enddate);
 if(Object.prototype.hasOwnProperty.call(params, 'startposition'))
  request.addQueryParameter('startposition', params.startposition);
 if(Object.prototype.hasOwnProperty.call(params, 'endposition'))
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /textchat/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}/reject/{callid}
TextChat.reject = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/reject/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/isreportmanager
AgentGroup.isReportManager = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/isreportmanager';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/canceltransfer
VoiceCall.cancelTransfer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/canceltransfer';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentongroup
AgentGroup.queryAllAgentInfoOnMyGroup = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentongroup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/clusterinfo
QueryMonitor.queryClusterInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/clusterinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/requestwhisperagent
QualityControl.requestWhisperAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requestwhisperagent';
 if(Object.prototype.hasOwnProperty.call(params, 'whisperagentid'))
  request.addQueryParameter('whisperagentid', params.whisperagentid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forcedropcall/{callid:.{1,}}
QualityControl.forceDropCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcedropcall/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryurlinfo
QualityControl.queryUrlInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryurlinfo';
 if(Object.prototype.hasOwnProperty.call(params, 'urlname'))
  request.addQueryParameter('urlname', params.urlname);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/cancelbusy
OnlineAgent.cancelBusy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelbusy';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/releasephone
VoiceCall.releasePhone = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/releasephone';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/callRecordInfoList
CallData.queryCallRecordList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callRecordInfoList';
 if(Object.prototype.hasOwnProperty.call(params, 'workno'))
  request.addQueryParameter('workno', params.workno);
 if(Object.prototype.hasOwnProperty.call(params, 'skillid'))
  request.addQueryParameter('skillid', params.skillid);
 if(Object.prototype.hasOwnProperty.call(params, 'startdate'))
  request.addQueryParameter('startdate', params.startdate);
 if(Object.prototype.hasOwnProperty.call(params, 'enddate'))
  request.addQueryParameter('enddate', params.enddate);
 if(Object.prototype.hasOwnProperty.call(params, 'startposition'))
  request.addQueryParameter('startposition', params.startposition);
 if(Object.prototype.hasOwnProperty.call(params, 'endposition'))
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/requestswitchinsertwhisperagent
QualityControl.requestSwitchInsertWhisperAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requestswitchinsertwhisperagent';
 if(Object.prototype.hasOwnProperty.call(params, 'whisperagentid'))
  request.addQueryParameter('whisperagentid', params.whisperagentid);
 if(Object.prototype.hasOwnProperty.call(params, 'switchtype'))
  request.addQueryParameter('switchtype', params.switchtype);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forcelogout/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.forceLogOutAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogout/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/batchrecordzipfileurl
RecordPlayVoice.queryBatchRecordZipFileURL = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/batchrecordzipfileurl';
 if(Object.prototype.hasOwnProperty.call(params, 'filepath'))
  request.addQueryParameter('filepath', params.filepath);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/setcallbusinessdata
CallData.setCallBusinessData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setcallbusinessdata';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/play
RecordPlayVoice.beginPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/play';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/waitnumbyagent
QueueDevice.queryQueueLengthOnAgentSkills = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/waitnumbyagent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/setselfrecord/{recordflag:[0]|[1]}/{recordbeforetalking:[0]|[1]}
OnlineAgent.setAgentSelfRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setselfrecord/';
 uri += REST.Encoding.encodePathSegment(params.recordflag);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.recordbeforetalking);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/callnums
CallData.queryCallNumsOnAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callnums';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/requeststopwhisperagent
QualityControl.requestStopWhisperAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requeststopwhisperagent';
 if(Object.prototype.hasOwnProperty.call(params, 'whisperagentid'))
  request.addQueryParameter('whisperagentid', params.whisperagentid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}
VoiceCall.releaseForVTM = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryselfcallrecordinfolist
CallData.querySelfCallRecordInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryselfcallrecordinfolist';
 if(Object.prototype.hasOwnProperty.call(params, 'skillid'))
  request.addQueryParameter('skillid', params.skillid);
 if(Object.prototype.hasOwnProperty.call(params, 'startdate'))
  request.addQueryParameter('startdate', params.startdate);
 if(Object.prototype.hasOwnProperty.call(params, 'enddate'))
  request.addQueryParameter('enddate', params.enddate);
 if(Object.prototype.hasOwnProperty.call(params, 'startposition'))
  request.addQueryParameter('startposition', params.startposition);
 if(Object.prototype.hasOwnProperty.call(params, 'endposition'))
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentidsbyskill/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentIdsBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentidsbyskill/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/onlineagentonvdn
AgentGroup.queryAllLoginedAgentInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/onlineagentonvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/callinner
VoiceCall.callInner = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinner';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allcallinfoinvdn
CallData.queryAllCallInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallinfoinvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /textchat/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}/drop/{callid}
TextChat.drop = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/drop/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/alllocalagentstatus
AgentGroup.getAllStatusLocalAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/alllocalagentstatus';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentEventDispatcher = {};
// GET /agentevent/allagentevent
AgentEventDispatcher.getAllAgentEvent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/allagentevent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/callinfobycallid/{callid:.{1,}}
CallData.queryCallInfoByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinfobycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/clusterinfobyname/{clustername}
QueryMonitor.queryClusterInfoByName = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/clusterinfobyname/';
 uri += REST.Encoding.encodePathSegment(params.clustername);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/sayfree
OnlineAgent.sayFree = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/sayfree';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/vdnskill/{vdnid:[1-9][\d]{0,1}|[1-4][0-9][0-9]|5[0][0-9]|5[1][0-2]}
QueueDevice.querySkillQueueOnVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/vdnskill/';
 uri += REST.Encoding.encodePathSegment(params.vdnid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/startVideoOperation
QualityControl.startVideoOperation = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/startVideoOperation';
 if(Object.prototype.hasOwnProperty.call(params, 'monitoragent'))
  request.addQueryParameter('monitoragent', params.monitoragent);
 if(Object.prototype.hasOwnProperty.call(params, 'result'))
  request.addQueryParameter('result', params.result);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/intercept/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.intercept = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/intercept/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/previewcallout
VoiceCall.previewCallOut = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/previewcallout';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}/chatmessage
TextChat.chat = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/chatmessage';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forceidle/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.forceIdle = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forceidle/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/waitnum
QueueDevice.queryQueueLengthOnAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/waitnum';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/autoenteridle/{flag}
OnlineAgent.setAgentAutoEnterIdle = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/autoenteridle/';
 uri += REST.Encoding.encodePathSegment(params.flag);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/stoprecord
RecordPlayVoice.stopRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/stoprecord';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/sendnotelet/{receiver:.{1,}}
OnlineAgent.sendNotelet = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/sendnotelet/';
 uri += REST.Encoding.encodePathSegment(params.receiver);
 if(Object.prototype.hasOwnProperty.call(params, 'content'))
  request.addQueryParameter('content', params.content);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forcelogoutwithreason/{reason:[1-9]|[1-9][0-9]|2[5][0-5]|2[0-4][0-9]|1[\d]{2}}
OnlineAgent.forceLogoutWithReason = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogoutwithreason/';
 uri += REST.Encoding.encodePathSegment(params.reason);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryskillstat
QueueDevice.querySkillStatWithVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryskillstat';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/forceloginexwithoutphone
OnlineAgent.forceLoginExWithoutPhone = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forceloginexwithoutphone';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/pauserecord
RecordPlayVoice.pauseRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/pauserecord';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentinfonoskills
AgentGroup.queryAgentInfoWithoutSkills = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentinfonoskills';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryvideorecordfile
QualityControl.queryVideoRecordFile = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryvideorecordfile';
 if(Object.prototype.hasOwnProperty.call(params, 'workno'))
  request.addQueryParameter('workno', params.workno);
 if(Object.prototype.hasOwnProperty.call(params, 'startdate'))
  request.addQueryParameter('startdate', params.startdate);
 if(Object.prototype.hasOwnProperty.call(params, 'enddate'))
  request.addQueryParameter('enddate', params.enddate);
 if(Object.prototype.hasOwnProperty.call(params, 'startposition'))
  request.addQueryParameter('startposition', params.startposition);
 if(Object.prototype.hasOwnProperty.call(params, 'endposition'))
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/beginmute
VoiceCall.beginMute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/beginmute';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/logout
OnlineAgent.logout = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/logout';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/getcallbusinessdata
CallData.getCallBusinessData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getcallbusinessdata';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/phonepickup
VoiceCall.phonePickup = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/phonepickup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/settalkright
OnlineAgent.setTalkRight = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/settalkright';
 if(Object.prototype.hasOwnProperty.call(params, 'flag'))
  request.addQueryParameter('flag', params.flag);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/setmaxchatnum/{vdnid:[0-9][\d]{0,}}/{chatnum:[0-9][\d]{0,}}
QueryMonitor.setMaxChatNum = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setmaxchatnum/';
 uri += REST.Encoding.encodePathSegment(params.vdnid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.chatnum);
 if(Object.prototype.hasOwnProperty.call(params, 'agents'))
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}
CallData.setCallAppData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 if(Object.prototype.hasOwnProperty.call(params, 'calldata'))
  request.addQueryParameter('calldata', params.calldata);
 if(Object.prototype.hasOwnProperty.call(params, 'callid'))
  request.addQueryParameter('callid', params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/resumerecord
RecordPlayVoice.resumeRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/resumerecord';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/setcalldataex
CallData.setCallAppDataEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setcalldataex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/startVideoMonitor
QualityControl.startVideoMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/startVideoMonitor';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/record
RecordPlayVoice.beginRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/record';
 if(Object.prototype.hasOwnProperty.call(params, 'filename'))
  request.addQueryParameter('filename', params.filename);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allcallid
CallData.queryAllCallID = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallid';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allagent
QualityControl.queryAllMonitoredAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allagent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/confjoin
VoiceCall.confJoin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/confjoin';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/gethold
VoiceCall.getHold = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/gethold';
 if(Object.prototype.hasOwnProperty.call(params, 'callid'))
  request.addQueryParameter('callid', params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryselfrecordfile
RecordPlayVoice.querySelfRecordFile = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryselfrecordfile';
 if(Object.prototype.hasOwnProperty.call(params, 'skillid'))
  request.addQueryParameter('skillid', params.skillid);
 if(Object.prototype.hasOwnProperty.call(params, 'startdate'))
  request.addQueryParameter('startdate', params.startdate);
 if(Object.prototype.hasOwnProperty.call(params, 'enddate'))
  request.addQueryParameter('enddate', params.enddate);
 if(Object.prototype.hasOwnProperty.call(params, 'startposition'))
  request.addQueryParameter('startposition', params.startposition);
 if(Object.prototype.hasOwnProperty.call(params, 'endposition'))
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/stopVideoMonitor
QualityControl.stopVideoMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/stopVideoMonitor';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/groupbyagent/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
AgentGroup.queryGroupInfoByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/groupbyagent/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/innoinfo
QueueDevice.queryInNoOnVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/innoinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/backfast/{time:[1-9][\d]{0,}}
RecordPlayVoice.backFastPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/backfast/';
 uri += REST.Encoding.encodePathSegment(params.time);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/answer
VoiceCall.answer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/answer';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentskill/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QueueDevice.querySkillQueueOnAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentskill/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/isprocesscall
CallData.isProcessCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/isprocesscall';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/recordfileurl
RecordPlayVoice.queryRecordFileURL = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordfileurl';
 if(Object.prototype.hasOwnProperty.call(params, 'filepath'))
  request.addQueryParameter('filepath', params.filepath);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/servertime
QueryMonitor.queryServerTime = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/servertime';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/ivrcallinfo/{ivrid:[1-9][\d]{0,}}
CallData.queryWaitCallInfoByIVRId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ivrcallinfo/';
 uri += REST.Encoding.encodePathSegment(params.ivrid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}/transfer
TextChat.tranfser = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/transfer';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/switch/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.switchSuperviseOrInsert = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/switch/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentwasnameonvdn
AgentGroup.queryAllAgentWasNameOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentwasnameonvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid}/modifyaccountpwd
OnlineAgent.modifyAccountPwd = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/modifyaccountpwd';
 if(Object.prototype.hasOwnProperty.call(params, 'oldpassword'))
  request.addQueryParameter('oldpassword', params.oldpassword);
 if(Object.prototype.hasOwnProperty.call(params, 'newpassword'))
  request.addQueryParameter('newpassword', params.newpassword);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/addinsert/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.addInsert = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/addinsert/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/holdlistex/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
CallData.queryHoldListInfoEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/holdlistex/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentskillsbyworkno/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
OnlineAgent.queryAgentSkillsByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentskillsbyworkno/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/phonehangup
VoiceCall.phoneHangUp = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/phonehangup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentholdnum/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
CallData.queryAgentHoldNum = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentholdnum/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/callinfobeforeanswer
CallData.queryCallInfoBeforeAnswer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinfobeforeanswer';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/skillwaitnum/{skillid:[1-9][\d]{0,}}
QueueDevice.queryQueueLengthBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/skillwaitnum/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentskills
OnlineAgent.queryAgentSkills = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentskills';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/dropcall/{callid:.{1,}}
VoiceCall.dropCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/dropcall/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/reportsound
VoiceCall.reportSound = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/reportsound';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/hold
VoiceCall.hold = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/hold';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allchatagents
AgentGroup.getAllAgentsInTextChat = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allchatagents';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryagentstatusandskill
AgentGroup.queryAgentStatusAndSkill = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryagentstatusandskill';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentbyconfigedskill/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentInfoByConfigedSkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyconfigedskill/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/transfer
VoiceCall.transfer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/transfer';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/recordzipfileurl
RecordPlayVoice.queryRecordZipFileURL = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordzipfileurl';
 if(Object.prototype.hasOwnProperty.call(params, 'filepath'))
  request.addQueryParameter('filepath', params.filepath);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/statistics
CallData.queryCallStatisticsInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/statistics';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/setforwarding
OnlineAgent.setForwarding = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setforwarding';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/notifybulletin
OnlineAgent.notifyBulletin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/notifybulletin';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/skillstatisticinfo/{skillid:[1-9][\d]{0,}}
QueryMonitor.querySkillsStatisticInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/skillstatisticinfo/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/disconnect/{number:[0-9][\d]{1,24}}
VoiceCall.disconnect = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/disconnect/';
 uri += REST.Encoding.encodePathSegment(params.number);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allagentclusterinfo
QueryMonitor.queryAllAgentClusterInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allagentclusterinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/systemstate
QueryMonitor.querySystemStateInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/systemstate';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/cancelwork
OnlineAgent.cancelWork = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelwork';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/work
OnlineAgent.sayWork = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/work';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/grouponvdn
AgentGroup.queryGroupInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/grouponvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allcallinfo/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
CallData.queryAllCallInfoByAgentWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallinfo/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/setselfrecord/{recordflag:[0]|[1]}/{recordbeforetalking:[0]|[1]}
QualityControl.qcSetAgentSelfRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setselfrecord/';
 uri += REST.Encoding.encodePathSegment(params.recordflag);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.recordbeforetalking);
 if(Object.prototype.hasOwnProperty.call(params, 'agents'))
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentevent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}
AgentEventDispatcher.getAgentEvent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/autoanswer/{isautoanswer}
OnlineAgent.setAgentAutoAnswer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/autoanswer/';
 uri += REST.Encoding.encodePathSegment(params.isautoanswer);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/seconddial/{number:[0-9,%*]{1,24}}
VoiceCall.secondDial = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/seconddial/';
 uri += REST.Encoding.encodePathSegment(params.number);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/callinfo
CallData.queryCallInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/recordwithoutfilename
RecordPlayVoice.beginRecordWithoutFilename = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordwithoutfilename';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentvdnskill
QueueDevice.querySkillQueueOnAgentVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentvdnskill';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/privatecallinfo
CallData.queryPrivateCallInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/privatecallinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryrecordfilebycallid
RecordPlayVoice.queryRecordFileByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryrecordfilebycallid';
 if(Object.prototype.hasOwnProperty.call(params, 'workno'))
  request.addQueryParameter('workno', params.workno);
 if(Object.prototype.hasOwnProperty.call(params, 'callid'))
  request.addQueryParameter('callid', params.callid);
 if(Object.prototype.hasOwnProperty.call(params, 'calltime'))
  request.addQueryParameter('calltime', params.calltime);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allcallinfoEx/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}
CallData.queryAllCallInfoByAgentWorkNoEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallinfoEx/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/remotenumbers
CallData.queryRemoteNumbers = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/remotenumbers';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/deleteqctask
QualityControl.deleteQcTask = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deleteqctask';
 if(Object.prototype.hasOwnProperty.call(params, 'taskdsn'))
  request.addQueryParameter('taskdsn', params.taskdsn);
 if(Object.prototype.hasOwnProperty.call(params, 'begintime'))
  request.addQueryParameter('begintime', params.begintime);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/issystem
AgentGroup.isSystem = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/issystem';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/pauseplay
RecordPlayVoice.pausePlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/pauseplay';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/resumeplay
RecordPlayVoice.resumePlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/resumeplay';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /queuedevice/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/queryacdstat
QueueDevice.queryStatInfoOfAcd = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryacdstat';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /recordplay/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/stopplay
RecordPlayVoice.stopPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/stopplay';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/requestcall/{callid:.{1,}}/{skilltype:[0]|[1]}
VoiceCall.requestAppointedCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requestcall/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.skilltype);
 if(Object.prototype.hasOwnProperty.call(params, 'skillid'))
  request.addQueryParameter('skillid', params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /qualitycontrol/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/{workNo:[1-9][\d]{0,3}|[1-5][\d]{4}}
QualityControl.stopSuperviseOrInsert = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/agentongroupex
AgentGroup.queryAllAgentInfoOnMyGroupEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentongroupex';
 if(Object.prototype.hasOwnProperty.call(params, 'groupid'))
  request.addQueryParameter('groupid', params.groupid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/allagentstatus
AgentGroup.getAllStatusAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allagentstatus';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|[1-5][\d]{4}}/answer/{callid}
TextChat.answer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/answer/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/ispickup
AgentGroup.isPickUp = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ispickup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/connecthold/{callid:.{1,}}
VoiceCall.connectHold = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/connecthold/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/bindphone
OnlineAgent.bindAgentPhone = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/bindphone';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|[1-5][\d]{4}}/waitcallinfo/{skillid:[1-9][\d]{0,}}
CallData.queryWaitCallInfoBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/waitcallinfo/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
if (REST.antiBrowserCache == true) {
  request.addQueryParameter('resteasy_jsapi_anti_cache', (new Date().getTime()));
    var cached_obj = REST._get_cache_signature(REST._generate_cache_signature(uri));
    if (cached_obj != null) { request.addHeader('If-Modified-Since', cached_obj[1]['Last-Modified']); request.addHeader('If-None-Match', cached_obj[1]['Etag']);}
}
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};