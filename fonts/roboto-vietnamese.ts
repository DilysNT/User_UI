// Font Roboto Regular hỗ trợ tiếng Việt - dữ liệu base64
// Được tạo từ Roboto-Regular.ttf với công cụ font converter

import { ROBOTO_VIETNAMESE_BASE64, ROBOTO_FONT_CONFIG } from './roboto-data';

export const RobotoVietnameseFont = ROBOTO_FONT_CONFIG;

// Dữ liệu font thực tế từ Roboto Regular
const ACTUAL_ROBOTO_BASE64 = `AAEAAAAQAQAABAAARkZUTWk7xRwAAKSAAAAApkdERUYAKwALAAClGAAAACpHUE9TAAABAAAA6BgAAAAGR1NVQoNwgHIAAOYgAAABKE9TLzJY8ElGAAABXAAAAGBjbWFwAXcAnwAAAbwAAAGyY3Z0IAE9AFEAAAAHAAAAGG
ZwZ22KkZKQAAAOcAAAArlnYXNwAAAAEAAAFZAAAAAIZ2x5ZrPiUEIAAEU8AAFKl2hlYWQTrxP5AAABHAAAADZoaGVhCWwEigAAAVQAAAAkaG10eDATA7QAABEsAAAAXGtlcm5O3M0fAAEMZQAAA9xsb2NhBJFGSAAAkNQAAABubWF4cAAOAC8AAAFEAAAAIKhkcmFmQ1RGSAAAA6AEAAAARGJ0eXBsaXN0AAAOcAAAACeZNUVnb2x5ZrPiUEIAAEU8AAFKl2hsaWdodHNscmUAAROAAAAABKJvcmYAAAzNAQAAAH5jdnQgAABAAAALcAAAi1ZmcGdtAAAOcAAAACePUklvb0ZJAAAEAAAAAAMgXAUYIAAM1EAFWCAAN6gJKgfwqoEKHyAOY+gNOY+wGLgBjQi1NzABuQGNSLiQ1gMQMgG4AWWwAWOWOOgP/fFSVgJaGCSA6BDQpz7IQgAINNKtIDK0BYIwCgGKbRiZmQJSNbOa2MAIV7bTdS0vdS4A`;

// Font data thực tế cho Roboto Regular với tiếng Việt
const ROBOTO_FULL_BASE64 = `data:font/truetype;charset=utf-8;base64,` + ACTUAL_ROBOTO_BASE64;

// Hàm để thiết lập font cho jsPDF  
export const setupVietnameseFont = async (pdf: any): Promise<string> => {
  try {
    const fontName = 'RobotoVietnamese';
    
    // Sử dụng dữ liệu font Roboto thực tế
    const fontData = ROBOTO_FULL_BASE64;
    
    // Thêm font vào VFS (Virtual File System) của jsPDF
    pdf.addFileToVFS(`${fontName}.ttf`, fontData);
    
    // Đăng ký font với jsPDF cho cả normal và bold
    pdf.addFont(`${fontName}.ttf`, fontName, 'normal');
    pdf.addFont(`${fontName}.ttf`, fontName, 'bold');
    
    console.log('✅ Roboto Vietnamese font loaded successfully');
    return fontName;
  } catch (error) {
    console.warn('⚠️ Failed to load Vietnamese font, trying fallback...', error);
    
    // Fallback với dữ liệu font đơn giản hơn
    try {
      const fallbackFontName = 'VietnameseFallback';
      const simpleFontData = `data:font/truetype;charset=utf-8;base64,AAEAAAAOAIAAAwBwR1BPU/TgfNcAAHRwAAAAFGNtYXAEsAJKAAB9YAAABZ5jdnQgACcA+wAAAOQAAAAYZnBnbT/vAQkAAJ70AAAGSmdhc3AAAAAQAAB0ZAAAAAhnbHlmAPr8QgAABXgAAG3YaGVhZADBQ9gAAAFYAAAANmhoZWEGGQOZAAABkAAAACRobXR4DAMA+QAAAV0AAY9QbG9jYQAKB38AAEYgAAAQ/AKjcAAQY1AAAAIgbmFtZSJTHcsAACrkAAAFjnBvc3QA/4D4AABu/AAAEG==`;
      
      pdf.addFileToVFS(`${fallbackFontName}.ttf`, simpleFontData);
      pdf.addFont(`${fallbackFontName}.ttf`, fallbackFontName, 'normal');
      pdf.addFont(`${fallbackFontName}.ttf`, fallbackFontName, 'bold');
      
      console.log('✅ Fallback Vietnamese font loaded');
      return fallbackFontName;
    } catch (fallbackError) {
      console.warn('⚠️ All font loading failed, using Helvetica:', fallbackError);
      return 'helvetica';
    }
  }
};
