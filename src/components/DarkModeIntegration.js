import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import Navigation from './Navigation';
import DarkModeToggle from './DarkModeToggle';
import GoogleDriveUpload from './GoogleDriveUpload';
import ProjectDetail from '../pages/ProjectDetail';
import '../styles/themes.css';

// Example of how to integrate dark mode into your main App component
const AppWithDarkMode = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          {/* Navigation with built-in dark mode toggle */}
          <Navigation />
          
          {/* Main content */}
          <main className="main-content">
            <Routes>
              <Route path="/projects/:id" element={<ProjectDetail />} />
              {/* Add other routes here */}
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

// Example of adding dark mode toggle to existing components
const ProjectDetailWithDarkMode = ({ projectId }) => {
  const [showGoogleDriveModal, setShowGoogleDriveModal] = React.useState(false);

  return (
    <div className="project-detail">
      {/* Header with dark mode toggle */}
      <div className="project-header">
        <div className="header-left">
          <button className="back-button">← Back to Projects</button>
        </div>
        
        <div className="header-center">
          <h1>Project Name</h1>
        </div>
        
        <div className="header-right">
          {/* Add dark mode toggle to any component */}
          <DarkModeToggle size="medium" />
        </div>
      </div>

      {/* Your existing content */}
      <div className="project-content">
        {/* Project actions */}
        <button onClick={() => setShowGoogleDriveModal(true)}>
          Upload to Google Drive
        </button>
      </div>

      {/* Google Drive modal with dark mode support */}
      {showGoogleDriveModal && (
        <GoogleDriveUpload
          projectId={projectId}
          onUploadComplete={() => setShowGoogleDriveModal(false)}
          onClose={() => setShowGoogleDriveModal(false)}
        />
      )}
    </div>
  );
};

// Example of using dark mode in any functional component
const ExampleComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="example-component">
      <h2>Current theme: {isDarkMode ? 'Dark' : 'Light'}</h2>
      
      {/* Manual toggle button */}
      <button onClick={toggleTheme}>
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
      
      {/* Or use the styled toggle component */}
      <DarkModeToggle size="large" />
      
      {/* Your content automatically inherits theme colors via CSS variables */}
      <div className="card">
        <p>This card automatically adapts to the current theme!</p>
      </div>
    </div>
  );
};

// CSS for the integration example
const integrationStyles = `
/* Add this to your main CSS file or index.css */

/* Import the theme styles */
@import './styles/themes.css';

/* Apply theme variables to your app */
.app {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: var(--theme-transition);
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 30px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-center h1 {
  margin: 0;
  color: var(--text-primary);
}

.back-button {
  padding: 10px 20px;
  background: var(--btn-secondary-bg);
  color: var(--text-inverse);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--theme-transition);
}

.back-button:hover {
  background: var(--btn-secondary-hover);
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  transition: var(--theme-transition);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .project-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-left,
  .header-right {
    justify-content: center;
  }
}
`;

// Integration instructions
const integrationInstructions = {
  "1. Setup Theme Provider": `
    // Wrap your main App component with ThemeProvider
    import { ThemeProvider } from './contexts/ThemeContext';
    
    function App() {
      return (
        <ThemeProvider>
          {/* Your app content */}
        </ThemeProvider>
      );
    }
  `,
  
  "2. Import Theme Styles": `
    // Import in your main CSS file or index.css
    @import './styles/themes.css';
    
    // Or import in your main component
    import './styles/themes.css';
  `,
  
  "3. Add Dark Mode Toggle": `
    // Add anywhere in your components
    import DarkModeToggle from './components/DarkModeToggle';
    
    <DarkModeToggle size="medium" />
  `,
  
  "4. Use CSS Variables": `
    // All components automatically use theme colors
    .my-component {
      background: var(--bg-primary);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);
    }
  `,
  
  "5. Access Theme State": `
    // Use the theme hook in components
    import { useTheme } from './contexts/ThemeContext';
    
    const { isDarkMode, toggleTheme } = useTheme();
  `
};

export default AppWithDarkMode;
export { ProjectDetailWithDarkMode, ExampleComponent, integrationStyles, integrationInstructions }; 