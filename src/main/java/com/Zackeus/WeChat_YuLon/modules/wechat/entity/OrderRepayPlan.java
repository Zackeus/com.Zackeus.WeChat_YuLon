package com.Zackeus.WeChat_YuLon.modules.wechat.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

import javax.validation.constraints.NotNull;

import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.hibernate.validator.constraints.NotBlank;

import com.Zackeus.WeChat_YuLon.common.annotation.validator.Money;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 
 * @Title:OrderRepayPlan
 * @Description:TODO(合同还款计划)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月14日 下午6:06:40
 */
public class OrderRepayPlan implements Serializable {

	private static final long serialVersionUID = 1L;

	@NotBlank(message = "{orderRepayPlan.externalContractNbr.NotBlank}")
	private String externalContractNbr; 		// 合同号
	
	@NotNull(message = "{orderRepayPlan.rentalId.NotNull}")
	private Integer rentalId; 					// 租期Id
	
	@JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
	private Date dueDte; 						// 还款日
	private BigDecimal repaymentSettledAmt; 	// 已还金额
	private BigDecimal repaymentAmt; 			// 应还金额
	
	@Money
	private BigDecimal total;					// 总计(如果是微信支付，总计 = （应还金额 - 已还金额）* 微信转账利息)
	private String repaymentStatus; 			// 还款状态(英文)
	private String repaymentType; 				// 还款状态(中文)
	
	public OrderRepayPlan() {
		super();
	}
	
	public OrderRepayPlan(String externalContractNbr, Integer rentalId, Date dueDte, BigDecimal repaymentSettledAmt,
			BigDecimal repaymentAmt, BigDecimal total, String repaymentStatus, String repaymentType) {
		super();
		this.externalContractNbr = externalContractNbr;
		this.rentalId = rentalId;
		this.dueDte = dueDte;
		this.repaymentSettledAmt = repaymentSettledAmt;
		this.repaymentAmt = repaymentAmt;
		this.total = total;
		this.repaymentStatus = repaymentStatus;
		this.repaymentType = repaymentType;
	}

	public String getExternalContractNbr() {
		return externalContractNbr;
	}

	public void setExternalContractNbr(String externalContractNbr) {
		this.externalContractNbr = externalContractNbr;
	}

	public Integer getRentalId() {
		return rentalId;
	}

	public void setRentalId(Integer rentalId) {
		this.rentalId = rentalId;
	}

	public Date getDueDte() {
		return dueDte;
	}

	public void setDueDte(Date dueDte) {
		this.dueDte = dueDte;
	}
	
	public BigDecimal getRepaymentSettledAmt() {
		return repaymentSettledAmt;
	}

	public void setRepaymentSettledAmt(BigDecimal repaymentSettledAmt) {
		this.repaymentSettledAmt = repaymentSettledAmt;
	}

	public BigDecimal getRepaymentAmt() {
		return repaymentAmt;
	}

	public void setRepaymentAmt(BigDecimal repaymentAmt) {
		this.repaymentAmt = repaymentAmt;
	}
	
	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public String getRepaymentStatus() {
		return repaymentStatus;
	}

	public void setRepaymentStatus(String repaymentStatus) {
		this.repaymentStatus = repaymentStatus;
	}

	public String getRepaymentType() {
		return repaymentType;
	}

	public void setRepaymentType(String repaymentType) {
		this.repaymentType = repaymentType;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
