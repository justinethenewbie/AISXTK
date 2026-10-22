// Complete systematic compilation of all prompts and technical blueprints
// for building the EDT - AI Tutor & Casio Calculator Probability & Statistics Application
// Automatically synchronized with Google AI Studio prompt versions

export interface PromptStepItem {
  stepNumber: number;
  phaseTitle: string;
  category: string;
  goal: string;
  fullPromptText: string;
  systemInstructionsPrompt?: string;
  technicalImplementation: string[];
  keyOutputs: string[];
  timestamp?: string;
}

export const PROMPTS_HISTORY_DATA: PromptStepItem[] = [
  {
    stepNumber: 1,
    phaseTitle: 'Khởi Tạo Kiến Trúc Nền Tảng Ứng Dụng Học Tập XSTK Toàn Diện',
    category: 'Architecture & Core Learning Engine',
    goal: 'Xây dựng toàn bộ nền tảng học tập Xác Suất Thống Kê Đại Học với 7 chương chuẩn, phương pháp Feynman 5 bước, chấm điểm bằng hình ảnh/iPad và phòng vấn đáp AI.',
    fullPromptText: `Hãy xây dựng một ứng dụng web học tập toàn diện cho môn Xác Suất Thống Kê Đại Học (XSTK) theo phong cách hiện đại:
1. Hệ thống bài giảng 7 chương chuẩn đại học theo phương pháp Feynman 5 bước: Đặt vấn đề thực tế -> Bản chất khái niệm -> Công thức KaTeX -> Ví dụ mẫu giáo viên -> Thử sức tại lớp.
2. Công cụ chấm bài tự luận bằng hình ảnh / viết tay trên bảng tương tác iPad với AI Tutor Cú Thông Thái, phản hồi theo barem điểm 10.
3. Phòng thi Vấn đáp AI hai chiều: Giám khảo AI đặt câu hỏi khảo sát sinh viên, hoặc sinh viên tự do gửi câu hỏi, hình ảnh, tài liệu để được giải đáp cặn kẽ.
4. Tương tác giọng nói Speech-to-Text & Text-to-Speech tự động trình chiếu công thức lên bảng iPad.
5. Bản đồ tư duy (Mindmap) 7 chương có thể tùy chỉnh thêm ghi chú và xuất file ảnh.
6. Nhật ký theo dõi lỗi sai thông minh (Mistake Analytics) phân tích nguyên nhân gốc rễ.
7. Diễn đàn học tập cộng đồng có kiểm duyệt nội dung tự động bằng AI.
8. Hệ thống Gamification: Linh vật Cú, chuỗi học tập Streak, EXP, Level, và Rương kho báu mở khóa vật phẩm.`,
    systemInstructionsPrompt: `Bạn là AI Tutor kiêm Chuyên gia Sư phạm Xác suất thống kê Đại học. Khi hướng dẫn sinh viên, luôn ưu tiên giải thích bản chất trực quan theo phương pháp Feynman trước khi đưa ra công thức toán học. Mọi công thức phải được render bằng KaTeX chuẩn mực. Khi chấm bài, cung cấp chiến lược định hướng trước khi đưa ra lời giải hoàn chỉnh.`,
    technicalImplementation: [
      'Thiết lập React SPA với Vite, TypeScript và Tailwind CSS.',
      'Tích hợp KaTeX để hiển thị công thức toán học sắc nét.',
      'Xây dựng Canvas HTML5 tương tác hỗ trợ bút vẽ cảm ứng Stylus / chuột như màn hình iPad.',
      'Tích hợp Web Speech API cho nhận dạng giọng nói và phát âm thanh phản hồi.',
      'Xây dựng backend Express với các endpoint AI Tutor hỗ trợ Gemini Flash API.'
    ],
    keyOutputs: [
      'Bộ dữ liệu 7 chương giáo trình chuẩn (curriculumData.ts).',
      'Thành phần bài giảng 5 bước Feynman tương tác (ChapterLearning.tsx).',
      'Bảng vẽ Canvas chấm bài (InteractiveCanvas.tsx).',
      'Phòng vấn đáp AI hai chiều (TheoreticalViva.tsx).'
    ],
    timestamp: '2026-10-18 09:00:00'
  },
  {
    stepNumber: 2,
    phaseTitle: 'Vi Xử Lý Toán Học 4 Bước & Giải Tích Phân Biến Ngẫu Nhiên Liên Tục',
    category: 'Math Processor & Continuous Variable Analysis',
    goal: 'Biến ứng dụng thành một bộ vi xử lý toán học thông minh, tự động giải các bài toán tích phân biến ngẫu nhiên liên tục theo 4 bước chuẩn và hướng dẫn bấm máy Casio fx-580VN X thực tế.',
    fullPromptText: `Bạn là bộ vi xử lý toán học kiêm gia sư môn Xác suất thống kê đại học.
Vì người dùng nhập liệu trên bàn phím máy tính thông thường hoặc qua bàn phím ảo, họ sẽ gửi biểu thức dưới dạng chữ viết thường hoặc mã LaTeX cơ bản. Nhiệm vụ của bạn là:
1. QUY TẮC ĐỌC KÝ HIỆU: int(a, b, f(x)), -inf, +inf, sum, sqrt, e^x, nCr, Phi(z).
2. CÁCH GIẢI BIẾN NGẪU NHIÊN LIÊN TỤC: Quy trình 4 bước từ tìm hằng số k, hàm mật độ f(x), kỳ vọng E(X) đến phương sai Var(X).
3. HƯỚNG DẪN BẤM MÁY CASIO: Kèm mẹo thế 10^9 cho vô cực trong phòng thi.`,
    systemInstructionsPrompt: `Luôn tuân thủ quy trình 4 bước chuẩn mực và kèm mẹo bấm máy Casio fx-580VN X với mẹo thế 10^9 cho vô cực để sinh viên áp dụng ngay trong phòng thi đại học.`,
    technicalImplementation: [
      'Xây dựng thành phần MathProcessor.tsx chuyên giải toán tích phân và biến liên tục.',
      'Bộ parser nhận diện linh hoạt cả ký hiệu dạng chữ (int, -inf, +inf) lẫn mã KaTeX (\\int, \\infty).',
      'Tích hợp thuật toán tính tích phân số học Simpson và phân tích nguyên hàm symbolic.',
      'Tự động định dạng kết quả kép: Phân số tối giản (fraction) song song với số thập phân 4 chữ số.'
    ],
    keyOutputs: [
      'Module Vi Xử Lý Tích Phân & 4 Bước (MathProcessor.tsx).',
      'Khung hướng dẫn bấm máy Casio fx-580VN X thực tế trong phòng thi.'
    ],
    timestamp: '2026-10-18 14:30:00'
  },
  {
    stepNumber: 3,
    phaseTitle: 'Máy Tính Casio Ảo Chạy Trực Tiếp Trên Web & Bàn Phím Ký Hiệu Đặc Biệt',
    category: 'Virtual Casio Calculator & Keypad UI',
    goal: 'Nâng cấp máy tính xác suất thống kê hoạt động như một chiếc máy tính cầm tay Casio fx-580VN X thực thụ, có bàn phím ảo đầy đủ các ký hiệu giải tích, tổ hợp, phân phối và Natural Textbook Display.',
    fullPromptText: `Hãy cập nhật và nâng cấp riêng cho tính năng Máy tính Xác suất thống kê hoạt động giống như một chiếc máy tính cầm tay Casio thực thụ trên nền web, bổ sung bàn phím ảo tích phân, xích ma, căn bậc hai và Natural Textbook Display KaTeX.`,
    systemInstructionsPrompt: `Không bao giờ từ chối bài toán tích phân hoặc đạo hàm. Luôn hiển thị song song kết quả phân số và số thập phân kèm nút chuyển đổi S<=>D như máy tính Casio thật.`,
    technicalImplementation: [
      'Thiết kế giao diện thân máy Casio fx-580VN X với màn hình LCD retro 2 dòng.',
      'Chuyển đổi chuỗi thô int(...) thành ký hiệu KaTeX uốn lượn trực quan (Natural Textbook Display).',
      'Cung cấp phím bấm S<=>D chuyển đổi qua lại giữa phân số tối giản và số thập phân 4 chữ số.'
    ],
    keyOutputs: [
      'Máy tính Casio hoàn chỉnh trong ứng dụng (CasioCalculator.tsx).'
    ],
    timestamp: '2026-10-18 20:15:00'
  },
  {
    stepNumber: 4,
    phaseTitle: 'Trích Xuất Đề Thi & Bài Tập Ra File Word (.doc) và PDF (In A4)',
    category: 'Export & Document Generation',
    goal: 'Bổ sung các nút bấm cho phép sinh viên và giảng viên trích xuất toàn bộ bộ câu hỏi trắc nghiệm và tự luận do AI sinh ra thành file Word và PDF chuyên nghiệp.',
    fullPromptText: `Các tính năng tạo bài tập cần được tạo thêm các nút để trích bài tập ra các định dạng file Word (.doc) và PDF (In A4) đầy đủ công thức KaTeX và đáp án chi tiết.`,
    systemInstructionsPrompt: `Khi xuất tài liệu Word và PDF, phải định dạng bảng chuẩn hóa, bảo toàn ký tự tiếng Việt Unicode và cung cấp tùy chọn bật/tắt đáp án và lời giải chi tiết.`,
    technicalImplementation: [
      'Xây dựng thư viện exportUtils.ts với hàm exportExercisesToWord và exportExercisesToPdf.',
      'Tạo cửa sổ in Print-Ready chuẩn khổ giấy A4 (@page size: A4) với CSS tối ưu khi in ra PDF.'
    ],
    keyOutputs: [
      'Module xuất file đa năng (exportUtils.ts).'
    ],
    timestamp: '2026-10-19 08:45:00'
  },
  {
    stepNumber: 5,
    phaseTitle: 'Đổi Tên Thành EDT & Đồng Bộ Giao Diện Cyber Neon Độ Tương Phản Cao',
    category: 'UI/UX & Modern Neon Harmonization',
    goal: 'Đổi tên toàn bộ thương hiệu ứng dụng thành EDT, thiết lập bảng màu Cyber Neon Cyan và Emerald hiện đại với độ tương phản văn bản cao, sắc nét.',
    fullPromptText: `Giao diện đổi thành màu neon hiện đại hài hòa, đổi tên app thành EDT, đảm bảo độ tương phản văn bản sắc nét trên nền obsidian slate-950.`,
    systemInstructionsPrompt: `Sử dụng tone màu chủ đạo là Cyber Neon Cyan (#06b6d4) và Neon Emerald (#10b981) trên nền obsidian slate-950.`,
    technicalImplementation: [
      'Cập nhật metadata.json, index.html title và OpenGraph tags sang thương hiệu EDT.'
    ],
    keyOutputs: [
      'metadata.json',
      'TopNavbar.tsx'
    ],
    timestamp: '2026-10-19 14:00:00'
  },
  {
    stepNumber: 6,
    phaseTitle: 'Sơ Đồ Tư Duy AI Phân Nhánh, Tích Hợp Google Drive & Tốc Độ Siêu Tốc < 3 Giây',
    category: 'AI Mindmap & Google Drive Workspace Integration',
    goal: 'Xây dựng công cụ tạo sơ đồ tư duy phân nhánh thông minh với central topic input, đồng bộ Google Workspace OAuth & Google Drive, chuẩn hóa model gemini-2.5-flash.',
    fullPromptText: `Hãy cập nhật và tối ưu hóa toàn diện ứng dụng EDT theo các yêu cầu kỹ thuật:
1. Tối ưu tốc độ phản hồi siêu tốc (< 3 giây) bằng model gemini-2.5-flash.
2. Natural Textbook Display trên máy tính Casio và Vi Xử Lý Tích Phân.
3. Sơ đồ tư duy AI phân nhánh (MindmapViewer.tsx) với central topic input, ghi chú cá nhân và đồng bộ Google Drive.`,
    systemInstructionsPrompt: `Yêu cầu AI xuất JSON súc tích, chuẩn KaTeX, thời gian tạo đề và bản đồ tư duy trả về tức thì trong vòng 2-3 giây.`,
    technicalImplementation: [
      'Xây dựng MindmapViewer.tsx với Central Topic Input, Quick Presets và các nhánh phân nhánh trực quan.',
      'Cấu hình Google Workspace OAuth và googleDriveService.ts hỗ trợ tải lên Markdown và JSON lên Google Drive.',
      'Tối ưu endpoint server.ts gọi gemini-2.5-flash với strict 2.5s timeout.'
    ],
    keyOutputs: [
      'MindmapViewer.tsx',
      'GoogleDriveModal.tsx',
      'Endpoint /api/tutor/generate-mindmap'
    ],
    timestamp: '2026-10-20 09:30:00'
  },
  {
    stepNumber: 7,
    phaseTitle: 'Cổng Đăng Nhập Bắt Buộc (Facebook Auth Wall), Cổng Quản Trị PIN 24062007 & Sửa Lỗi Modal Prompt',
    category: 'Database Persistence, Security Gate & React Hook Fix',
    goal: 'Thiết lập màn hình đăng nhập bắt buộc trước khi vào học để lưu trữ dữ liệu vào users_database.json, bảo mật Developer Portal với mã PIN 24062007, và khắc phục triệt để lỗi Hook trật tự trong PromptHistoryModal.',
    fullPromptText: `Tôi muốn người dùng trước khi vào học cần phải đăng nhập mới được quyền sử dụng công cụ học này giống như trình duyệt đăng nhập facebook vậy bạn phải đăng nhập hoặc có tài khoản để lưu trữ dữ liệu học tập cá nhân trên cơ sở dử liệu mới có quyền tiếp tục sử dụng và nhà phát hành cũng phải đăng nhập vì nhà phát hành có các tính năng khác với tính năng giao diện của người sử dụng. Sửa lỗi màn hình đen ở phần tổng hợp prompt.`,
    systemInstructionsPrompt: `Bảo mật tuyệt đối vai trò nhà phát hành qua mã PIN 24062007, bắt buộc xác thực phiên đăng nhập trước khi truy cập ứng dụng, đồng bộ users_database.json bền vững trên server, và sửa triệt để lỗi khai báo Hook trong React components.`,
    technicalImplementation: [
      'Thiết lập màn hình khóa đăng nhập bắt buộc (Facebook-style Auth Wall) trong App.tsx khi currentUser là null.',
      'Cố định mã PIN Quản Trị Nhà Phát Hành là 24062007 trong server.ts và ẩn nút đăng nhập công khai.',
      'Sửa lỗi vi phạm quy tắc Hook của React (di chuyển các hook useState lên đầu component) trong PromptHistoryModal.tsx để khắc phục triệt để màn hình đen.',
      'Tích hợp auto-sync ghi nhận và đồng bộ hóa prompt vào data/prompts-ledger.json.'
    ],
    keyOutputs: [
      'Màn hình đăng nhập bắt buộc (App.tsx)',
      'CSDL người dùng bền vững (users_database.json)',
      'Sửa lỗi màn hình đen (PromptHistoryModal.tsx)',
      'Sổ lưu trữ prompt hệ thống (data/prompts-ledger.json)'
    ],
    timestamp: '2026-10-20 14:20:00'
  }
];

export const PROMPT_STORAGE_KEY = 'edt_synced_prompts_v2';

/**
 * Fetch and automatically merge prompts from backend server API
 */
export async function syncPromptsWithServer(): Promise<PromptStepItem[]> {
  try {
    const res = await fetch('/api/prompts/history');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.prompts) && data.prompts.length > 0) {
        // Cache to localStorage for offline readiness
        try {
          localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(data.prompts));
        } catch {}
        return data.prompts;
      }
    }
  } catch (e) {
    console.warn('Auto-sync prompts API fallback to static ledger:', e);
  }

  // Fallback to cached or static prompt history
  try {
    const cached = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length >= PROMPTS_HISTORY_DATA.length) {
        return parsed;
      }
    }
  } catch {}

  return PROMPTS_HISTORY_DATA;
}
