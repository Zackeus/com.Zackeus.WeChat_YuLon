package com.Zackeus.WeChat_YuLon.common.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import com.Zackeus.WeChat_YuLon.common.utils.exception.MyException;
import com.Zackeus.WeChat_YuLon.common.utils.httpClient.HttpStatus;


/**
 * 
 * @Title:ZipUtils
 * @Description:TODO(文件/文件夹压缩)
 * @Company:
 * @author zhou.zhang
 * @date 2018年12月13日 下午4:10:07
 */
public class ZipUtils {

	private static final int BUFFER_SIZE = 2 * 1024;

	/**
	 * 
	 * @Title：toZip
	 * @Description: TODO(压缩成ZIP)
	 * @see：
	 * @param srcDir 压缩文件夹路径
	 * @param out 压缩文件输出流
	 * @param KeepDirStructure 是否保留原来的目录结构,true:保留目录结构;false:所有文件跑到压缩包根目录下(注意：不保留目录结构可能会出现同名文件,会压缩失败)
	 */
	public static void toZip(String srcDir, OutputStream out, boolean KeepDirStructure) {
		ZipOutputStream zos = null;
		try {
			zos = new ZipOutputStream(out);
			File sourceFile = new File(srcDir);
			compress(sourceFile, zos, sourceFile.getName(), KeepDirStructure);
		} catch (Exception e) {
			Logs.error("压缩文件异常：" + Logs.toLog(e));
			throw new MyException(HttpStatus.SC_INTERNAL_SERVER_ERROR, "压缩文件异常：" + e.toString());
		} finally {
			if (ObjectUtils.isNotEmpty(zos)) {
				try {
					zos.close();
				} catch (IOException e) {
					Logs.error("关闭压缩流异常：" + Logs.toLog(e));
				}
			}
		}
	}

	/**
	 * 
	 * @Title：toZip
	 * @Description: TODO(压缩成ZIP)
	 * @see：
	 * @param srcFiles 需要压缩的文件列表
	 * @param out 压缩文件输出流
	 */
	public static void toZip(List<File> srcFiles, OutputStream out) {
		ZipOutputStream zos = null;
		try {
			zos = new ZipOutputStream(out);
			for (File srcFile : srcFiles) {
				byte[] buf = new byte[BUFFER_SIZE];
				zos.putNextEntry(new ZipEntry(srcFile.getName()));
				int len;
				FileInputStream in = new FileInputStream(srcFile);
				while ((len = in.read(buf)) != -1) {
					zos.write(buf, 0, len);
				}
				zos.closeEntry();
				in.close();
			}
		} catch (Exception e) {
			Logs.error("压缩文件异常：" + Logs.toLog(e));
			throw new MyException(HttpStatus.SC_INTERNAL_SERVER_ERROR, "压缩文件异常：" + e.toString());
		} finally {
			if (ObjectUtils.isNotEmpty(zos)) {
				try {
					zos.close();
				} catch (IOException e) {
					Logs.error("关闭压缩流异常：" + Logs.toLog(e));
				}
			}
		}
	}

	/**
	 * 
	 * @Title：compress
	 * @Description: TODO(递归压缩方法)
	 * @see：
	 * @param sourceFile 源文件
	 * @param zos zip输出流
	 * @param name 压缩后的名称
	 * @param KeepDirStructure 是否保留原来的目录结构,true:保留目录结构;false:所有文件跑到压缩包根目录下(注意：不保留目录结构可能会出现同名文件,会压缩失败)
	 * @throws Exception
	 */
	private static void compress(File sourceFile, ZipOutputStream zos, String name, boolean KeepDirStructure)
			throws Exception {
		byte[] buf = new byte[BUFFER_SIZE];
		if (sourceFile.isFile()) {
			// 向zip输出流中添加一个zip实体，构造器中name为zip实体的文件的名字
			zos.putNextEntry(new ZipEntry(name));
			// copy文件到zip输出流中
			int len;
			FileInputStream in = new FileInputStream(sourceFile);
			while ((len = in.read(buf)) != -1) {
				zos.write(buf, 0, len);
			}
			// Complete the entry
			zos.closeEntry();
			in.close();
		} else {
			File[] listFiles = sourceFile.listFiles();
			if (listFiles == null || listFiles.length == 0) {
				// 需要保留原来的文件结构时,需要对空文件夹进行处理
				if (KeepDirStructure) {
					// 空文件夹的处理
					zos.putNextEntry(new ZipEntry(name + "/"));
					// 没有文件，不需要文件的copy
					zos.closeEntry();
				}

			} else {
				for (File file : listFiles) {
					// 判断是否需要保留原来的文件结构
					if (KeepDirStructure) {
						// 注意：file.getName()前面需要带上父文件夹的名字加一斜杠,
						// 不然最后压缩包中就不能保留原来的文件结构,即：所有文件都跑到压缩包根目录下了
						compress(file, zos, name + "/" + file.getName(), KeepDirStructure);
					} else {
						compress(file, zos, file.getName(), KeepDirStructure);
					}

				}
			}
		}
	}

	public static void main(String[] args) throws Exception {
		/** 测试压缩方法1 */
		FileOutputStream fos1 = new FileOutputStream(new File("D:/报表/test.zip"));
		ZipUtils.toZip("D:/报表/催收报表/2018-12月/2018-12-13", fos1, true);
		/** 测试压缩方法2 */
//		List<File> fileList = new ArrayList<>();
//		fileList.add(new File("D:/Java/jdk1.7.0_45_64bit/bin/jar.exe"));
//		fileList.add(new File("D:/Java/jdk1.7.0_45_64bit/bin/java.exe"));
//		FileOutputStream fos2 = new FileOutputStream(new File("c:/mytest02.zip"));
//		ZipUtils.toZip(fileList, fos2);

	}

}
