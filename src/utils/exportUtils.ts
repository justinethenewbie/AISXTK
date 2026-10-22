// Utility for exporting XSTK practice exercises and exam sets to Word (.doc/.docx) and PDF

export interface ExportExerciseItem {
  id?: string;
  title?: string;
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  strategyHint?: string;
  keyFormulas?: string[];
  expectedAnswerSummary?: string;
}

interface ExportOptions {
  title: string;
  subject?: string;
  chapterTitle?: string;
  difficulty?: string;
  exercises: ExportExerciseItem[];
  isMcq?: boolean;
  includeSolutions?: boolean;
}

/**
 * Export exercises directly to a formatted Microsoft Word document (.doc)
 * Opens cleanly in Word, Google Docs, and LibreOffice with proper styling and Vietnamese diacritics.
 */
export function exportExercisesToWord({
  title,
  subject = 'MÔN: XÁC SUẤT THỐNG KÊ (XSTK)',
  chapterTitle = 'Tổng hợp các chương',
  difficulty = 'Vận dụng',
  exercises,
  isMcq = false,
  includeSolutions = true,
}: ExportOptions) {
  let contentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.5;
          margin: 20mm;
          color: #000000;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .header-table td {
          border: none;
          vertical-align: top;
        }
        .school-name {
          font-weight: bold;
          text-align: center;
          font-size: 11pt;
        }
        .exam-info {
          text-align: center;
          font-weight: bold;
          font-size: 11pt;
        }
        .title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          margin: 15px 0 5px 0;
          text-transform: uppercase;
        }
        .subtitle {
          text-align: center;
          font-size: 11pt;
          font-style: italic;
          margin-bottom: 25px;
        }
        .student-fields {
          margin-bottom: 20px;
          border-bottom: 1px dashed #666;
          padding-bottom: 8px;
          font-size: 11pt;
        }
        .question-block {
          margin-bottom: 18px;
          page-break-inside: avoid;
        }
        .question-title {
          font-weight: bold;
          color: #000;
          margin-bottom: 4px;
        }
        .options-grid {
          margin-left: 20px;
          margin-top: 6px;
        }
        .option-item {
          margin-bottom: 4px;
        }
        .solution-box {
          margin-top: 8px;
          padding: 8px 12px;
          background-color: #f1f5f9;
          border-left: 3px solid #0284c7;
          font-size: 11pt;
        }
        .solution-box strong {
          color: #0369a1;
        }
        .formula-tag {
          font-family: 'Courier New', Courier, monospace;
          background: #e2e8f0;
          padding: 1px 4px;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 50%;">
            <div class="school-name">
              BỘ GIÁO DỤC VÀ ĐÀO TẠO<br>
              <strong>HỆ THỐNG HỌC TẬP THÔNG MINH EDT</strong>
            </div>
          </td>
          <td style="width: 50%;">
            <div class="exam-info">
              ${subject}<br>
              Chủ đề: ${chapterTitle}
            </div>
          </td>
        </tr>
      </table>

      <div class="title">${title}</div>
      <div class="subtitle">Độ khó: ${difficulty} • Số lượng: ${exercises.length} câu • Hệ thống EDT tự động trích xuất</div>

      <div class="student-fields">
        Họ và tên sinh viên: ............................................................................ Mã sinh viên: ................................ Lớp: ........................
      </div>

      <div class="content-body">
  `;

  exercises.forEach((ex, idx) => {
    contentHtml += `
      <div class="question-block">
        <div class="question-title">Câu ${idx + 1}: ${ex.title ? `[${ex.title}] ` : ''}${ex.question}</div>
    `;

    if (isMcq && ex.options && ex.options.length > 0) {
      contentHtml += `<div class="options-grid">`;
      ex.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        contentHtml += `<div class="option-item"><strong>${letter}.</strong> ${opt}</div>`;
      });
      contentHtml += `</div>`;
    }

    if (includeSolutions) {
      if (isMcq) {
        const correctLetter = ex.correctIndex !== undefined ? String.fromCharCode(65 + ex.correctIndex) : '';
        contentHtml += `
          <div class="solution-box">
            <strong>✓ Đáp án đúng: ${correctLetter}</strong><br>
            <strong>Lời giải thích chi tiết:</strong> ${ex.explanation || 'Áp dụng công thức lý thuyết chuẩn.'}
          </div>
        `;
      } else {
        contentHtml += `
          <div class="solution-box">
            ${ex.strategyHint ? `<strong>💡 Chiến lược giải:</strong> ${ex.strategyHint}<br>` : ''}
            ${ex.keyFormulas && ex.keyFormulas.length > 0 ? `<strong>📐 Công thức áp dụng:</strong> ${ex.keyFormulas.map(f => `<span class="formula-tag">${f}</span>`).join(' ; ')}<br>` : ''}
            ${ex.expectedAnswerSummary ? `<strong>🎯 Đáp số & Ý nghĩa:</strong> ${ex.expectedAnswerSummary}` : ''}
          </div>
        `;
      }
    }

    contentHtml += `</div>`;
  });

  contentHtml += `
      </div>
      <div style="margin-top: 30px; text-align: center; font-size: 10pt; color: #666; border-top: 1px solid #ccc; padding-top: 8px;">
        --- HẾT (Tài liệu biên soạn từ Hệ thống Trợ lý Học tập EDT - Bản quyền 2026) ---
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + contentHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileNameClean = title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
  link.download = `${fileNameClean}_EDT.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to safely print or download HTML without window.alert or iframe sandbox failure
 */
function printOrDownloadHtml(html: string, fallbackFileName: string) {
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow && printWindow.document) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      return;
    }
  } catch {
    // Popup blocked by sandbox or browser policy
  }

  // Fallback 1: Hidden iframe printing
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) document.body.removeChild(iframe);
        }, 60000);
      }, 500);
      return;
    }
  } catch {
    // Fallback if iframe fails
  }

  // Fallback 2: Direct file download
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackFileName.endsWith('.html') ? fallbackFileName : `${fallbackFileName}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export exercises to a printable A4 window for instant PDF export (via Browser Print / Save as PDF)
 */
export function exportExercisesToPdf({
  title,
  subject = 'MÔN: XÁC SUẤT THỐNG KÊ (XSTK)',
  chapterTitle = 'Tổng hợp các chương',
  difficulty = 'Vận dụng',
  exercises,
  isMcq = false,
  includeSolutions = true,
}: ExportOptions) {
  let html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>${title} - EDT</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
          line-height: 1.5;
          margin: 0;
          padding: 15px;
          background: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        .brand {
          font-size: 13px;
          font-weight: 800;
          color: #0369a1;
          text-transform: uppercase;
        }
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: 800;
          margin: 10px 0 4px;
          color: #0f172a;
          text-transform: uppercase;
        }
        .subtitle {
          text-align: center;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 15px;
        }
        .meta-strip {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
        }
        .question-card {
          margin-bottom: 16px;
          page-break-inside: avoid;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .q-header {
          font-weight: 700;
          font-size: 13px;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .options-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 8px;
          font-size: 12px;
        }
        .option-box {
          background: #f1f5f9;
          padding: 6px 10px;
          border-radius: 6px;
        }
        .solution-box {
          margin-top: 8px;
          padding: 8px 12px;
          background: #f0fdf4;
          border-left: 4px solid #16a34a;
          border-radius: 4px;
          font-size: 12px;
          color: #14532d;
        }
        .print-btn-bar {
          background: #0284c7;
          color: #fff;
          padding: 10px;
          text-align: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        .print-btn-bar button {
          background: #fff;
          color: #0284c7;
          font-weight: 800;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
        }
        @media print {
          .print-btn-bar {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar">
        <span>Tài liệu đã sẵn sàng! Bấm nút bên cạnh để Lưu thành PDF hoặc In ngay: </span>
        <button onclick="window.print()">In hoặc Lưu thành PDF 🖨️</button>
      </div>

      <div class="header">
        <div>
          <div class="brand">NỀN TẢNG HỌC TẬP THÔNG MINH EDT</div>
          <div style="font-size: 11px; color: #64748b;">Hệ thống Biên soạn Đề thi Xác Suất Thống Kê</div>
        </div>
        <div style="text-align: right; font-size: 11px;">
          <div><strong>${subject}</strong></div>
          <div style="color: #64748b;">Chủ đề: ${chapterTitle}</div>
        </div>
      </div>

      <div class="title">${title}</div>
      <div class="subtitle">Mức độ: ${difficulty} • Tổng số: ${exercises.length} câu • Xuất bản bởi EDT</div>

      <div class="meta-strip">
        <span>Họ và tên: ............................................................................</span>
        <span>Mã sinh viên: .........................</span>
        <span>Lớp: .........................</span>
      </div>
  `;

  exercises.forEach((ex, idx) => {
    html += `
      <div class="question-card">
        <div class="q-header">Câu ${idx + 1}: ${ex.title ? `[${ex.title}] ` : ''}${ex.question}</div>
    `;

    if (isMcq && ex.options && ex.options.length > 0) {
      html += `<div class="options-list">`;
      ex.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        html += `<div class="option-box"><strong>${letter}.</strong> ${opt}</div>`;
      });
      html += `</div>`;
    }

    if (includeSolutions) {
      if (isMcq) {
        const correctLetter = ex.correctIndex !== undefined ? String.fromCharCode(65 + ex.correctIndex) : '';
        html += `
          <div class="solution-box">
            <strong>✓ Đáp án đúng: ${correctLetter}</strong><br>
            <span>${ex.explanation || 'Áp dụng công thức lý thuyết chuẩn.'}</span>
          </div>
        `;
      } else {
        html += `
          <div class="solution-box">
            ${ex.strategyHint ? `<div><strong>💡 Định hướng giải:</strong> ${ex.strategyHint}</div>` : ''}
            ${ex.keyFormulas && ex.keyFormulas.length > 0 ? `<div><strong>📐 Công thức:</strong> ${ex.keyFormulas.join(' ; ')}</div>` : ''}
            ${ex.expectedAnswerSummary ? `<div><strong>🎯 Đáp số:</strong> ${ex.expectedAnswerSummary}</div>` : ''}
          </div>
        `;
      }
    }

    html += `</div>`;
  });

  html += `
      <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 25px;">
        --- HẾT ---
      </div>
    </body>
    </html>
  `;

  printOrDownloadHtml(html, `${title.replace(/[\s/\\?%*:|"<>]/g, '_')}_A4_DeThi.html`);
}

/**
 * Export the complete systematic prompt compilation and technical blueprints to a printable A4 window for instant PDF export
 */
export function exportPromptsToPdf(prompts: any[]) {
  const totalSteps = prompts.length;
  let html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>Tài Liệu Tổng Hợp Prompt & Kiến Trúc Hệ Thống EDT (${totalSteps} Giai Đoạn)</title>
      <style>
        @page {
          size: A4;
          margin: 14mm 14mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          line-height: 1.55;
          margin: 0;
          padding: 15px;
          background: #fff;
          font-size: 12px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0891b2;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        .brand {
          font-size: 15px;
          font-weight: 900;
          color: #0891b2;
          letter-spacing: 1px;
        }
        .subbrand {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }
        .title {
          text-align: center;
          font-size: 20px;
          font-weight: 900;
          margin: 15px 0 6px;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .subtitle {
          text-align: center;
          font-size: 12px;
          color: #475569;
          margin-bottom: 18px;
          line-height: 1.5;
        }
        .intro-box {
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-left: 5px solid #0d9488;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 18px;
          font-size: 12px;
          color: #134e4a;
        }
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 11px;
          page-break-inside: avoid;
        }
        .summary-table th {
          background: #0f172a;
          color: #fff;
          text-align: left;
          padding: 8px 10px;
          font-weight: 800;
        }
        .summary-table td {
          border: 1px solid #e2e8f0;
          padding: 7px 10px;
          vertical-align: top;
        }
        .summary-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .phase-card {
          margin-bottom: 20px;
          page-break-inside: avoid;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .phase-header {
          background: #0f172a;
          color: #fff;
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .phase-num {
          background: #06b6d4;
          color: #020617;
          font-weight: 900;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .phase-title {
          font-weight: 800;
          font-size: 13px;
          color: #f8fafc;
        }
        .phase-category {
          font-size: 10.5px;
          color: #94a3b8;
          font-family: monospace;
        }
        .phase-body {
          padding: 14px 16px;
          background: #ffffff;
        }
        .goal-label {
          font-weight: bold;
          color: #0369a1;
          margin-bottom: 4px;
          font-size: 11.5px;
        }
        .prompt-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-left: 4px solid #06b6d4;
          border-radius: 6px;
          padding: 12px 14px;
          margin: 8px 0 12px;
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.5;
          color: #0f172a;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .system-prompt-box {
          background: #fefce8;
          border-left: 4px solid #ca8a04;
          padding: 8px 12px;
          font-size: 11px;
          color: #713f12;
          margin: 8px 0 12px;
          border-radius: 0 6px 6px 0;
          font-weight: 500;
        }
        .tech-list {
          margin: 6px 0 10px;
          padding-left: 18px;
          font-size: 11.5px;
          color: #334155;
        }
        .output-tags {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .output-tag {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
          font-size: 10.5px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .print-btn-bar {
          background: #0284c7;
          color: #fff;
          padding: 12px;
          text-align: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-radius: 8px;
          margin-bottom: 18px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .print-btn-bar button {
          background: #fff;
          color: #0284c7;
          font-weight: 800;
          border: none;
          padding: 9px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .print-btn-bar button:hover {
          background: #f0fdfa;
        }
        @media print {
          .print-btn-bar {
            display: none;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar">
        <span>Tài liệu Tổng hợp Toàn bộ Prompt & Hướng Dẫn Xây Dựng (${totalSteps} Giai đoạn) đã sẵn sàng: </span>
        <button onclick="window.print()">In hoặc Lưu thành PDF 🖨️</button>
      </div>

      <div class="header">
        <div>
          <div class="brand">EDT AI STUDIO BUILD</div>
          <div class="subbrand">Hệ Thống Gia Sư & Máy Tính Casio Xác Suất Thống Kê Chuẩn Đại Học</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          <div>Mã Ứng Dụng: <strong>196eca03-5b99-42cc-af56-1bb9edcd950c</strong></div>
          <div>Ngày xuất bản: ${new Date().toLocaleDateString('vi-VN')} | Tổng: <strong>${totalSteps} Giai đoạn</strong></div>
        </div>
      </div>

      <div class="title">BẢN TỔNG HỢP TOÀN BỘ PROMPT & HƯỚNG DẪN XÂY DỰNG ỨNG DỤNG EDT</div>
      <div class="subtitle">
        Trình tự hệ thống hóa đầy đủ ${totalSteps} Giai đoạn (Phases) từ khởi tạo kiến trúc, vi xử lý toán học, Casio ảo, xuất Word/PDF, giao diện Cyber Neon, CSDL Dev, Bảo mật Server-side API Key, Khởi động Dev Server đến Tự động hóa Prompt
      </div>

      <div class="intro-box">
        <strong>📋 HƯỚNG DẪN DÀNH CHO DEVELOPER & NGƯỜI DÙNG:</strong><br>
        Tài liệu này tổng hợp toàn bộ các câu lệnh Prompt gốc của người dùng, chỉ dẫn hệ thống (System Instructions), giải pháp kỹ thuật và mã nguồn theo đúng trình tự từ đầu đến nay. Bạn có thể sử dụng trực tiếp các Prompt này theo thứ tự từ Giai đoạn 1 đến Giai đoạn ${totalSteps} để tái lập hoặc phát triển một ứng dụng tương tự trên Google AI Studio hoặc bất kỳ IDE nào mà không thiếu bất kỳ bước nào.
      </div>

      <!-- Quick Executive Summary Table -->
      <table class="summary-table">
        <thead>
          <tr>
            <th style="width: 8%;">Bước</th>
            <th style="width: 28%;">Giai Đoạn & Lĩnh Vực</th>
            <th style="width: 44%;">Mục Tiêu Trọng Tâm</th>
            <th style="width: 20%;">Công Nghệ / Module</th>
          </tr>
        </thead>
        <tbody>
          ${prompts.map((p) => `
            <tr>
              <td style="text-align: center; font-weight: bold; color: #0284c7;">#${p.stepNumber}</td>
              <td><strong>${p.phaseTitle}</strong><br><span style="color: #64748b; font-size: 10px;">${p.category}</span></td>
              <td>${p.goal}</td>
              <td style="font-size: 10.5px; color: #0369a1;">${p.keyOutputs?.[0] || 'Module hệ thống'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
  `;

  prompts.forEach((item) => {
    html += `
      <div class="phase-card">
        <div class="phase-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="phase-num">GIAI ĐOẠN ${item.stepNumber}</span>
            <span class="phase-title">${item.phaseTitle}</span>
          </div>
          <span class="phase-category">${item.category}</span>
        </div>
        <div class="phase-body">
          <div class="goal-label">🎯 Mục tiêu cốt lõi:</div>
          <p style="margin: 0 0 10px; color: #334155; font-size: 12px; line-height: 1.5;">${item.goal}</p>

          <div class="goal-label">💬 Câu Lệnh Prompt Người Dùng (User Prompt Hoàn Chỉnh):</div>
          <div class="prompt-box">${item.fullPromptText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

          ${
            item.systemInstructionsPrompt
              ? `
              <div class="goal-label">⚙️ Chỉ dẫn hệ thống (System Prompt / Persona AI):</div>
              <div class="system-prompt-box">${item.systemInstructionsPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            `
              : ''
          }

          <div class="goal-label" style="margin-top: 10px;">🛠️ Triển khai kỹ thuật trọng tâm:</div>
          <ul class="tech-list">
            ${item.technicalImplementation.map((tech: string) => `<li>${tech}</li>`).join('')}
          </ul>

          <div class="goal-label" style="margin-top: 10px;">📦 Sản phẩm / Thành phần bàn giao:</div>
          <div class="output-tags">
            ${item.keyOutputs.map((out: string) => `<span class="output-tag">✓ ${out}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  });

  html += `
      <div style="margin-top: 30px; padding: 15px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
        <p><strong>EDT - AI Tutor Xác Suất Thống Kê Đại Học</strong> • Bản quyền tài liệu kỹ thuật & Prompt Blueprint</p>
        <p>Tự động tổng hợp và đồng bộ bởi Google AI Studio Build System • Bao gồm đầy đủ ${totalSteps} Giai đoạn</p>
      </div>
    </body>
    </html>
  `;

  printOrDownloadHtml(html, 'EDT_Tong_Hop_Prompt_He_Thong_A4.html');
}

/**
 * Export prompt compilation directly to Microsoft Word (.doc)
 */
export function exportPromptsToWord(prompts: any[]) {
  const totalSteps = prompts.length;
  let contentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Tong_Hop_Prompt_EDT_${totalSteps}_Giai_Doan</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          margin: 20mm;
          color: #000000;
        }
        .title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          margin: 15px 0 5px 0;
          text-transform: uppercase;
          color: #0284c7;
        }
        .subtitle {
          text-align: center;
          font-size: 11pt;
          font-style: italic;
          margin-bottom: 20px;
        }
        .phase-block {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .phase-title {
          font-weight: bold;
          font-size: 13pt;
          color: #0f172a;
          border-bottom: 1px solid #0891b2;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        .prompt-text {
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 10px;
          font-family: 'Consolas', monospace;
          font-size: 10pt;
          margin: 8px 0;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <div class="title">BẢN TỔNG HỢP TOÀN BỘ PROMPT & HƯỚNG DẪN XÂY DỰNG ỨNG DỤNG EDT</div>
      <div class="subtitle">Trình tự hệ thống hóa đầy đủ ${totalSteps} Giai đoạn tái lập ứng dụng EDT - AI Tutor & Casio Calculator</div>
  `;

  prompts.forEach((item) => {
    contentHtml += `
      <div class="phase-block">
        <div class="phase-title">GIAI ĐOẠN ${item.stepNumber}: ${item.phaseTitle} (${item.category})</div>
        <p><strong>Mục tiêu:</strong> ${item.goal}</p>
        <p><strong>Câu lệnh Prompt:</strong></p>
        <div class="prompt-text">${item.fullPromptText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        ${item.systemInstructionsPrompt ? `<p><strong>Chỉ dẫn hệ thống:</strong> ${item.systemInstructionsPrompt}</p>` : ''}
        <p><strong>Giải pháp kỹ thuật:</strong></p>
        <ul>
          ${item.technicalImplementation.map((t: string) => `<li>${t}</li>`).join('')}
        </ul>
        <p><strong>Sản phẩm bàn giao:</strong></p>
        <ul>
          ${item.keyOutputs.map((o: string) => `<li>${o}</li>`).join('')}
        </ul>
      </div>
    `;
  });

  contentHtml += `
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', contentHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `EDT_Tong_Hop_Prompt_He_Thong_${totalSteps}_Giai_Doan.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


