// Advanced Vietnamese text rendering for jsPDF using Canvas
export class VietnameseTextRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.setupCanvas();
  }
  
  setupCanvas() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.style.display = 'none';
      document.body.appendChild(this.canvas);
      
      // Enable high DPI rendering for better quality
      const dpr = window.devicePixelRatio || 1;
      this.canvas.style.width = '100px';
      this.canvas.style.height = '50px';
    }
  }
  
  // Enhanced Vietnamese text rendering with better quality
  renderTextAsImage(text, fontSize = 12, fontFamily = 'Arial, sans-serif', color = '#000000', bold = false) {
    if (!this.ctx) return null;
    
    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    
    // Normalize Vietnamese text - critical for proper rendering
    const normalizedText = text.normalize('NFC');
    
    // Set font properties with better Vietnamese support
    const fontWeight = bold ? 'bold' : 'normal';
    const fullFont = `${fontWeight} ${fontSize * dpr}px ${fontFamily}`;
    this.ctx.font = fullFont;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.textRenderingOptimization = 'optimizeQuality';
    
    // Measure text dimensions with padding
    const metrics = this.ctx.measureText(normalizedText);
    const textWidth = Math.ceil(metrics.width) + 8; // Extra padding
    const textHeight = Math.ceil(fontSize * dpr * 1.4) + 8; // Extra padding
    
    // Set canvas size with high DPI
    this.canvas.width = textWidth;
    this.canvas.height = textHeight;
    
    // Scale canvas for high DPI
    this.ctx.scale(dpr, dpr);
    
    // Clear canvas with white background for better contrast
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, textWidth / dpr, textHeight / dpr);
    
    // Re-apply font settings after canvas resize
    this.ctx.font = fullFont;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // Enable anti-aliasing for smoother text
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Draw text with proper positioning
    this.ctx.fillText(normalizedText, 4 / dpr, 4 / dpr);
    
    return {
      dataUrl: this.canvas.toDataURL('image/png', 1.0), // Max quality
      width: this.canvas.width,
      height: this.canvas.height,
      textWidth: textWidth / dpr,
      textHeight: textHeight / dpr,
      originalText: text,
      normalizedText: normalizedText
    };
  }
  
  // Enhanced PDF text addition with better positioning
  addVietnameseText(pdf, text, x, y, options = {}) {
    const {
      fontSize = 12,
      fontFamily = 'Arial, sans-serif',
      color = '#000000',
      bold = false,
      lineHeight = 1.2
    } = options;
    
    const imageData = this.renderTextAsImage(text, fontSize, fontFamily, color, bold);
    
    if (imageData) {
      // Calculate dimensions in PDF units with better scaling
      const pdfWidth = imageData.textWidth * 0.75;
      const pdfHeight = fontSize * lineHeight;
      
      try {
        pdf.addImage(imageData.dataUrl, 'PNG', x, y, pdfWidth, pdfHeight, undefined, 'FAST');
        return { 
          width: pdfWidth, 
          height: pdfHeight,
          success: true,
          method: 'canvas'
        };
      } catch (error) {
        console.warn('Failed to add Vietnamese text as image:', error);
        // Fallback to regular text
        pdf.text(imageData.normalizedText, x, y + fontSize * 0.8);
        return { 
          width: imageData.textWidth * 0.75, 
          height: fontSize,
          success: false,
          method: 'fallback'
        };
      }
    }
    
    // Final fallback
    pdf.text(text.normalize('NFC'), x, y + fontSize * 0.8);
    return { 
      width: text.length * fontSize * 0.6, 
      height: fontSize,
      success: false,
      method: 'basic'
    };
  }
  
  cleanup() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Enhanced easy-to-use function with better defaults
export const addVietnameseTextToPDF = (pdf, text, x, y, options = {}) => {
  const {
    fontSize = 12,
    fontFamily = 'Arial, "Segoe UI", "Microsoft YaHei", sans-serif', // Better Vietnamese font stack
    color = '#000000',
    bold = false,
    useImage = true,
    lineHeight = 1.2
  } = options;
  
  if (useImage && typeof window !== 'undefined') {
    const renderer = new VietnameseTextRenderer();
    const result = renderer.addVietnameseText(pdf, text, x, y, {
      fontSize, fontFamily, color, bold, lineHeight
    });
    renderer.cleanup();
    return result;
  } else {
    // Enhanced fallback with normalization
    const normalizedText = text.normalize('NFC');
    if (bold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    pdf.setFontSize(fontSize);
    pdf.text(normalizedText, x, y + fontSize * 0.8);
    return { 
      width: normalizedText.length * fontSize * 0.6, 
      height: fontSize,
      success: true,
      method: 'normalized'
    };
  }
};
