import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartPie, faChartLine, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const AnalyticsPage = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [pieChartData, setPieChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState('all');
  const [totalAmountSaved, setTotalAmountSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);

      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', currentUser.uid), where('isDeleted', '!=', true));
      const goalsSnapshot = await getDocs(goalsQuery);
      const fetchedGoals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoals(fetchedGoals);

      const calculatedTotalSaved = fetchedGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
      setTotalAmountSaved(calculatedTotalSaved);

      const allContributions = [];
      for (const goal of fetchedGoals) {
        const contributionsQuery = query(collection(db, 'goals', goal.id, 'contributions'));
        const contributionsSnapshot = await getDocs(contributionsQuery);
        contributionsSnapshot.docs.forEach(doc => {
          allContributions.push({ ...doc.data(), goalId: goal.id });
        });
      }
      setContributions(allContributions);

      setPieChartData({
        labels: fetchedGoals.map(g => g.goalName),
        datasets: [{
          label: 'Amount Saved',
          data: fetchedGoals.map(g => g.currentAmount),
          backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6d28d9', '#d97706'],
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      });

      setLoading(false);
    };

    fetchData();
  }, [currentUser]);
  
  useEffect(() => {
      if (contributions.length === 0 && selectedGoalId === 'all' && goals.length === 0) return;

      const filteredContributions = selectedGoalId === 'all'
        ? contributions
        : contributions.filter(c => c.goalId === selectedGoalId);

      const savingsByMonth = {};
      filteredContributions.forEach(c => {
        if (c.date) {
          const date = c.date.toDate();
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          savingsByMonth[monthYear] = (savingsByMonth[monthYear] || 0) + c.amount;
        }
      });
      
      const sortedMonths = Object.keys(savingsByMonth).sort((a, b) => new Date(a) - new Date(b));
      
      setLineChartData({
        labels: sortedMonths,
        datasets: [{
          label: 'Savings per Month',
          data: sortedMonths.map(month => savingsByMonth[month]),
          fill: true,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          tension: 0.1,
        }],
      });

  }, [selectedGoalId, contributions, goals]);

  const getLineChartTitle = () => {
      if (selectedGoalId === 'all') {
          return 'All Savings Over Time';
      }
      const selectedGoal = goals.find(g => g.id === selectedGoalId);
      return selectedGoal ? `${selectedGoal.goalName} Savings Over Time` : 'Savings Over Time';
  };


  if (loading) return <div className="loader">Analyzing your savings...</div>;

  return (
    <div className="layout">
      <main className="container">
        <div className="page-header">
          <Link to="/" className="back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Dashboard
          </Link>
        </div>
        <div className="achievements-header">
            <h1>Your Savings Analytics</h1>
            <p>A visual breakdown of your hard work.</p>
        </div>

        {!pieChartData || goals.length === 0 ? (
            <div className="empty-state">
                <h3>No Savings Data Yet</h3>
                <p>Contribute to a goal to see your analytics!</p>
            </div>
        ) : (
            <div className="analytics-grid">
                <div className="card analytics-chart-card">
                    <div className="card-content">
                        <div className="total-saved-display">
                            <p>Total Saved:</p>
                            <h2>₱{totalAmountSaved.toLocaleString()}</h2>
                        </div>
                        <h2 className="chart-title-with-icon"><FontAwesomeIcon icon={faChartPie} /> Savings by Goal</h2>
                        <div className="chart-container">
                            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
                
                <div className="card analytics-chart-card">
                    <div className="card-content">
                        <div className="chart-header">
                            <h2 className="chart-title-with-icon"><FontAwesomeIcon icon={faChartLine} /> {getLineChartTitle()}</h2>
                            <div className="form-group">
                                <select value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)} className="chart-select">
                                    <option value="all">All Savings</option>
                                    {goals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.goalName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="chart-container">
                            {lineChartData && <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }}/>}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;