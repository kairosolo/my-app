import { faStar, faPiggyBank, faRocket, faTrophy, faTasks } from '@fortawesome/free-solid-svg-icons';

export const achievementsList = {
  FIRST_GOAL: {
    id: 'FIRST_GOAL',
    name: 'Dream Starter',
    description: 'Create your very first savings goal.',
    icon: faStar,
    color: '#f59e0b'
  },
  FIRST_DEPOSIT: {
    id: 'FIRST_DEPOSIT',
    name: 'First Drop in the Bank',
    description: 'Make your first contribution to any goal.',
    icon: faPiggyBank,
    color: '#10b981'
  },
  PLANNER: {
    id: 'PLANNER',
    name: 'The Planner',
    description: 'Have three or more active goals at the same time.',
    icon: faTasks,
    color: '#3b82f6'
  },
  GOAL_SMASHER: {
    id: 'GOAL_SMASHER',
    name: 'Goal Smasher!',
    description: 'Successfully complete a savings goal.',
    icon: faTrophy,
    color: '#16a34a'
  },
  NOVICE_SAVER: {
    id: 'NOVICE_SAVER',
    name: 'Novice Saver',
    description: 'Save a total of ₱1,000 across all goals.',
    icon: faRocket,
    color: '#6d28d9'
  },
};