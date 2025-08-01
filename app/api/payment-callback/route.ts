import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');
  const bookingId = searchParams.get('bookingId');
  const method = searchParams.get('method');
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');

  console.log('🔄 Payment callback received:', {
    orderId,
    bookingId,
    method,
    vnpResponseCode,
    vnpTransactionStatus,
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Validate VNPay response
  if (method === 'VNPay' || method === 'vnpay') {
    const isSuccess = vnpResponseCode === '00' && vnpTransactionStatus === '00';
    
    if (isSuccess) {
      console.log('✅ VNPay payment successful');
      // Có thể gọi API backend để update payment status ở đây
      // await updatePaymentStatus(orderId, 'completed');
    } else {
      console.log('❌ VNPay payment failed or pending');
    }
  }

  // Redirect to payment success page với tất cả parameters
  const redirectUrl = new URL('/payment-success', request.url);
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Payment callback POST:', body);
    
    // Handle webhook từ payment gateway
    return NextResponse.json({ 
      success: true, 
      message: 'Payment callback processed' 
    });
  } catch (error) {
    console.error('❌ Error processing payment callback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process callback' 
    }, { status: 500 });
  }
}
