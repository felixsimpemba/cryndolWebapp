import React from 'react';
import { Navigate } from 'react-router-dom';

// Business settings moved into Settings -> Business Profile tab.
const Business = () => <Navigate to="/app/settings?tab=profile" replace />;

export default Business;
