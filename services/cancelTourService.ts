// API service cho chức năng hủy tour và hỗ trợ khách hàng

interface CancelBookingRequest {
  bookingId: string;
  refundAmount: number;
  reason?: string;
}

interface CreateTicketRequest {
  bookingId: string;
  type: 'cancellation_complaint' | 'general_support' | 'refund_issue';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface RefundResponse {
  success: boolean;
  refundId: string;
  refundAmount: number;
  estimatedDays: number;
  paymentMethod: string;
}

interface TicketResponse {
  success: boolean;
  ticketId: string;
  estimatedResponseTime: string;
}

export class CancelTourService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  /**
   * Lấy chính sách hủy tour dựa trên tour ID
   */
  static async getCancellationPolicy(tourId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/tours/${tourId}/cancellation-policy`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cancellation policy');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cancellation policy:', error);
      // Fallback to default policy
      return {
        policies: [
          { days_before: 7, refund_percentage: 100, description: "Hủy trước 7 ngày - hoàn 100%" },
          { days_before: 3, refund_percentage: 50, description: "Hủy trước 3-7 ngày - hoàn 50%" },
          { days_before: 0, refund_percentage: 0, description: "Hủy trong vòng 3 ngày - không hoàn tiền" }
        ]
      };
    }
  }

  /**
   * Tính toán số tiền hoàn lại dựa trên chính sách
   */
  static calculateRefund(
    totalAmount: number, 
    departureDate: string, 
    cancellationPolicies: any[]
  ): { refundAmount: number; applicablePolicy: any; daysUntilDeparture: number } {
    const departure = new Date(departureDate);
    const now = new Date();
    const daysUntilDeparture = Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Tìm chính sách áp dụng
    let applicablePolicy = cancellationPolicies.find(policy => daysUntilDeparture >= policy.days_before);
    if (!applicablePolicy) {
      applicablePolicy = cancellationPolicies[cancellationPolicies.length - 1];
    }

    const refundAmount = (totalAmount * applicablePolicy.refund_percentage) / 100;

    return {
      refundAmount,
      applicablePolicy,
      daysUntilDeparture
    };
  }

  /**
   * Hủy booking và xử lý hoàn tiền tự động
   */
  static async cancelBooking(request: CancelBookingRequest): Promise<RefundResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${request.bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }

      const result = await response.json();

      // Gửi thông báo email tự động (được xử lý ở backend)
      this.sendCancellationNotification(request.bookingId, result);

      return result;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Tạo ticket hỗ trợ cho khiếu nại hủy tour
   */
  static async createSupportTicket(request: CreateTicketRequest): Promise<TicketResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...request,
          category: 'cancellation',
          status: 'open',
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create support ticket');
      }

      const result = await response.json();

      // Thông báo cho Admin về ticket mới
      this.notifyAdminNewTicket(result.ticketId, request);

      return result;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  /**
   * Xử lý hủy tour từ phía Agency (khi không đủ người tham gia)
   */
  static async agencyCancelTour(
    tourId: string, 
    departureId: string, 
    reason: string
  ): Promise<{ success: boolean; affectedBookings: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/tours/${tourId}/departures/${departureId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agencyToken')}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel tour departure');
      }

      const result = await response.json();

      // Tự động hoàn tiền 100% cho tất cả booking bị ảnh hưởng
      await this.processFullRefundForCancelledTour(result.affectedBookings);

      return result;
    } catch (error) {
      console.error('Error cancelling tour departure:', error);
      throw error;
    }
  }

  /**
   * Xử lý hoàn tiền 100% khi Agency hủy tour
   */
  private static async processFullRefundForCancelledTour(bookingIds: string[]): Promise<void> {
    for (const bookingId of bookingIds) {
      try {
        await fetch(`${this.baseUrl}/bookings/${bookingId}/agency-cancel-refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('agencyToken')}`
          },
          body: JSON.stringify({ 
            refundPercentage: 100,
            reason: 'Tour cancelled by agency'
          })
        });
      } catch (error) {
        console.error(`Error processing refund for booking ${bookingId}:`, error);
      }
    }
  }

  /**
   * Gửi thông báo hủy tour (email + in-app notification)
   */
  private static async sendCancellationNotification(
    bookingId: string, 
    refundDetails: RefundResponse
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/notifications/cancellation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookingId,
          type: 'booking_cancelled',
          refundDetails,
          channels: ['email', 'in_app']
        })
      });
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  }

  /**
   * Thông báo cho Admin về ticket khiếu nại mới
   */
  private static async notifyAdminNewTicket(
    ticketId: string, 
    request: CreateTicketRequest
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/admin/notifications/new-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ticketId,
          type: request.type,
          priority: request.priority,
          bookingId: request.bookingId,
          subject: request.subject
        })
      });
    } catch (error) {
      console.error('Error notifying admin about new ticket:', error);
    }
  }

  /**
   * Lấy danh sách thông báo của user
   */
  static async getUserNotifications(userId: string, limit: number = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/notifications?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Lấy trạng thái ticket hỗ trợ
   */
  static async getTicketStatus(ticketId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/support/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket status:', error);
      throw error;
    }
  }
}

export default CancelTourService;
