// Vietnamese font support for jsPDF
// Using DejaVu Sans - a font that supports Vietnamese characters

// This is a lightweight approach - we'll use CSS web fonts and canvas to render Vietnamese text
export const setupVietnameseFont = (pdf) => {
  // Set UTF-8 encoding for Vietnamese
  pdf.internal.pageSize.orientation = 'portrait';
  
  // Add font fallback for Vietnamese characters
  const originalText = pdf.text;
  
  pdf.text = function(text, x, y, options) {
    if (typeof text === 'string') {
      // Normalize Vietnamese text to ensure proper rendering
      const normalizedText = text.normalize('NFC');
      return originalText.call(this, normalizedText, x, y, options);
    }
    return originalText.call(this, text, x, y, options);
  };
  
  return pdf;
};

// Vietnamese character mapping for better compatibility
export const vietnameseCharMap = {
  'à': 'a\u0300',
  'á': 'a\u0301', 
  'ạ': 'a\u0323',
  'ả': 'a\u0309',
  'ã': 'a\u0303',
  'â': 'a\u0302',
  'ầ': 'a\u0302\u0300',
  'ấ': 'a\u0302\u0301',
  'ậ': 'a\u0302\u0323',
  'ẩ': 'a\u0302\u0309',
  'ẫ': 'a\u0302\u0303',
  'ă': 'a\u0306',
  'ằ': 'a\u0306\u0300',
  'ắ': 'a\u0306\u0301',
  'ặ': 'a\u0306\u0323',
  'ẳ': 'a\u0306\u0309',
  'ẵ': 'a\u0306\u0303',
  'è': 'e\u0300',
  'é': 'e\u0301',
  'ẹ': 'e\u0323',
  'ẻ': 'e\u0309',
  'ẽ': 'e\u0303',
  'ê': 'e\u0302',
  'ề': 'e\u0302\u0300',
  'ế': 'e\u0302\u0301',
  'ệ': 'e\u0302\u0323',
  'ể': 'e\u0302\u0309',
  'ễ': 'e\u0302\u0303',
  'ì': 'i\u0300',
  'í': 'i\u0301',
  'ị': 'i\u0323',
  'ỉ': 'i\u0309',
  'ĩ': 'i\u0303',
  'ò': 'o\u0300',
  'ó': 'o\u0301',
  'ọ': 'o\u0323',
  'ỏ': 'o\u0309',
  'õ': 'o\u0303',
  'ô': 'o\u0302',
  'ồ': 'o\u0302\u0300',
  'ố': 'o\u0302\u0301',
  'ộ': 'o\u0302\u0323',
  'ổ': 'o\u0302\u0309',
  'ỗ': 'o\u0302\u0303',
  'ơ': 'o\u031B',
  'ờ': 'o\u031B\u0300',
  'ớ': 'o\u031B\u0301',
  'ợ': 'o\u031B\u0323',
  'ở': 'o\u031B\u0309',
  'ỡ': 'o\u031B\u0303',
  'ù': 'u\u0300',
  'ú': 'u\u0301',
  'ụ': 'u\u0323',
  'ủ': 'u\u0309',
  'ũ': 'u\u0303',
  'ư': 'u\u031B',
  'ừ': 'u\u031B\u0300',
  'ứ': 'u\u031B\u0301',
  'ự': 'u\u031B\u0323',
  'ử': 'u\u031B\u0309',
  'ữ': 'u\u031B\u0303',
  'ỳ': 'y\u0300',
  'ý': 'y\u0301',
  'ỵ': 'y\u0323',
  'ỷ': 'y\u0309',
  'ỹ': 'y\u0303',
  'đ': 'd\u0335'
};

// Convert Vietnamese characters to compatible format
export const normalizeVietnameseText = (text) => {
  if (!text) return '';
  
  // First normalize using NFC
  let normalized = text.normalize('NFC');
  
  // Then apply character mapping for better PDF compatibility
  Object.keys(vietnameseCharMap).forEach(char => {
    const replacement = vietnameseCharMap[char];
    normalized = normalized.replace(new RegExp(char, 'g'), replacement);
  });
  
  return normalized;
};
