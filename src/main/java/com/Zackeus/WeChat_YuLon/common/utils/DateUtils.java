package com.Zackeus.WeChat_YuLon.common.utils;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.time.DateFormatUtils;

/**
 * 
 * @Title:DateUtils
 * @Description:TODO(日期工具类, 继承org.apache.commons.lang.time.DateUtils类)
 * @Company: 
 * @author zhou.zhang
 * @date 2018年9月10日 上午11:18:19
 */
public class DateUtils extends org.apache.commons.lang3.time.DateUtils {
	
	public static String[] parsePatterns = {
			"yyyyMMdd",
			"yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM", 
			"yyyy/MM/dd", "yyyy/MM/dd HH:mm:ss", "yyyy/MM/dd HH:mm", "yyyy/MM",
			"yyyy.MM.dd", "yyyy.MM.dd HH:mm:ss", "yyyy.MM.dd HH:mm", "yyyy.MM"};
	
	/**
	 * 
	 * @Title：getDate
	 * @Description: TODO(得到当前日期字符串 格式（yyyy-MM-dd）)
	 * @see：
	 * @return
	 */
	public static String getDate() {
		return getDate(parsePatterns[1]);
	}
	
	/**
	 * 
	 * @Title：getDateBefore
	 * @Description: TODO(得到几天前的时间时间)
	 * @see：
	 * @param d
	 * @param day
	 * @return
	 */
	public static Date getDateBefore(Date d, int day) {
		Calendar now =Calendar.getInstance();
		now.setTime(d);
		now.set(Calendar.DATE, now.get(Calendar.DATE) - day);
		return now.getTime();
	}
	
	/**
	 * 
	 * @Title：getDateBefore
	 * @Description: TODO(得到几天前的时间时间字符)
	 * @see：
	 * @param d
	 * @param day
	 * @return
	 */
	public static String getDateStringBefore(Date d, int day) {
		Calendar now =Calendar.getInstance();
		now.setTime(d);
		now.set(Calendar.DATE, now.get(Calendar.DATE) - day);
		return formatDate(now.getTime(), parsePatterns[1]);
	}
	
	/**
	 * 
	 * @Title：getDate
	 * @Description: TODO(得到当前日期字符串 格式（yyyy-MM-dd） pattern可以为："yyyy-MM-dd" "HH:mm:ss" "E")
	 * @see：
	 * @param pattern
	 * @return
	 */
	public static String getDate(String pattern) {
		return DateFormatUtils.format(new Date(), pattern);
	}
	
	/**
	 * 
	 * @Title：formatDate
	 * @Description: TODO(得到日期字符串 默认格式（yyyy-MM-dd） pattern可以为："yyyy-MM-dd" "HH:mm:ss" "E")
	 * @see：
	 * @param date
	 * @param pattern
	 * @return
	 */
	public static String formatDate(Date date, Object... pattern) {
		String formatDate = null;
		if (pattern != null && pattern.length > 0) {
			formatDate = DateFormatUtils.format(date, pattern[0].toString());
		} else {
			formatDate = DateFormatUtils.format(date, "yyyy-MM-dd");
		}
		return formatDate;
	}
	
	/**
	 * 
	 * @Title：formatDateTime
	 * @Description: TODO(得到日期时间字符串，转换格式（yyyy-MM-dd HH:mm:ss）)
	 * @see：
	 * @param date
	 * @return
	 */
	public static String formatDateTime(Date date) {
		return formatDate(date, "yyyy-MM-dd HH:mm:ss");
	}

	/**
	 * 
	 * @Title：getTime
	 * @Description: TODO(得到当前时间字符串 格式（HH:mm:ss）)
	 * @see：
	 * @return
	 */
	public static String getTime() {
		return formatDate(new Date(), "HH:mm:ss");
	}

	/**
	 * 
	 * @Title：getMsecTime
	 * @Description: TODO(得到当前日期和时间字符串 格式（yyyy-MM-dd HH:mm:ss）)
	 * @see：
	 * @return
	 */
	public static String getMsecTime() {
		return formatDate(new Date(), "yyyy-MM-dd HH:mm:ss");
	}
	
	/**
	 * 
	 * @Title：getBetweenDates
	 * @Description: TODO(获取两个日期之间的日期)
	 * @see：
	 * @param start
	 * @param end
	 * @return
	 */
	public static List<Date> getBetweenDates(Date start, Date end) {
	    List<Date> result = new ArrayList<Date>();
	    result.add(start);
	    Calendar tempStart = Calendar.getInstance();
	    tempStart.setTime(start);
	    tempStart.add(Calendar.DAY_OF_YEAR, 1);
	    
	    Calendar tempEnd = Calendar.getInstance();
	    tempEnd.setTime(end);
	    while (tempStart.before(tempEnd)) {
	        result.add(tempStart.getTime());
	        tempStart.add(Calendar.DAY_OF_YEAR, 1);
	    }
	    if (start.getTime() != end.getTime()) {
	    	result.add(end);
		}
	    return result;
	}
	
	/**
	 * 
	 * @Title：timeCompare
	 * @Description: TODO(比较时间大小，现在时间大返回true)
	 * @see：
	 * @param date
	 * @return
	 */
	public static boolean timeCompare(Date date) {
		if(new Date().getTime() - date.getTime()>0){
			return true;
		}
		return false;
	}

	/**
	 * 
	 * @Title：getYear
	 * @Description: TODO(得到当前年份字符串 格式（yyyy）)
	 * @see：
	 * @return
	 */
	public static String getYear() {
		return formatDate(new Date(), "yyyy");
	}

	/**
	 * 
	 * @Title：getMonth
	 * @Description: TODO(得到当前月份字符串 格式（MM）)
	 * @see：
	 * @return
	 */
	public static String getMonth() {
		return formatDate(new Date(), "MM");
	}

	/**
	 * 
	 * @Title：getDay
	 * @Description: TODO(得到当天字符串 格式（dd）)
	 * @see：
	 * @return
	 */
	public static String getDay() {
		return formatDate(new Date(), "dd");
	}

	/**
	 * 
	 * @Title：getWeek
	 * @Description: TODO(得到当前星期字符串 格式（E）星期几)
	 * @see：
	 * @return
	 */
	public static String getWeek() {
		return formatDate(new Date(), "E");
	}
	
	/**
	 * 
	 * @Title：parseDate
	 * @Description: TODO(日期型字符串转化为日期 格式)
	 * @see：
	 * { "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", 
	 * 	"yyyy/MM/dd", "yyyy/MM/dd HH:mm:ss", "yyyy/MM/dd HH:mm",
	 *  "yyyy.MM.dd", "yyyy.MM.dd HH:mm:ss", "yyyy.MM.dd HH:mm" }
	 * @param str
	 * @return
	 */
	public static Date parseDate(Object str) {
		if (str == null){
			return null;
		}
		try {
			return parseDate(str.toString(), parsePatterns);
		} catch (ParseException e) {
			return null;
		}
	}
	
	/**
	 * 
	 * @Title:longToDate
	 * @Description: TODO(long类型转换成日期)
	 * @param lo
	 * @return
	 */
    public static String longToDate(long lo){
        Date date = new Date(lo);
        return formatDate(date, "yyyy-MM-dd HH:mm:ss");
    }

    /**
     * 
     * @Title：pastDays
     * @Description: TODO(获取过去的天数)
     * @see：
     * @param date
     * @return
     */
	public static long pastDays(Date date) {
		long t = new Date().getTime()-date.getTime();
		return t/(24*60*60*1000);
	}

	/**
	 * 
	 * @Title：pastHour
	 * @Description: TODO(获取过去的小时)
	 * @see：
	 * @param date
	 * @return
	 */
	public static long pastHour(Date date) {
		long t = new Date().getTime()-date.getTime();
		return t/(60*60*1000);
	}
	
	/**
	 * 
	 * @Title：pastMinutes
	 * @Description: TODO(获取过去的分钟)
	 * @see：
	 * @param date
	 * @return
	 */
	public static long pastMinutes(Date date) {
		long t = new Date().getTime()-date.getTime();
		return t/(60*1000);
	}
	
	/**
	 * 
	 * @Title：formatDateTime
	 * @Description: TODO(转换为时间（天,时:分:秒.毫秒）)
	 * @see：
	 * @param timeMillis
	 * @return
	 */
    public static String formatDateTime(long timeMillis){
		long day = timeMillis/(24*60*60*1000);
		long hour = (timeMillis/(60*60*1000)-day*24);
		long min = ((timeMillis/(60*1000))-day*24*60-hour*60);
		long s = (timeMillis/1000-day*24*60*60-hour*60*60-min*60);
		long sss = (timeMillis-day*24*60*60*1000-hour*60*60*1000-min*60*1000-s*1000);
		return (day>0?day+",":"")+hour+":"+min+":"+s+"."+sss;
    }
	
    /**
     * 
     * @Title：timeCompareOfTwoDate
     * @Description: TODO(判断起始日期是否早于结束日期)
     * @see：
     * @param before
     * @param after
     * @return
     */
	public static boolean timeCompareOfTwoDate(Date before, Date after) {
		return after.getTime() >= before.getTime();
	}
    
    /**
     * 
     * @Title：getDistanceOfTwoDate
     * @Description: TODO(获取两个日期之间的天数)
     * @see：
     * @param before
     * @param after
     * @return
     */
	public static double getDistanceOfTwoDate(Date before, Date after) {
		long beforeTime = before.getTime();
		long afterTime = after.getTime();
		return (afterTime - beforeTime) / (1000 * 60 * 60 * 24);
	}
	
	/**
	 * 
	 * @Title：getTimesnight
	 * @Description: TODO((获取当天24点时间戳)
	 * @see：
	 * @param hour
	 * @return
	 */
    public static long getTimesnight(int hour){ 
    	Calendar cal = Calendar.getInstance(); 
    	cal.set(Calendar.HOUR_OF_DAY, hour); 
    	cal.set(Calendar.SECOND, 0); 
    	cal.set(Calendar.MINUTE, 0); 
    	cal.set(Calendar.MILLISECOND, 0); 
    	return cal.getTimeInMillis(); 
    } 
    
    /**
     * 
     * @Title：getDistanceOfTwoHour
     * @Description: TODO(计算24 小时 时间差)
     * @see：
     * @param before
     * @param after
     * @return
     */
	public static Integer getDistanceOfTwoHour(String before, String after) {
		try {
			long result = parseDate(after, "HH").getTime() - parseDate(before, "HH").getTime() + parseDate("1970", "yyyy").getTime();
			return Integer.valueOf(formatDate(new Date(result), "HH"));
		} catch (ParseException e) {
			return null;
		}
	}
	
    /**
     * 
     * @Title：main
     * @Description: TODO()
     * @see：
     * @param args
     * @throws ParseException
     */
	public static void main(String[] args) throws ParseException {
		System.out.println(timeCompareOfTwoDate(parseDate("2018-09-05"), parseDate("2018-09-04")));
//		System.out.println(getDistanceOfTwoHour("13","24"));
	}
}
