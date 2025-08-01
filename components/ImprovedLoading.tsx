"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Clock, Wifi, AlertCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'purple' | 'gray';
  text?: string;
  showProgress?: boolean;
  timeout?: number; // milliseconds
  onTimeout?: () => void;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text = 'Đang tải...',
  showProgress = false,
  timeout = 10000, // 10 seconds default
  onTimeout
}) => {
  const [progress, setProgress] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!showProgress && !timeout) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setTimeElapsed(elapsed);

      if (showProgress) {
        const progressValue = Math.min((elapsed / timeout) * 100, 100);
        setProgress(progressValue);
      }

      if (elapsed >= timeout) {
        setIsTimedOut(true);
        clearInterval(interval);
        onTimeout?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showProgress, timeout, onTimeout]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  if (isTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tải dữ liệu chậm hơn bình thường
        </h3>
        <p className="text-gray-600 text-center mb-4">
          Kết nối mạng có thể chậm. Vui lòng kiểm tra kết nối hoặc thử lại.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Spinning Icon */}
      <div className="relative mb-4">
        <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
        
        {/* Progress Ring */}
        {showProgress && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={colorClasses[color]}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
        )}
      </div>

      {/* Loading Text */}
      <p className="text-gray-700 font-medium mb-2">{text}</p>

      {/* Progress Percentage */}
      {showProgress && (
        <p className="text-sm text-gray-500 mb-2">
          {Math.round(progress)}%
        </p>
      )}

      {/* Time Elapsed */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{formatTime(timeElapsed)}</span>
      </div>

      {/* Network Status Indicator */}
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
        <Wifi className="w-3 h-3" />
        <span>Đang kết nối...</span>
      </div>
    </div>
  );
};

// Full Page Loading Component
interface FullPageLoadingProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  backgroundColor?: string;
}

const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  title = 'Đang tải',
  subtitle = 'Vui lòng đợi trong giây lát...',
  showLogo = true,
  backgroundColor = 'bg-gradient-to-br from-blue-50 to-purple-50'
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${backgroundColor}`}>
      <div className="text-center">
        {/* Logo */}
        {showLogo && (
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Travel App</h1>
          </div>
        )}

        {/* Loading Spinner */}
        <LoadingSpinner 
          size="xl" 
          text={title}
          showProgress={true}
          timeout={15000}
          onTimeout={() => console.warn('Loading timeout reached')}
        />
        
        {/* Subtitle */}
        <p className="text-gray-600 mt-4 max-w-md mx-auto">
          {subtitle}
        </p>

        {/* Loading Tips */}
        <div className="mt-8 text-sm text-gray-500 max-w-sm mx-auto">
          <p>💡 <strong>Mẹo:</strong> Đảm bảo kết nối mạng ổn định để có trải nghiệm tốt nhất</p>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Components
const SkeletonLine: React.FC<{ width?: string; height?: string }> = ({ 
  width = 'w-full', 
  height = 'h-4' 
}) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
);

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 space-y-3">
    <SkeletonLine width="w-3/4" height="h-6" />
    <SkeletonLine width="w-full" height="h-4" />
    <SkeletonLine width="w-5/6" height="h-4" />
    <div className="flex gap-2 mt-4">
      <SkeletonLine width="w-20" height="h-8" />
      <SkeletonLine width="w-24" height="h-8" />
    </div>
  </div>
);

export { LoadingSpinner, FullPageLoading, SkeletonLine, SkeletonCard };
