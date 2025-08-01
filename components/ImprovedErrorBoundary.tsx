"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  isRetrying: boolean;
}

class ImprovedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isRetrying: false
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('📊 Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error: Error, errorInfo: any) => {
    // Integration with error reporting service
    console.log('📤 Logging error to external service...', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  handleRetry = async () => {
    if (this.retryCount >= this.maxRetries) {
      console.warn('⚠️ Max retry attempts reached');
      return;
    }

    this.setState({ isRetrying: true });
    this.retryCount++;

    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const errorReport = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    const emailBody = encodeURIComponent(`
Báo cáo lỗi từ website:

Thời gian: ${errorReport.timestamp}
URL: ${errorReport.url}
Lỗi: ${errorReport.message}

Chi tiết kỹ thuật:
${errorReport.stack}

Component Stack:
${errorReport.componentStack}
    `);

    window.open(`mailto:support@example.com?subject=Bug Report&body=${emailBody}`);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Có lỗi xảy ra
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Đã xảy ra lỗi không mong muốn. Chúng tôi đã ghi nhận sự cố này và sẽ khắc phục sớm nhất có thể.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                <details>
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    🔍 Chi tiết lỗi (Development)
                  </summary>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Retry Counter */}
            {this.retryCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  🔄 Đã thử lại: {this.retryCount}/{this.maxRetries}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {this.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {this.state.isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang thử lại...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Thử lại
                    </>
                  )}
                </button>
              )}

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Bug className="w-4 h-4" />
                Báo cáo lỗi
              </button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 mt-6">
              Nếu lỗi vẫn tiếp tục, vui lòng liên hệ hỗ trợ kỹ thuật.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ImprovedErrorBoundary;
