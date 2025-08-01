"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  confirmText = "OK",
  cancelText = "Hủy",
  onConfirm,
  showCancel = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case 'info':
        return <Info className="w-12 h-12 text-blue-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md mx-auto ${getBackgroundColor()} border-2 rounded-2xl`}>
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {getIcon()}
          </div>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex justify-center gap-3 mt-6">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:shadow-md"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-3 ${getButtonColor()} text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg`}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
