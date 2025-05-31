import React, { useState, useEffect } from 'react';
import './NotificationManager.css';

let notificationHandler = null;

export const showNotification = (message, type = 'info', duration = 5000) => {
  if (notificationHandler) {
    notificationHandler(message, type, duration);
  }
};

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationHandler = (message, type, duration) => {
      const id = Date.now() + Math.random();
      const notification = { id, message, type, duration };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto remove notification
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    };

    return () => {
      notificationHandler = null;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationManager; 