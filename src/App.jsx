import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import './App.css';

const AuthContext = createContext();

const Auth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'presidentarimadothegreat', password: 'presidentarimadothegreat1' },
  ];

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user.username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an Auth');
  return context;
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Mag-login sa Barangay Arimado Campaign HQ</h2>
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button onClick={handleSubmit} className="login-button">Login</button>
        </div>
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p>Username: admin | Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>Barangay Arimado Political Party</h1>
        {isAuthenticated && (
          <div className="user-info">
            <span>Mabuhay, {currentUser}!</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

const Navigation = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <nav className="navigation">
      <Link to="/" className="nav-button">Home</Link>
      <Link to="/about" className="nav-button">About Us</Link>
      <Link to="/contact" className="nav-button">Contact Us</Link>
    </nav>
  );
};

const Home = () => {
  const { currentUser } = useAuth();
  return (
    <main className="content">
      <h2 className="content-title">Mabuhay, {currentUser}!</h2>
      <p className="content-text">
        Nandito ka na sa dashboard ng Barangay Arimado Political Party. Dito mo makikita 
        ang mga plataporma namin para sa halalan, mga realistic na solusyon hindi yung 
        mga pangako na "magbabago ang lahat" pero walang concrete plan.
      </p>
      <p className="content-text">
        Tignan mo yung About Us para malaman kung sino kami talaga (walang drama, walang 
        fake achievements), o punta sa Contact Us kung may issue ka sa barangay. 
        Sumasagot kami sa messages within 48 hours, hindi katulad ng ibang opisina na 
        "bukas na lang balik ka."
      </p>
    </main>
  );
};

const About = () => (
  <main className="content">
      <h2 className="content-title">Tungkol sa Barangay Arimado Political Party</h2>
      <p className="content-text">
        Nagsimula ang partido namin noong 2020 kasi napagod na kami sa mga pulitikong 
        puro salita lang. Yung team namin? Mga totoong tao, dating teachers, may-ari ng 
        tindahan, at mga community organizer na nakatira talaga dito sa lugar na gusto 
        naming i-represent.
      </p>
      <p className="content-text">
        Ang focus namin: practical solutions. Ayusin ang basura collection, gawing maayos 
        ang jeepney routes, at i-streamline ang mga proseso sa government na hindi na 
        kailangan ng limang pirma para sa isang simple na request. Ang controversial 
        naming stance? Dapat pumasok sa trabaho ang mga pulitiko.
      </p>
      <p className="content-text">
        Ginagawa din namin na digital ang mga barangay services para hindi na kailangan 
        pumila ng tatlong oras para sa barangay clearance. Kasi 2025 na, dapat hindi pa 
        rin tayo nag-s-suffer sa mga prosesong parang galing pa sa Martial Law era.
      </p>
  </main>
);

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (name && email && message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <main className="content">
      <h2 className="content-title">Makipag-ugnayan sa Amin</h2>
      <div className="contact-info">
        <div className="contact-details">
          <h3>Pano Ka Makakakuha ng Tulong</h3>
          <p><strong>Address:</strong> 123 Kamote Street, Barangay Arimado, Quezon City 1100</p>
          <p><strong>Phone:</strong> 0917-BOTO-NAMIN</p>
          <p><strong>Email:</strong> kapitanbahay@arimadopolitics.ph</p>
          <p><strong>Business Hours:</strong> Lunes-Biyernes, 9:00 AM - 6:00 PM</p>
        </div>
        <div className="contact-form-section">
          <h3>Magpadala ng Reklamo o Suggestion</h3>
          {submitted ? (
            <div className="success-message">Salamat sa inyong message! Magrereply kami agad!</div>
          ) : (
            <div className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name">Name:</label>
                <input type="text" id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email:</label>
                <input type="email" id="contact-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message:</label>
                <textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} rows="5" placeholder="Enter your message"></textarea>
              </div>
              <button onClick={handleSubmit} className="submit-button">Send Message</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Header />
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const AppWithAuth = () => (
  <Auth>
    <App />
  </Auth>
);

export default AppWithAuth;
