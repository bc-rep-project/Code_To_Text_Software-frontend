import toast, { Toaster } from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

let showConfetti = null;

export const NotificationToaster = () => {
  const [confettiActive, setConfettiActive] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    showConfetti = (duration = 3000) => {
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), duration);
    };

    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      showConfetti = null;
    };
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          // Success toasts
          success: {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#22c55e',
            },
          },
          // Error toasts
          error: {
            duration: 6000,
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
          },
          // Loading toasts
          loading: {
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
            },
          },
        }}
      />
      {confettiActive && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          initialVelocityY={20}
          colors={['#4ade80', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']}
        />
      )}
    </>
  );
};

export const showNotification = (message, type = 'default', options = {}) => {
  const baseOptions = {
    position: 'top-right',
    ...options
  };

  switch (type) {
    case 'success':
      if (options.celebration) {
        showConfetti && showConfetti();
      }
      return toast.success(message, baseOptions);
    case 'error':
      return toast.error(message, baseOptions);
    case 'loading':
      return toast.loading(message, baseOptions);
    case 'info':
      return toast(message, {
        ...baseOptions,
        icon: 'ℹ️',
        style: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#fff',
        },
      });
    case 'warning':
      return toast(message, {
        ...baseOptions,
        icon: '⚠️',
        style: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
        },
      });
    default:
      return toast(message, baseOptions);
  }
};

export const dismissNotification = (toastId) => {
  toast.dismiss(toastId);
};

export const dismissAllNotifications = () => {
  toast.dismiss();
};

// Custom toast with promise handling for async operations
export const showAsyncNotification = async (
  promise,
  messages = {},
  options = {}
) => {
  const defaultMessages = {
    loading: 'Processing...',
    success: 'Operation completed successfully!',
    error: 'Operation failed'
  };

  const finalMessages = { ...defaultMessages, ...messages };

  return toast.promise(
    promise,
    finalMessages,
    {
      style: {
        minWidth: '250px',
      },
      success: {
        duration: 5000,
        ...options.success
      },
      error: {
        duration: 6000,
        ...options.error
      },
      loading: {
        ...options.loading
      }
    }
  );
}; 