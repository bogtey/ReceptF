import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PollForm from './components/PollForm';
import PollList from './components/PollList';
import StudentList from './components/StudentList';
import AdminPanel from './components/AdminPanel';
import StudentDetails from './components/StudentDetails';
import StudentFeed from './components/StudentFeed';
import { AuthProvider } from './contexts/AuthContext';
import Cookies from 'js-cookie';
import BackgroundWrapper from './components/BackgroundWrapper';
import Profile from './components/Profile';

function App() {
  Cookies.set('jwt', '', { expires: 7, path: '/' });

  return (
    <AuthProvider>
      <Router>
        <BackgroundWrapper>
          <Header />
          <div className="content">
            <Routes>
              <Route path="/" element={<StudentFeed />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/poll" element={<PollForm />} />
              <Route path="/polls" element={<PollList />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/students" element={<StudentList />} />
              <Route path="/student/:id" element={<StudentDetails />} />
              <Route path="/student-feed" element={<StudentFeed />} /> 
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </BackgroundWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;