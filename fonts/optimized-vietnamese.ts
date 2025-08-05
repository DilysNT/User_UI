// Vietnamese Font Setup - Final Solution
// Toi uu text rendering thay vi dung font tuy chinh

// Helper function de xu ly text tieng Viet truoc khi render - SIMPLE VERSION
const preprocessVietnameseText = (text: string): string => {
  if (!text) return '';
  
  try {
    // Just normalize and clean - nothing fancy
    let normalizedText = text.normalize('NFC').trim();
    
    // Only remove truly problematic invisible characters
    normalizedText = normalizedText.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    return normalizedText;
  } catch (error) {
    console.warn('Text preprocessing failed:', error);
    return text.trim();
  }
};

// Ham setup font voi toi uu SIMPLE - Su dung Times font cho Vietnamese
export const setupOptimizedVietnameseFont = async (pdf: any): Promise<string> => {
  try {
    console.log('Setting up SIMPLE Vietnamese text rendering with Times font...');
    
    // Times font handles Vietnamese characters better than Helvetica
    try {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(11); // Slightly larger default for better readability
      
      console.log('Using Times font for better Vietnamese support');
      return 'times';
      
    } catch (error) {
      console.log('Times font failed, using Helvetica fallback...', error);
      
      // Fallback to Helvetica with larger size
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      console.log('Using Helvetica fallback with larger font size');
      return 'helvetica';
    }
  } catch (error) {
    console.warn('All font setup failed:', error);
    return 'helvetica';
  }
};

// Helper function de render text tieng Viet tot hon - SIMPLE AND EFFECTIVE
const renderVietnameseText = (pdf: any, text: string, x: number, y: number, options?: any) => {
  try {
    // Simple preprocessing
    const processedText = preprocessVietnameseText(text);
    
    // Use Times font which handles Vietnamese better than Helvetica
    pdf.setFont('times', 'normal');
    
    // Ensure reasonable font size - not too small
    const currentSize = pdf.getFontSize();
    if (currentSize < 10) {
      pdf.setFontSize(10);
    }
    
    // Simple rendering - no fancy spacing
    pdf.text(processedText, x, y, options);
    
    console.log(`✅ Simple Vietnamese render: "${processedText}"`);
  } catch (error) {
    console.warn('❌ Simple Vietnamese rendering failed:', error);
    
    try {
      // Ultra-simple fallback
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(text || '', x, y, options);
      console.log(`⚠️ Ultra-simple fallback: "${text}"`);
    } catch (finalError) {
      console.error('❌ All rendering failed:', finalError);
      pdf.text('', x, y, options);
    }
  }
};

// Nếu bạn gặp lỗi 401 (Unauthorized) khi gọi API hoặc tải resource:
// Đây là lỗi xác thực, không liên quan đến file này.
// Để ẩn lỗi này trên giao diện, bạn có thể dùng try/catch hoặc kiểm tra status code trong hàm gọi API.
// Ví dụ (fetch):
// fetch(url, ...).catch(err => {/* Ẩn lỗi hoặc xử lý riêng */})
// Hoặc kiểm tra response.status === 401 để không hiển thị lỗi lên UI.
// Nếu chỉ muốn ẩn log trên console, có thể comment hoặc xóa dòng console.error/console.warn liên quan đến lỗi này.

// Export functions
export { setupOptimizedVietnameseFont as setupVietnameseFont, renderVietnameseText };
