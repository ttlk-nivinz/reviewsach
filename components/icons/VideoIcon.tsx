import React from 'react';

const VideoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 8l-6 4 6 4V8z" />
    <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
  </svg>
);

export default VideoIcon;
