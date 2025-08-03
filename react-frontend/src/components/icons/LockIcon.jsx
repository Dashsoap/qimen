import React from 'react';

const LockIcon = ({ size = 20, className = "", ...props }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      {...props}
    >
      <rect 
        x="3" 
        y="11" 
        width="18" 
        height="11" 
        rx="2" 
        ry="2" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      <path 
        d="M7 11V7a5 5 0 0 1 10 0v4" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LockIcon; 