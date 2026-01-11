// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatRoom from './pages/ChatRoom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatRoom />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/chat/:friendId" element={<ChatRoom />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login isRegisterMode />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;