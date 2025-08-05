// Test file để kiểm tra font tiếng Việt trong PDF export
// Chạy file này để test trước khi deploy

import { setupVietnameseFont } from './roboto-vietnamese';

async function testVietnameseFont() {
  try {
    // Giả lập jsPDF object
    const mockPDF = {
      fonts: new Map(),
      vfs: new Map(),
      
      addFileToVFS(filename: string, data: string) {
        this.vfs.set(filename, data);
        console.log(`✅ Font file added to VFS: ${filename}`);
      },
      
      addFont(filename: string, fontName: string, style: string) {
        this.fonts.set(`${fontName}-${style}`, filename);
        console.log(`✅ Font registered: ${fontName} (${style})`);
      }
    };
    
    // Test setup font
    const fontName = await setupVietnameseFont(mockPDF as any);
    
    if (fontName === 'helvetica') {
      console.warn('⚠️ Font fallback to Helvetica - Vietnamese characters may not display correctly');
    } else {
      console.log(`✅ Vietnamese font setup successful: ${fontName}`);
    }
    
    // Test các ký tự tiếng Việt
    const testText = [
      'Hóa đơn booking tour',
      'Tên tour: Tour khám phá Đà Nẵng - Hội An 4N3Đ',
      'Địa điểm: Đà Nẵng',
      'Khởi hành: 05/09/2025',
      'Số người lớn: 2 người',
      'Số trẻ em: 0 người',
      'Họ tên: Nguyễn Văn A',
      'Email: nguyen.vana@email.com',
      'Điện thoại: 0123 456 789',
      'Giá tour gốc: 10.400.000 VNĐ',
      'Số tiền giảm: -1.040.000 VNĐ',
      'Phương thức: VNPay',
      'TỔNG THANH TOÁN: 9.360.000 VNĐ',
      'Có mặt trước giờ khởi hành 30 phút',
      'Mang theo CMND/CCCD/Hộ chiếu',
      'Hotline: 1900 1234'
    ];
    
    console.log('\n📝 Test text content:');
    testText.forEach((text, index) => {
      console.log(`${index + 1}. ${text}`);
    });
    
    // Test các ký tự đặc biệt
    const specialChars = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ';
    console.log('\n🔤 Special Vietnamese characters test:');
    console.log(specialChars);
    
    return {
      success: true,
      fontName: fontName,
      testPassed: fontName !== 'helvetica'
    };
    
  } catch (error) {
    console.error('❌ Font test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export test function
export { testVietnameseFont };

// Nếu chạy trực tiếp
if (typeof window !== 'undefined') {
  console.log('🧪 Running Vietnamese Font Test...\n');
  testVietnameseFont().then(result => {
    console.log('\n📊 Test Results:', result);
    if (result.success && result.testPassed) {
      console.log('🎉 All tests passed! Vietnamese font is ready for PDF export.');
    } else if (result.success && !result.testPassed) {
      console.log('⚠️ Font fallback detected. Consider updating font data.');
    } else {
      console.log('❌ Tests failed. Check font configuration.');
    }
  });
}
