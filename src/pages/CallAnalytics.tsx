
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallAnalytics: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to MCUBE dashboard since this page is no longer used
    navigate('/mcube-dashboard');
  }, [navigate]);

  return null;
};

export default CallAnalytics;
