import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  bookingId?: string;
}

interface NotificationSystemProps {
  userId: string;
}

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications - trong thực tế sẽ fetch từ API
  const mockNotifications: Notification[] = [
    {
      id: 'n1',
      type: 'success',
      title: 'Xác nhận hủy tour',
      message: 'Tour "Du lịch Hạ Long - Sapa 3 ngày 2 đêm" đã được hủy thành công. Số tiền 2.500.000 VND sẽ được hoàn lại trong 3-7 ngày làm việc.',
      timestamp: '2025-07-30T10:30:00Z',
      read: false,
      bookingId: 'BK001'
    },
    {
      id: 'n2',
      type: 'info',
      title: 'Ticket hỗ trợ đã được tạo',
      message: 'Yêu cầu hỗ trợ #TK12345 cho booking #BK002 đã được tạo. Chúng tôi sẽ phản hồi trong vòng 24-48 giờ.',
      timestamp: '2025-07-30T09:15:00Z',
      read: false,
      actionUrl: '/support/tickets/TK12345'
    },
    {
      id: 'n3',
      type: 'warning',
      title: 'Tour bị hủy bởi đại lý',
      message: 'Tour "Du lịch Phú Quốc 4 ngày 3 đêm" đã bị hủy do không đủ số lượng người tham gia tối thiểu. Chúng tôi sẽ hoàn tiền 100% trong 3-7 ngày.',
      timestamp: '2025-07-29T16:45:00Z',
      read: true,
      bookingId: 'BK002'
    },
    {
      id: 'n4',
      type: 'info',
      title: 'Nhắc nhở thanh toán',
      message: 'Bạn có 1 đơn đặt tour chưa thanh toán. Vui lòng hoàn tất thanh toán trước 48 giờ để giữ chỗ.',
      timestamp: '2025-07-29T14:20:00Z',
      read: true,
      actionUrl: '/bookings/payment'
    }
  ];

  useEffect(() => {
    // Simulated API call to fetch notifications
    setNotifications(mockNotifications);
    const unread = mockNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [userId]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to action URL
      window.location.href = notification.actionUrl;
    } else if (notification.bookingId) {
      // Navigate to booking details
      window.location.href = `/profile/bookings/${notification.bookingId}`;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Thông báo ({unreadCount} chưa đọc)
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <div>Không có thông báo nào</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-25' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </div>
                      {(notification.actionUrl || notification.bookingId) && (
                        <div className="text-xs text-blue-600 mt-2">
                          Click để xem chi tiết →
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/notifications';
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
