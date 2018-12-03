package com.Zackeus.WeChat_YuLon.common.utils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * 
 * @Title:XmlUtil
 * @Description:TODO(XML 工具类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年12月3日 下午5:30:26
 */
public class XmlUtil extends com.sun.xml.internal.ws.util.xml.XmlUtil {
	
	public static final String FEATURE_DISALLOW_DECL = "http://apache.org/xml/features/disallow-doctype-decl";
	public static final String FEATURE_GENERAL_ENTITIES = "http://xml.org/sax/features/external-general-entities";
	public static final String FEATURE_PARAMETER_ENTITIES = "http://xml.org/sax/features/external-parameter-entities";
	public static final String FEATURE_LOAD_DTD = "http://apache.org/xml/features/nonvalidating/load-external-dtd";
	public static final String FEATURE_SECURE_PROCESSING = "http://javax.xml.XMLConstants/feature/secure-processing";
	
	private static final String XML_ROOT = "xml";
	private static final String YES_INDENT = "yes";

	/**
	 * 
	 * @Title：xmlToMap
	 * @Description: TODO(XML格式字符串转换为Map) @see：
	 * @param strXML
	 *            XML字符串
	 * @return XML数据转换后的Map
	 * @throws Exception
	 */
	public static Map<String, String> xmlToMap(String strXML) {
		if(StringUtils.isBlank(strXML)) {
			return null;
		}
		
		/*=============  !!!!注意，修复了微信官方反馈的漏洞，更新于2018-10-16  ===========*/
		try {
			Map<String, String> data = new HashMap<String, String>();
			
			// TODO 在这里更换
			DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
			documentBuilderFactory.setFeature(FEATURE_DISALLOW_DECL, Boolean.TRUE);
			documentBuilderFactory.setFeature(FEATURE_GENERAL_ENTITIES, Boolean.FALSE);
			documentBuilderFactory.setFeature(FEATURE_PARAMETER_ENTITIES, Boolean.FALSE);
			documentBuilderFactory.setFeature(FEATURE_LOAD_DTD, Boolean.FALSE);
			documentBuilderFactory.setFeature(FEATURE_SECURE_PROCESSING, Boolean.TRUE);
			documentBuilderFactory.setXIncludeAware(Boolean.FALSE);
			documentBuilderFactory.setExpandEntityReferences(Boolean.FALSE);
			
			InputStream stream = new ByteArrayInputStream(strXML.getBytes(WebUtils.UTF_ENCODING));
			Document doc = documentBuilderFactory.newDocumentBuilder().parse(stream);
			doc.getDocumentElement().normalize();
			NodeList nodeList = doc.getDocumentElement().getChildNodes();
			for (int idx = 0; idx < nodeList.getLength(); ++idx) {
				Node node = nodeList.item(idx);
				if (node.getNodeType() == Node.ELEMENT_NODE) {
					Element element = (Element) node;
					data.put(element.getNodeName(), element.getTextContent());
				}
			}
			try {
				stream.close();
			} catch (Exception ex) {
				Logs.error("关闭IO流异常: " + Logs.toLog(ex));
			}
			return data;
		} catch (Exception ex) {
	    	   Logs.error("解析XML异常: " + Logs.toLog(ex));
	    	   return null;
		}
	}

	/**
	 * 将Map转换为XML格式的字符串
	 *
	 * @param data
	 *            Map类型数据
	 * @return XML格式的字符串
	 * @throws Exception
	 */
	public static String mapToXml(Map<String, String> data) {
		try {
			DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
			documentBuilderFactory.setFeature(FEATURE_DISALLOW_DECL, Boolean.TRUE);
			documentBuilderFactory.setFeature(FEATURE_GENERAL_ENTITIES, Boolean.FALSE);
			documentBuilderFactory.setFeature(FEATURE_PARAMETER_ENTITIES, Boolean.FALSE);
			documentBuilderFactory.setFeature(FEATURE_LOAD_DTD, Boolean.FALSE);
			documentBuilderFactory.setFeature(FEATURE_SECURE_PROCESSING, Boolean.TRUE);
			documentBuilderFactory.setXIncludeAware(Boolean.FALSE);
			documentBuilderFactory.setExpandEntityReferences(Boolean.FALSE);
			Document document = documentBuilderFactory.newDocumentBuilder().newDocument();
			Element root = document.createElement(XML_ROOT);
			document.appendChild(root);
			for (String key : data.keySet()) {
				String value = data.get(key);
				if (StringUtils.isBlank(value))
					value = StringUtils.EMPTY;
				value = value.trim();
				Element filed = document.createElement(key);
				filed.appendChild(document.createTextNode(value));
				root.appendChild(filed);
			}
			TransformerFactory tf = TransformerFactory.newInstance();
			Transformer transformer = tf.newTransformer();
			DOMSource source = new DOMSource(document);
			transformer.setOutputProperty(OutputKeys.ENCODING, WebUtils.UTF_ENCODING);
			transformer.setOutputProperty(OutputKeys.INDENT, YES_INDENT);
			StringWriter writer = new StringWriter();
			StreamResult result = new StreamResult(writer);
			transformer.transform(source, result);
			String output = writer.getBuffer().toString();
			
			try {
				writer.close();
			} catch (Exception ex) {
				Logs.error("关闭字符流异常: " + Logs.toLog(ex));
			}
			return output;
		} catch (Exception e) {
	    	   Logs.error("解析Map异常: " + Logs.toLog(e));
	    	   return null;
		}
	}

//	/**
//	 * 判断签名是否正确
//	 *
//	 * @param xmlStr
//	 *            XML格式数据
//	 * @param key
//	 *            API密钥
//	 * @return 签名是否正确
//	 * @throws Exception
//	 */
//	public static boolean isSignatureValid(String xmlStr, String key) throws Exception {
//		Map<String, String> data = xmlToMap(xmlStr);
//		if (!data.containsKey(WXPayConstants.FIELD_SIGN)) {
//			return false;
//		}
//		String sign = data.get(WXPayConstants.FIELD_SIGN);
//		return generateSignature(data, key).equals(sign);
//	}
//
//	/**
//	 * 判断签名是否正确，必须包含sign字段，否则返回false。使用MD5签名。
//	 *
//	 * @param data
//	 *            Map类型数据
//	 * @param key
//	 *            API密钥
//	 * @return 签名是否正确
//	 * @throws Exception
//	 */
//	public static boolean isSignatureValid(Map<String, String> data, String key) throws Exception {
//		return isSignatureValid(data, key, SignType.MD5);
//	}
//
//	/**
//	 * 判断签名是否正确，必须包含sign字段，否则返回false。
//	 *
//	 * @param data
//	 *            Map类型数据
//	 * @param key
//	 *            API密钥
//	 * @param signType
//	 *            签名方式
//	 * @return 签名是否正确
//	 * @throws Exception
//	 */
//	public static boolean isSignatureValid(Map<String, String> data, String key, SignType signType) throws Exception {
//		if (!data.containsKey(WXPayConstants.FIELD_SIGN)) {
//			return false;
//		}
//		String sign = data.get(WXPayConstants.FIELD_SIGN);
//		return generateSignature(data, key, signType).equals(sign);
//	}
//
	
	/**
	 * 
	 * @Title：main
	 * @Description: TODO(测试)
	 * @see：
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		Map<String, String> packageParams = new HashMap<String, String>();
		packageParams.put("appid", "123");
		packageParams.put("mch_id", "456");
		packageParams.put("nonce_str", "qdqwdq");
		packageParams.put("body", "测试");
		packageParams.put("out_trade_no", "HP123");
		packageParams.put("total_fee", "1");
		packageParams.put("spbill_create_ip", "127.0.0.1");
		packageParams.put("notify_url", "https://www.baidu.com");
		packageParams.put("trade_type", "JSAPI");
		packageParams.put("openid", "ASDQQWEQWE");
		System.out.println(mapToXml(packageParams));
		
//		String xml = "<xml>"
//				+"<return_code><![CDATA[SUCCESS]]></return_code>"
//				+"<return_msg><![CDATA[OK]]></return_msg>"
//				+"<appid><![CDATA[wx1355ccd7ae5ff978]]></appid>"
//				+"<mch_id><![CDATA[1475769702]]></mch_id>"
//				+"<nonce_str><![CDATA[KJgpNEyQu0nuM9Pc]]></nonce_str>"
//				+"<sign><![CDATA[5D5B0DAC1453664010EBF49FBD122B6E]]></sign>"
//				+"<result_code><![CDATA[SUCCESS]]></result_code>"
//				+"<prepay_id><![CDATA[wx031057427370517e257a09fc2693056220]]></prepay_id>"
//				+"<trade_type><![CDATA[JSAPI]]></trade_type>"
//				+"</xml>";
//		System.out.println(xmlToMap(xml));
	}

}
