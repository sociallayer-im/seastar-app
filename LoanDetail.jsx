import React from 'react';
import './LoanDetail.css';

const LoanDetail = () => {
  const loanInfo = [
    { label: '贷款合约号', value: '44181057200002535' },
    { label: '贷款业务品种', value: '个人住房贷款' },
    { label: '贷款金额', value: '550,000.00元' },
    { label: '贷款发放日', value: '2018-11-01' },
    { label: '贷款到期日', value: '2048-10-31' },
    { label: '贷款年化利率', value: '5.62500000%' },
    { label: '参考定价基准', value: '贷款市场报价利率（LPR）' },
    { label: '利率浮动幅度', value: '132.500000bp' },
    { label: '利率定价方式', value: '浮动利率' },
    { label: '重定价周期', value: '每年' },
    { label: '重定价日', value: '1月1日' },
  ];

  return (
    <div className="loan-detail-container">
      <header className="loan-detail-header">
        <button className="back-button">{'<'}</button>
        <h1>贷款详情</h1>
      </header>
      
      <div className="loan-detail-content">
        {loanInfo.map((item, index) => (
          <div key={index} className="loan-detail-item">
            <span className="label">{item.label}</span>
            <span className="value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanDetail; 