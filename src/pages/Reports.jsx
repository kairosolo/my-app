import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './Reports.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Reports = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpendingData = async () => {
      try {
        const q = query(collection(db, "envelopes"), where("archiveDate", "==", null));
        const querySnapshot = await getDocs(q);
        const envelopesData = querySnapshot.docs.map(doc => ({ ...doc.data() }));
        const spentData = envelopesData
          .map(env => ({
            name: env.name,
            spent: env.budget - env.balance
          }))
          .filter(env => env.spent > 0);

        if (spentData.length > 0) {
          setChartData({
            labels: spentData.map(d => d.name),
            datasets: [
              {
                label: 'Amount Spent',
                data: spentData.map(d => d.spent),
                backgroundColor: ['#A47551', '#C7A58A', '#E1C6B3', '#7D5A3F', '#583E2A', '#D2B48C', '#B58863', '#9C6F49', '#83562E', '#6A3D13'],
                borderColor: '#FFFFFF',
                borderWidth: 2,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching data for report: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpendingData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'This Month\'s Spending Breakdown', font: { size: 20 } },
    },
  };

  if (loading) return <div className={styles.container}><h2>Loading Report...</h2></div>;
  
  return (
    <div className={styles.container}>
      {chartData ? (
        <div className={styles.chartContainer}><Pie data={chartData} options={chartOptions} /></div>
      ) : (
        <div className={styles.noData}>
          <h2>No Spending Data for This Month</h2>
          <p>Spend some money from your active envelopes to see a report here.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;