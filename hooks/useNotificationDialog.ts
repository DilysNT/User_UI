"use client"

import { useState } from 'react';

interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export const useNotificationDialog = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showNotification = (params: Omit<NotificationState, 'isOpen'>) => {
    setNotification({
      ...params,
      isOpen: true,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      type: 'success',
      title,
      message,
      confirmText: 'OK',
      onConfirm,
    });
  };

  const showError = (title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      type: 'error',
      title,
      message,
      confirmText: 'OK',
      onConfirm,
    });
  };

  const showWarning = (title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      type: 'warning',
      title,
      message,
      confirmText: 'OK',
      onConfirm,
    });
  };

  const showInfo = (title: string, message: string, onConfirm?: () => void) => {
    showNotification({
      type: 'info',
      title,
      message,
      confirmText: 'OK',
      onConfirm,
    });
  };

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Xác nhận',
    cancelText: string = 'Hủy'
  ) => {
    showNotification({
      type: 'warning',
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      showCancel: true,
    });
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
  };
};
