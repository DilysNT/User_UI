"use client";

import { useState, useCallback, useEffect } from 'react';

export interface ErrorState {
  message: string;
  code?: string;
  type: 'network' | 'validation' | 'auth' | 'server' | 'unknown';
  timestamp: number;
  retryCount: number;
  stack?: string;
}

interface UseErrorHandlerReturn {
  error: ErrorState | null;
  isError: boolean;
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  retryAction: () => void;
  canRetry: boolean;
}

const useErrorHandler = (
  maxRetries: number = 3,
  retryAction?: () => void | Promise<void>
): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ErrorState | null>(null);

  const categorizeError = (error: Error | string): ErrorState['type'] => {
    const message = typeof error === 'string' ? error : error.message;
    
    if (message.includes('fetch') || message.includes('network') || message.includes('NetworkError')) {
      return 'network';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('401')) {
      return 'auth';
    }
    if (message.includes('500') || message.includes('server')) {
      return 'server';
    }
    return 'unknown';
  };

  const setError = useCallback((error: Error | string | null) => {
    if (!error) {
      setErrorState(null);
      return;
    }

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    setErrorState({
      message: errorMessage,
      type: categorizeError(error),
      timestamp: Date.now(),
      retryCount: 0,
      stack: errorStack
    });

    // Log error for debugging
    console.error('🚨 Error occurred:', {
      message: errorMessage,
      type: categorizeError(error),
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleRetry = useCallback(async () => {
    if (!error || !retryAction || error.retryCount >= maxRetries) {
      return;
    }

    try {
      // Update retry count
      setErrorState(prev => prev ? {
        ...prev,
        retryCount: prev.retryCount + 1
      } : null);

      await retryAction();
      
      // If retry succeeds, clear error
      clearError();
    } catch (retryError) {
      console.error('🔄 Retry failed:', retryError);
      // Keep the original error but update retry count
    }
  }, [error, retryAction, maxRetries, clearError]);

  const canRetry = error ? error.retryCount < maxRetries : false;

  return {
    error,
    isError: !!error,
    setError,
    clearError,
    retryAction: handleRetry,
    canRetry
  };
};

// Toast notification for errors
export const useErrorToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    error: ErrorState;
    isVisible: boolean;
  }>>([]);

  const showErrorToast = useCallback((error: ErrorState) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setToasts(prev => [...prev, {
      id,
      error,
      isVisible: true
    }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.map(toast => 
        toast.id === id ? { ...toast, isVisible: false } : toast
      ));
      
      // Remove from array after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 300);
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, isVisible: false } : toast
    ));
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  return {
    toasts,
    showErrorToast,
    dismissToast
  };
};

export default useErrorHandler;
