import { useState } from 'react';
import './App.css';

const Header = ({ siteName, className = "header" }) => {
  return (
    <header className={className}>
      {siteName}
    </header>
  );
};

const Navigation = ({ activeTab, onTabChange, navItems = ['Home', 'About Us', 'Contact Us'] }) => {
  return (
    <nav className="navigation">
      {navItems.map((item) => (
        <button
          key={item}
          onClick={() => onTabChange(item)}
          className={`nav-button ${activeTab === item ? 'active' : ''}`}
        >
          {item}
        </button>
      ))}
    </nav>
  );
};

const Content = ({ activeTab, contentData }) => {
  
  const data = contentData;
  const currentContent = data[activeTab];

  return (
    <main className="content">
      <h2 className="content-title">
        {currentContent.title}
      </h2>
      <p className="content-text">
        {currentContent.text}
      </p>
    </main>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('Home');

  const websiteConfig = {
    siteName: "Arimado Corporation",
    navItems: ['Home', 'About Us', 'Contact Us'],
    contentData: {
      'Home': {
        title: 'Welcome Home',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      },
      'About Us': {
        title: 'About Us',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      },
      'Contact Us': {
        title: 'Contact Us',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      }
    }
  };

  return (
    <div className="app-container">
      <Header 
        siteName={websiteConfig.siteName}
        className="header"
      />
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        navItems={websiteConfig.navItems}
      />
      <Content 
        activeTab={activeTab}
        contentData={websiteConfig.contentData}
      />
    </div>
  );
}

export default App;