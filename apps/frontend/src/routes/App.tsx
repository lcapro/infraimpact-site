import { Route, Routes } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import WorkspacePage from '../pages/WorkspacePage';
import SettingsPage from '../pages/SettingsPage';
import Navbar from '../components/Navbar';

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage mode="login" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/app" element={<WorkspacePage />} />
        <Route path="/app/projects/:id" element={<WorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
};

export default App;
