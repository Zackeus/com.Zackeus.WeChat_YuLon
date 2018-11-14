package com.Zackeus.WeChat_YuLon.modules.wechat.entity;

import java.math.BigDecimal;
import java.util.List;

import com.Zackeus.WeChat_YuLon.common.entity.DataEntity;

/**
 * 
 * @Title:OrderDetail
 * @Description:TODO(贷款合同明细)
 * @Company:
 * @author zhou.zhang
 * @date 2018年11月14日 上午8:56:40
 */
public class OrderDetail extends DataEntity<OrderDetail> {

	private static final long serialVersionUID = 1L;

	private String externalContractNbr; 	// 合同号
	private Integer repaymentSchedule;		// 还款进度
	private String assetBrandDsc; 			// 车型
	private String assetModelDsc; 			// 车系
	private BigDecimal amountFinanced;		// 贷款金额
	private String actualRte; 				// 利率
	private BigDecimal installmentAmt;		// 月供
	
	private List<OrderRepayPlan> orderRepayPlans; // 还款计划

	public OrderDetail() {
		super();
	}
	
	public OrderDetail(String externalContractNbr) {
		super();
		this.externalContractNbr = externalContractNbr;
	}
	
	public OrderDetail(String externalContractNbr, Integer repaymentSchedule, String assetBrandDsc,
			String assetModelDsc, BigDecimal amountFinanced, String actualRte, BigDecimal installmentAmt,
			List<OrderRepayPlan> orderRepayPlans) {
		super();
		this.externalContractNbr = externalContractNbr;
		this.repaymentSchedule = repaymentSchedule;
		this.assetBrandDsc = assetBrandDsc;
		this.assetModelDsc = assetModelDsc;
		this.amountFinanced = amountFinanced;
		this.actualRte = actualRte;
		this.installmentAmt = installmentAmt;
		this.orderRepayPlans = orderRepayPlans;
	}

	public String getExternalContractNbr() {
		return externalContractNbr;
	}

	public void setExternalContractNbr(String externalContractNbr) {
		this.externalContractNbr = externalContractNbr;
	}

	public Integer getRepaymentSchedule() {
		return repaymentSchedule;
	}

	public void setRepaymentSchedule(Integer repaymentSchedule) {
		this.repaymentSchedule = repaymentSchedule;
	}

	public String getAssetBrandDsc() {
		return assetBrandDsc;
	}

	public void setAssetBrandDsc(String assetBrandDsc) {
		this.assetBrandDsc = assetBrandDsc;
	}

	public String getAssetModelDsc() {
		return assetModelDsc;
	}

	public void setAssetModelDsc(String assetModelDsc) {
		this.assetModelDsc = assetModelDsc;
	}

	public BigDecimal getAmountFinanced() {
		return amountFinanced;
	}

	public void setAmountFinanced(BigDecimal amountFinanced) {
		this.amountFinanced = amountFinanced;
	}

	public String getActualRte() {
		return actualRte;
	}

	public void setActualRte(String actualRte) {
		this.actualRte = actualRte;
	}

	public BigDecimal getInstallmentAmt() {
		return installmentAmt;
	}
	
	public List<OrderRepayPlan> getOrderRepayPlans() {
		return orderRepayPlans;
	}

	public void setOrderRepayPlans(List<OrderRepayPlan> orderRepayPlans) {
		this.orderRepayPlans = orderRepayPlans;
	}

	public void setInstallmentAmt(BigDecimal installmentAmt) {
		this.installmentAmt = installmentAmt;
	}

}
