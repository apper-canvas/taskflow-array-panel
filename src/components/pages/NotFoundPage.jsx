import React from 'react';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
            <ApperIcon name="AlertCircle" className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button variant="accent" size="lg" className="w-full">
              <ApperIcon name="Home" className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full">
              <ApperIcon name="LogIn" className="h-5 w-5 mr-2" />
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;