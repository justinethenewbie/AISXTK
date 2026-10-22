import React from 'react';
import { WordStyleMathEditor } from './WordStyleMathEditor';

export interface InteractiveCanvasProps {
  onExportCanvas: (dataUrl: string, textContent: string) => void;
  isSubmitting?: boolean;
  initialText?: string;
  submitButtonText?: string;
  placeholder?: string;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  onExportCanvas,
  isSubmitting = false,
  initialText = '',
  submitButtonText = 'Gửi Bài Giải Cho AI Chấm Điểm',
  placeholder = 'Nhấp vào trang văn bản này để bắt đầu gõ lời giải tự luận... Nhấn π Equation để chèn công thức.',
}) => {
  return (
    <WordStyleMathEditor
      initialText={initialText}
      placeholder={placeholder}
      submitButtonText={submitButtonText}
      isSubmitting={isSubmitting}
      showSendButton={true}
      onSendToAI={(fullText, drawingUrl) => onExportCanvas(drawingUrl || '', fullText)}
    />
  );
};

export default InteractiveCanvas;
