import React from 'react';
import styles from './DashboardSummary.module.css';

const SummaryCard = ({ title, amount, colorClass }) => (
  <div className={styles.card}>
    <h3 className={styles.title}>{title}</h3>
    <p className={`${styles.amount} ${colorClass || ''}`}>₱{amount.toFixed(2)}</p>
  </div>
);

const DashboardSummary = ({ envelopes }) => {
  const totalBudget = envelopes.reduce((sum, env) => sum + env.budget, 0);
  const totalBalance = envelopes.reduce((sum, env) => sum + env.balance, 0);
  const totalSpent = totalBudget - totalBalance;

  return (
    <div className={styles.summaryContainer}>
      <SummaryCard title="Total Budget" amount={totalBudget} />
      <SummaryCard title="Total Spent" amount={totalSpent} colorClass={styles.spentAmount} />
      <SummaryCard title="Remaining" amount={totalBalance} colorClass={styles.balanceAmount} />
    </div>
  );
};

export default DashboardSummary;