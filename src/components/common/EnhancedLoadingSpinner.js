import React from 'react';
import { motion } from 'framer-motion';
import { 
  Circles, 
  ThreeDots, 
  Puff, 
  Hearts, 
  Grid,
  Audio,
  BallTriangle,
  Bars,
  FidgetSpinner,
  MutatingDots,
  Oval,
  TailSpin,
  ThreeCircles
} from 'react-loader-spinner';
import './EnhancedLoadingSpinner.css';

const EnhancedLoadingSpinner = ({ 
  message = "Loading...", 
  type = "default",
  size = "medium",
  color = "#3b82f6",
  fullScreen = false,
  overlay = true
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 80;
      case 'xl': return 120;
      default: return 60; // medium
    }
  };

  const getSpinnerComponent = () => {
    const sizeValue = getSizeValue();
    const spinnerProps = {
      height: sizeValue,
      width: sizeValue,
      color: color,
      ariaLabel: "loading-indicator"
    };

    switch (type) {
      case 'dots':
        return <ThreeDots {...spinnerProps} />;
      case 'puff':
        return <Puff {...spinnerProps} />;
      case 'hearts':
        return <Hearts {...spinnerProps} color="#ef4444" />;
      case 'grid':
        return <Grid {...spinnerProps} />;
      case 'audio':
        return <Audio {...spinnerProps} />;
      case 'triangle':
        return <BallTriangle {...spinnerProps} />;
      case 'bars':
        return <Bars {...spinnerProps} />;
      case 'fidget':
        return <FidgetSpinner {...spinnerProps} />;
      case 'mutating':
        return <MutatingDots {...spinnerProps} />;
      case 'oval':
        return <Oval {...spinnerProps} />;
      case 'tail':
        return <TailSpin {...spinnerProps} />;
      case 'circles':
        return <ThreeCircles {...spinnerProps} />;
      case 'upload':
        return <Grid {...spinnerProps} color="#22c55e" />;
      case 'scan':
        return <Audio {...spinnerProps} color="#f59e0b" />;
      case 'convert':
        return <BallTriangle {...spinnerProps} color="#8b5cf6" />;
      case 'download':
        return <TailSpin {...spinnerProps} color="#06b6d4" />;
      default:
        return <Circles {...spinnerProps} />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const contentVariants = {
    hidden: { 
      scale: 0.8,
      opacity: 0,
      y: 20
    },
    visible: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { 
        delay: 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const messageVariants = {
    hidden: { 
      opacity: 0,
      y: 10
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        delay: 0.3,
        duration: 0.3
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const LoadingContent = () => (
    <motion.div 
      className={`loading-content ${size}`}
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="spinner-container"
        variants={pulseVariants}
        animate="pulse"
      >
        {getSpinnerComponent()}
      </motion.div>
      
      {message && (
        <motion.div 
          className="loading-message"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {message}
          </motion.span>
          
          <motion.span
            className="loading-dots"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut"
            }}
          >
            ...
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        className={`loading-overlay fullscreen ${overlay ? 'with-overlay' : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <LoadingContent />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="loading-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <LoadingContent />
    </motion.div>
  );
};

// Specialized loading components for different operations
export const UploadLoadingSpinner = ({ message = "Uploading files..." }) => (
  <EnhancedLoadingSpinner 
    type="upload" 
    message={message} 
    color="#22c55e"
  />
);

export const ScanLoadingSpinner = ({ message = "Scanning project..." }) => (
  <EnhancedLoadingSpinner 
    type="scan" 
    message={message} 
    color="#f59e0b"
  />
);

export const ConvertLoadingSpinner = ({ message = "Converting to text..." }) => (
  <EnhancedLoadingSpinner 
    type="convert" 
    message={message} 
    color="#8b5cf6"
  />
);

export const DownloadLoadingSpinner = ({ message = "Preparing download..." }) => (
  <EnhancedLoadingSpinner 
    type="download" 
    message={message} 
    color="#06b6d4"
  />
);

export default EnhancedLoadingSpinner; 