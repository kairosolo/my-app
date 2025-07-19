import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './ArchivedMonthChart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ArchivedMonthChart = ({ envelopes }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const spentData = envelopes
      .map(env => ({
        name: env.name,
        spent: env.budget - env.balance,
      }))
      .filter(env => env.spent > 0);

    if (spentData.length > 0) {
      setChartData({
        labels: spentData.map(d => d.name),
        datasets: [
          {
            label: 'Amount Spent',
            data: spentData.map(d => d.spent),
            backgroundColor: [
              '#A47551', '#C7A58A', '#E1C6B3', '#7D5A3F', '#583E2A',
              '#D2B48C', '#B58863', '#9C6F49', '#83562E', '#6A3D13'
            ],
            borderColor: 'var(--card-bg)',
            borderWidth: 2,
          },
        ],
      });
    }
  }, [envelopes]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'right', 
      },
      title: {
        display: false, 
      },
    },
  };

  if (!chartData) {
    return <p className={styles.noData}>No spending was recorded for this month.</p>;
  }

  return (
    <div className={styles.chartContainer}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default ArchivedMonthChart;