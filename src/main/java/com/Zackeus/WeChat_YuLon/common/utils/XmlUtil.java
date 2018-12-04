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
	
	/**
     * 将驼峰式命名的字符串转换为下划线大写方式。如果转换前的驼峰式命名的字符串为空，则返回空字符串。</br>
     * 例如：HelloWorld->HELLO_WORLD
     * @param name 转换前的驼峰式命名的字符串
     * @return 转换后下划线大写方式命名的字符串
     */
    public static String underscoreName(String name) {
        StringBuilder result = new StringBuilder();
        if (StringUtils.isNotBlank(name)) {
            // 将第一个字符处理成大写
            result.append(name.substring(0, 1).toUpperCase());
            // 循环处理其余字符
            for (int i = 1; i < name.length(); i++) {
                String s = name.substring(i, i + 1);
                // 在大写字母前添加下划线
                if (s.equals(s.toUpperCase()) && !Character.isDigit(s.charAt(0)))
                    result.append("_");
                // 其他字符直接转成大写
                result.append(s.toUpperCase());
            }
        }
        return result.toString();
    }

    /**
     * 将下划线大写方式命名的字符串转换为驼峰式。如果转换前的下划线大写方式命名的字符串为空，则返回空字符串。</br>
     * 例如：HELLO_WORLD->HelloWorld
     * @param name 转换前的下划线大写方式命名的字符串
     * @return 转换后的驼峰式命名的字符串
     */
    public static String camelName(String name) {
        StringBuilder result = new StringBuilder();
        // 快速检查
        if (StringUtils.isBlank(name))
            return StringUtils.EMPTY;
        else if (!name.contains("_"))
            // 不含下划线，仅将首字母小写
            return name.substring(0, 1).toLowerCase() + name.substring(1);
        // 用下划线将原始字符串分割
        String camels[] = name.split("_");
        for (String camel :  camels) {
            // 跳过原始字符串中开头、结尾的下换线或双重下划线
            if (camel.isEmpty())
                continue;
            // 处理真正的驼峰片段
            if (result.length() == 0)
                // 第一个驼峰片段，全部字母都小写
                result.append(camel.toLowerCase());
            else {
                // 其他的驼峰片段，首字母大写
                result.append(camel.substring(0, 1).toUpperCase());
                result.append(camel.substring(1).toLowerCase());
            }
        }
        return result.toString();
    }
	
	/**
	 * 
	 * @Title：main
	 * @Description: TODO(测试)
	 * @see：
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		System.out.println(camelName("appid"));
		
//		Map<String, String> packageParams = new HashMap<String, String>();
//		packageParams.put("appid", "123");
//		packageParams.put("mch_id", "456");
//		packageParams.put("nonce_str", "qdqwdq");
//		packageParams.put("body", "测试");
//		packageParams.put("out_trade_no", "HP123");
//		packageParams.put("total_fee", "1");
//		packageParams.put("spbill_create_ip", "127.0.0.1");
//		packageParams.put("notify_url", "https://www.baidu.com");
//		packageParams.put("trade_type", "JSAPI");
//		packageParams.put("openid", "ASDQQWEQWE");
//		System.out.println(mapToXml(packageParams));
		
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
