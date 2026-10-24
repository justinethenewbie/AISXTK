export interface HubExamQuestion {
  id: string;
  questionNumber: number;
  points: number;
  title: string;
  topic: 'Xác suất cơ bản & Bayes' | 'Biến ngẫu nhiên liên tục' | 'Phân phối xác suất (Poisson/Chuẩn)' | 'Thống kê 1 biến & Ước lượng/Kiểm định' | 'So sánh 2 mẫu';
  text: string;
  camScannerFormulaRef: string; // Tên công thức tương ứng trong tờ CamScanner HUB
  casioKeySequence: string[];   // Phím bấm Casio fx-580VN X thực tế
  solutionSteps: string[];
  finalAnswer: string;
  commonTraps: string;
}

export interface HubExamPaper {
  id: string;
  code: string;
  year: number;
  semester: string;
  title: string;
  faculty: string;
  durationMinutes: number;
  description: string;
  questions: HubExamQuestion[];
}

export const OFFICIAL_HUB_EXAMS: HubExamPaper[] = [
  {
    id: 'hub_2026_02a',
    code: 'MÃ ĐỀ 02a (HUB 2026)',
    year: 2026,
    semester: 'Học kỳ I (Chính Thức)',
    title: 'Đề Thi Kết Thúc Học Phần Xác Suất Thống Kê - Đề Số 02a',
    faculty: 'Khoa Hệ Thống Thông Tin & Khoa Học Dữ Liệu - Bộ Môn Toán Kinh Tế HUB',
    durationMinutes: 75,
    description: 'Đề thi tự luận chuẩn 75 phút được phép mang vào phòng thi: 01 Tờ công thức CamScanner của Bộ môn Toán kinh tế HUB & Máy tính Casio fx-580VN X.',
    questions: [
      {
        id: 'hub_2026_02a_q1',
        questionNumber: 1,
        points: 1.5,
        title: 'Câu 1: Xác Suất Toàn Phần & Công Thức Suy Diễn Bayes',
        topic: 'Xác suất cơ bản & Bayes',
        text: 'Một công ty tài chính nhập linh kiện vi mạch điện tử từ ba phân xưởng I, II, III với tỷ lệ cung ứng lần lượt là 45%, 35% và 20%. Tỷ lệ linh kiện đạt chuẩn chất lượng của ba phân xưởng lần lượt là 92%, 88% và 95%.\na) Lấy ngẫu nhiên một linh kiện từ kho, tính xác suất để linh kiện đó đạt chuẩn chất lượng.\nb) Biết linh kiện được lấy ra đạt chuẩn chất lượng, tính xác suất để linh kiện đó do phân xưởng I sản xuất.',
        camScannerFormulaRef: 'Mục I.2: Công thức Xác suất đầy đủ $P(A) = \\sum P(H_i)P(A|H_i)$ & Công thức Bayes $P(H_i|A) = \\frac{P(H_i)P(A|H_i)}{P(A)}$',
        casioKeySequence: [
          'Bấm [MENU] [1] (COMP)',
          'Tính xác suất đầy đủ: 0.45 × 0.92 + 0.35 × 0.88 + 0.20 × 0.95 = 0.912',
          'Lưu kết quả vào Ans hoặc biến A: [STO] [A]',
          'Tính xác suất Bayes: (0.45 × 0.92) ÷ Ans = 0.4539 (45.39%)',
        ],
        solutionSteps: [
          'Gọi $H_1, H_2, H_3$ lần lượt là biến cố linh kiện do phân xưởng I, II, III sản xuất. Hệ $\{H_1, H_2, H_3\}$ là một nhóm biến cố đầy đủ với $P(H_1) = 0.45, P(H_2) = 0.35, P(H_3) = 0.20$.',
          'Gọi $A$ là biến cố "Linh kiện lấy ra đạt chuẩn chất lượng". Ta có: $P(A|H_1) = 0.92, P(A|H_2) = 0.88, P(A|H_3) = 0.95$.',
          'Áp dụng công thức xác suất đầy đủ: $P(A) = P(H_1)P(A|H_1) + P(H_2)P(A|H_2) + P(H_3)P(A|H_3) = 0.45 \\times 0.92 + 0.35 \\times 0.88 + 0.20 \\times 0.95 = 0.414 + 0.308 + 0.190 = 0.912$.',
          'Áp dụng công thức Bayes: $P(H_1|A) = \\frac{P(H_1)P(A|H_1)}{P(A)} = \\frac{0.414}{0.912} = \\frac{69}{152} \\approx 0.4539$.',
        ],
        finalAnswer: 'a) P(A) = 0.9120; b) P(H₁|A) = 0.4539 (45.39%)',
        commonTraps: 'Bẫy nhầm lẫn giữa tỷ lệ phế phẩm và tỷ lệ đạt chuẩn (1 - 0.92 = 0.08). Đề bài cho tỷ lệ đạt chuẩn thì nhân trực tiếp, không lấy 1 trừ.',
      },
      {
        id: 'hub_2026_02a_q2',
        questionNumber: 2,
        points: 1.5,
        title: 'Câu 2: Biến Ngẫu Nhiên Liên Tục & Kỳ Vọng E(X)',
        topic: 'Biến ngẫu nhiên liên tục',
        text: 'Thời gian hoàn thành một giao dịch vay vốn online (đơn vị: phút) là biến ngẫu nhiên liên tục $X$ có hàm mật độ xác suất:\n$$f(x) = \\begin{cases} k(x^2 - x), & x \\in [1, 3] \\\\ 0, & x \\notin [1, 3] \\end{cases}$$\na) Xác định hằng số $k$.\nb) Tính thời gian hoàn thành giao dịch trung bình $E(X)$ và xác suất để một giao dịch được hoàn thành trong khoảng từ 1.5 đến 2.5 phút.',
        camScannerFormulaRef: 'Mục I.3: Tính chất hàm mật độ $\\int_{-\\infty}^{+\\infty} f(x)dx = 1$ & Kỳ vọng $E(X) = \\int_{-\\infty}^{+\\infty} x f(x)dx$',
        casioKeySequence: [
          'Bấm [MENU] [1] (COMP)',
          'Bấm [∫dx], nhập (X² - X), cận dưới 1, cận trên 3. Màn hình ra: 14/3.',
          'Suy ra: k = 1 / (14/3) = 3/14.',
          'Tính E(X): Bấm [∫dx], nhập (3/14) × X × (X² - X), cận 1 đến 3. Màn hình ra: 15/7 ≈ 2.1429 phút.',
          'Tính P(1.5 < X < 2.5): Bấm [∫dx], nhập (3/14) × (X² - X), cận 1.5 đến 2.5. Màn hình ra: 0.4732.',
        ],
        solutionSteps: [
          'Điều kiện chuẩn hóa của hàm mật độ: $\\int_{1}^{3} k(x^2 - x) dx = 1 \\iff k \\left[ \\frac{x^3}{3} - \\frac{x^2}{2} \\right]_1^3 = 1$.',
          'Ta có: $\\left( \\frac{27}{3} - \\frac{9}{2} \\right) - \\left( \\frac{1}{3} - \\frac{1}{2} \\right) = 4.5 - \\left(-\\frac{1}{6}\\right) = \\frac{9}{2} + \\frac{1}{6} = \\frac{14}{3}$. Do đó $k \\cdot \\frac{14}{3} = 1 \\implies k = \\frac{3}{14}$.',
          'Thời gian trung bình: $E(X) = \\int_1^3 x f(x) dx = \\frac{3}{14} \\int_1^3 (x^3 - x^2) dx = \\frac{3}{14} \\left[ \\frac{x^4}{4} - \\frac{x^3}{3} \\right]_1^3 = \\frac{3}{14} \\times 10 = \\frac{15}{7} \\approx 2.1429$ (phút).',
          'Xác suất giao dịch từ 1.5 đến 2.5 phút: $P(1.5 < X < 2.5) = \\int_{1.5}^{2.5} \\frac{3}{14}(x^2 - x) dx = \\frac{3}{14} \\left[ \\frac{x^3}{3} - \\frac{x^2}{2} \\right]_{1.5}^{2.5} \\approx 0.4732$.',
        ],
        finalAnswer: 'k = 3/14; E(X) = 15/7 ≈ 2.1429 phút; P(1.5 < X < 2.5) = 0.4732',
        commonTraps: 'Bấm máy quên nhân thêm x khi tính E(X). Luôn nhớ E(X) có hàm tích phân là x * f(x).',
      },
      {
        id: 'hub_2026_02a_q3',
        questionNumber: 3,
        points: 1.5,
        title: 'Câu 3: Phân Phối Chuẩn & Bài Toán Định Mức Bảo Hành',
        topic: 'Phân phối xác suất (Poisson/Chuẩn)',
        text: 'Tuổi thọ của dòng pin điện thoại thông minh là biến ngẫu nhiên $X \\sim N(24, 4)$ (đơn vị: tháng).\na) Tính tỷ lệ pin có tuổi thọ trên 26 tháng.\nb) Nhà sản xuất muốn đưa ra thời gian bảo hành $T$ sao cho tỷ lệ pin phải bảo hành (tuổi thọ dưới $T$) không vượt quá 5%. Hãy xác định thời gian bảo hành $T$ tối đa cho phép.',
        camScannerFormulaRef: 'Mục I.4: Phân phối chuẩn $X \\sim N(\\mu, \\sigma^2) \\implies P(X < x) = 0.5 + \\Phi(\\frac{x-\\mu}{\\sigma})$ & Tra bảng Laplace Phụ lục 2',
        casioKeySequence: [
          'Xác định tham số: μ = 24, σ² = 4 => σ = √4 = 2 tháng.',
          'Câu a) Bấm [MENU] [7] [2] (Normal CD): Lower = 26, Upper = 10^99, σ = 2, μ = 24. Kết quả = 0.15865 ≈ 15.87%.',
          'Câu b) Bấm [MENU] [7] [3] (Inverse Normal): Area = 0.05, σ = 2, μ = 24. Kết quả = 20.7103 tháng.',
          'Cách tra bảng CamScanner HUB: Φ(z_α) = 0.5 - 0.05 = 0.45 => z_0.05 = 1.645 => T = 24 - 1.645 × 2 = 20.71 tháng.',
        ],
        solutionSteps: [
          'Đề bài cho $X \\sim N(\\mu = 24, \\sigma^2 = 4) \\implies$ Độ lệch chuẩn $\\sigma = \\sqrt{4} = 2$.',
          'a) Tỷ lệ pin có tuổi thọ trên 26 tháng: $P(X > 26) = 0.5 - \\Phi\\left(\\frac{26 - 24}{2}\\right) = 0.5 - \\Phi(1.00)$. Tra bảng Laplace Phụ lục 2 HUB: $\\Phi(1.00) = 0.3413$. Vậy $P(X > 26) = 0.5 - 0.3413 = 0.1587$ (15.87%).',
          'b) Xác định thời gian bảo hành $T$ thỏa mãn: $P(X < T) \\le 0.05 \\iff 0.5 - \\Phi\\left(\\frac{24 - T}{2}\\right) \\le 0.05 \\iff \\Phi\\left(\\frac{24 - T}{2}\\right) \\ge 0.45$.',
          'Tra bảng Laplace ngược tại giá trị 0.45: được $z_{0.05} = 1.645$. Do đó $\\frac{24 - T}{2} = 1.645 \\implies T = 24 - 1.645 \\times 2 = 20.71$ (tháng).',
        ],
        finalAnswer: 'a) P(X > 26) = 15.87%; b) Thời gian bảo hành tối đa T = 20.71 tháng (hoặc làm tròn 20 tháng)',
        commonTraps: 'BẪY CHẾT NGƯỜI: Nhầm lẫn giữa phương sai σ² = 4 và độ lệch chuẩn σ. Rất nhiều bạn nhập σ = 4 vào máy tính Casio sẽ bị sai hoàn toàn!',
      },
      {
        id: 'hub_2026_02a_q4',
        questionNumber: 4,
        points: 4.5,
        title: 'Câu 4: Thống Kê 1 Biến Ghép Nhóm - Ước Lượng Khoảng & Kiểm Định Giả Thuyết',
        topic: 'Thống kê 1 biến & Ước lượng/Kiểm định',
        text: 'Khảo sát doanh thu hàng tháng của 100 chi nhánh bán lẻ thuộc một hệ thống ngân hàng thương mại ta có bảng số liệu ghép nhóm:\n\n| Doanh thu (triệu đồng) | [20, 30) | [30, 40) | [40, 50) | [50, 60) | [60, 70) |\n| :--- | :---: | :---: | :---: | :---: | :---: |\n| Số chi nhánh | 12 | 28 | 35 | 18 | 7 |\n\na) Sử dụng máy tính Casio xác định: cỡ mẫu $n$, trung bình mẫu $\\bar{x}$, phương sai mẫu hiệu chỉnh $s^2$, và độ lệch chuẩn mẫu hiệu chỉnh $s$.\nb) Với độ tin cậy 95%, hãy ước lượng khoảng tin cậy đối xứng cho doanh thu trung bình của toàn hệ thống.\nc) Nếu muốn sai số ước lượng doanh thu trung bình không vượt quá 1.5 triệu đồng ở độ tin cậy 95%, cần khảo sát thêm ít nhất bao nhiêu chi nhánh nữa?\nd) Các chi nhánh có doanh thu từ 50 triệu đồng trở lên được xếp vào loại "Xuất sắc". Hãy tìm khoảng tin cậy 95% cho tỷ lệ chi nhánh xuất sắc.\ne) Với mức ý nghĩa 5%, có thể khẳng định doanh thu trung bình của toàn hệ thống đã vượt quá 40 triệu đồng hay không?',
        camScannerFormulaRef: 'Mục II.1: KTC cho Trung bình $\\bar{x} \\pm z_{\\alpha/2} \\frac{s}{\\sqrt{n}}$ & Mục II.2: Cỡ mẫu tối thiểu $n \\ge \\frac{z_{\\alpha/2}^2 s^2}{\\varepsilon_0^2}$ & Mục III: Tiêu chuẩn kiểm định $Z_{qs} = \\frac{\\bar{x} - \\mu_0}{\\frac{s}{\\sqrt{n}}}$',
        casioKeySequence: [
          'Bước 1 Bật tần số: [SHIFT] [MENU] [▼] [3] [1] (Frequency ON)',
          'Bước 2 Vào chế độ thống kê 1 biến: [MENU] [6] [1] (1-Variable)',
          'Bước 3 Nhập giá trị đại diện x_i (trung điểm khoảng): 25, 35, 45, 55, 65',
          'Bước 4 Chuyển sang cột FREQ nhập tần số: 12, 28, 35, 18, 7',
          'Bước 5 Bấm [AC], sau đó bấm [OPTN] [2] (1-Variable Calc)',
          'Đọc màn hình Casio: x̄ = 42.6000, s_x = 10.7422, s_x² = 115.3939, n = 100',
        ],
        solutionSteps: [
          'a) Lấy giá trị đại diện là trung điểm các lớp: $x_1 = 25 (n_1=12), x_2 = 35 (n_2=28), x_3 = 45 (n_3=35), x_4 = 55 (n_4=18), x_5 = 65 (n_5=7)$. Bấm Casio 580 [OPTN 2]: $n = 100$, $\\bar{x} = 42.6$ (triệu đồng), $s^2 = 115.3939$, $s = 10.7422$ (triệu đồng).',
          'b) Độ tin cậy $1 - \\alpha = 0.95 \\implies \\alpha = 0.05$. Tra bảng Laplace hoặc z-alpha: $z_{0.025} = 1.96$. Do cỡ mẫu $n = 100 \\ge 30$, độ chính xác $\\varepsilon = z_{\\alpha/2} \\frac{s}{\\sqrt{n}} = 1.96 \\times \\frac{10.7422}{\\sqrt{100}} = 2.1055$ triệu. Khoảng tin cậy cho $\\mu$: $(42.6 - 2.1055, 42.6 + 2.1055) = (40.4945, 44.7055)$ triệu đồng.',
          'c) Để sai số $\\varepsilon \\le 1.5$ triệu đồng: Cỡ mẫu tối thiểu $n_{min} = \\frac{z_{\\alpha/2}^2 s^2}{\\varepsilon_0^2} = \\frac{(1.96)^2 \\times 115.3939}{(1.5)^2} = \\frac{3.8416 \\times 115.3939}{2.25} \\approx 197.02$. Làm tròn lên số nguyên tiếp theo: $n_{min} = 198$. Do đã khảo sát 100 chi nhánh, cần khảo sát THÊM ít nhất $198 - 100 = 98$ chi nhánh.',
          'd) Số chi nhánh xuất sắc (doanh thu $\\ge 50$ triệu): $m = 18 + 7 = 25$. Tỷ lệ mẫu $f = \\frac{25}{100} = 0.25$. Sai số ước lượng tỷ lệ: $\\varepsilon_p = 1.96 \\times \\sqrt{\\frac{0.25 \\times 0.75}{100}} = 1.96 \\times 0.0433 = 0.0849$. Khoảng tin cậy cho tỷ lệ $p$: $(0.25 - 0.0849, 0.25 + 0.0849) = (0.1651, 0.3349)$ hay $(16.51\\%, 33.49\\%)$.',
          'e) Đặt cặp giả thiết: $H_0: \\mu = 40$ vs $H_1: \\mu > 40$ (kiểm định phía phải). Với $\\alpha = 0.05$, $z_{0.05} = 1.645$. Miền bác bỏ $W_\\alpha = (1.645, +\\infty)$. Giá trị tiêu chuẩn kiểm định: $Z_{qs} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}} = \\frac{42.6 - 40}{10.7422 / 10} = \\frac{2.6}{1.0742} \\approx 2.4203$. Vì $Z_{qs} = 2.42 > 1.645 \\implies Z_{qs} \\in W_\\alpha$, ta bác bỏ $H_0$, chấp nhận $H_1$. Khẳng định doanh thu trung bình toàn hệ thống đã vượt 40 triệu đồng.',
        ],
        finalAnswer: 'a) x̄ = 42.6, s = 10.7422; b) KTC μ: (40.49, 44.71); c) Cần thêm 98 chi nhánh; d) KTC p: (16.51%, 33.49%); e) Z_qs = 2.42 > 1.645 => Doanh thu thực sự vượt 40 triệu.',
        commonTraps: 'BẪY CHỮ "THÊM": Câu c đề hỏi "cần khảo sát THÊM bao nhiêu", rất nhiều sinh viên trả lời 198 mà quên trừ đi 100 chi nhánh ban đầu nên bị trừ nửa số điểm!',
      },
      {
        id: 'hub_2026_02a_q5',
        questionNumber: 5,
        points: 1.0,
        title: 'Câu 5: Kiểm Định So Sánh 2 Tỷ Lệ Độc Lập',
        topic: 'So sánh 2 mẫu',
        text: 'Để so sánh mức độ hài lòng của khách hàng đối với dịch vụ Mobile Banking giữa hai chi nhánh A và B, ngân hàng khảo sát độc lập:\n- Chi nhánh A: Khảo sát 400 khách hàng, có 340 người hài lòng.\n- Chi nhánh B: Khảo sát 500 khách hàng, có 400 người hài lòng.\nVới mức ý nghĩa $\\alpha = 0.05$, có thể cho rằng tỷ lệ khách hàng hài lòng ở Chi nhánh A cao hơn Chi nhánh B hay không?',
        camScannerFormulaRef: 'Mục III.2: So sánh 2 tỷ lệ $Z_{qs} = \\frac{f_1 - f_2}{\\sqrt{\\bar{f}(1-\\bar{f})(\\frac{1}{n_1} + \\frac{1}{n_2})}}$ với $\\bar{f} = \\frac{m_1 + m_2}{n_1 + n_2}$',
        casioKeySequence: [
          'Chi nhánh A: n₁ = 400, m₁ = 340 => f₁ = 340/400 = 0.85',
          'Chi nhánh B: n₂ = 500, m₂ = 400 => f₂ = 400/500 = 0.80',
          'Tỷ lệ chung: f_bar = (340 + 400) / (400 + 500) = 740 / 900 ≈ 0.8222',
          'Bấm máy Z_qs: (0.85 - 0.80) ÷ √(0.8222 × 0.1778 × (1/400 + 1/500)) = 1.9507',
        ],
        solutionSteps: [
          'Đặt cặp giả thiết: $H_0: p_1 = p_2$ vs $H_1: p_1 > p_2$ (kiểm định 1 phía bên phải).',
          'Tỷ lệ mẫu: $f_1 = \\frac{340}{400} = 0.85$, $f_2 = \\frac{400}{500} = 0.80$.',
          'Tỷ lệ chung của 2 mẫu gộp: $\\bar{f} = \\frac{m_1 + m_2}{n_1 + n_2} = \\frac{340 + 400}{400 + 500} = \\frac{740}{900} = \\frac{37}{45} \\approx 0.8222$.',
          'Tiêu chuẩn kiểm định: $Z_{qs} = \\frac{f_1 - f_2}{\\sqrt{\\bar{f}(1-\\bar{f})\\left(\\frac{1}{n_1} + \\frac{1}{n_2}\\right)}} = \\frac{0.85 - 0.80}{\\sqrt{0.8222 \\times 0.1778 \\times \\left(\\frac{1}{400} + \\frac{1}{500}\\right)}} = \\frac{0.05}{0.02563} \\approx 1.9507$.',
          'Với $\\alpha = 0.05$ kiểm định 1 phía, giá trị tới hạn $z_{0.05} = 1.645$. Miền bác bỏ $W_\\alpha = (1.645, +\\infty)$.',
          'Vì $Z_{qs} = 1.9507 > 1.645$, nên $Z_{qs} \\in W_\\alpha$. Bác bỏ $H_0$, chấp nhận $H_1$. Kết luận: Tỷ lệ khách hàng hài lòng tại Chi nhánh A cao hơn Chi nhánh B có ý nghĩa thống kê ở mức ý nghĩa 5%.',
        ],
        finalAnswer: 'Z_qs = 1.9507 > 1.645 => Bác bỏ H0, Chi nhánh A có tỷ lệ hài lòng cao hơn B.',
        commonTraps: 'Quên tính tỷ lệ chung f_bar mà dùng f1, f2 riêng rẽ ở mẫu số là sai công thức kiểm định tỷ lệ trong CamScanner HUB.',
      },
    ],
  },
  {
    id: 'hub_2023_ca1',
    code: 'ĐỀ THI HUB 2023 - CA 1',
    year: 2023,
    semester: 'Học kỳ Cuối Khóa 2023',
    title: 'Đề Thi Kết Thúc Học Phần Xác Suất Thống Kê - Đợt Thi 31/03/2023 (Ca 1)',
    faculty: 'Bộ Môn Toán Kinh Tế - Trường Đại Học Ngân Hàng TP.HCM',
    durationMinutes: 75,
    description: 'Đề thi lưu trữ chính thức có đáp án và barem điểm chấm chi tiết từng 0.25 điểm.',
    questions: [
      {
        id: 'hub_2023_ca1_q1',
        questionNumber: 1,
        points: 2.0,
        title: 'Câu 1: Xác Suất Hộp Bi & Biến Cố Độc Lập',
        topic: 'Xác suất cơ bản & Bayes',
        text: 'Có hai hộp chứa các sản phẩm. Hộp I có 8 chính phẩm và 2 phế phẩm. Hộp II có 6 chính phẩm và 4 phế phẩm. Lấy ngẫu nhiên từ mỗi hộp ra 2 sản phẩm.\na) Tính xác suất để lấy được đúng 3 chính phẩm.\nb) Biết rằng trong 4 sản phẩm lấy ra có đúng 3 chính phẩm, tính xác suất để 2 chính phẩm thuộc về Hộp I.',
        camScannerFormulaRef: 'Mục I.1: Tổ hợp cổ điển $C_n^k$, công thức cộng và nhân biến cố độc lập',
        casioKeySequence: [
          'Hộp 1 có C(10,2) = 45 cách chọn; Hộp 2 có C(10,2) = 45 cách chọn.',
          'Số phần tử không gian mẫu: 45 × 45 = 2025.',
          'TH1: Hộp I lấy 2 chính phẩm, Hộp II lấy 1 chính 1 phế: C(8,2) × C(6,1) × C(4,1) = 28 × 24 = 672.',
          'TH2: Hộp I lấy 1 chính 1 phế, Hộp II lấy 2 chính phẩm: [C(8,1) × C(2,1)] × C(6,2) = 16 × 15 = 240.',
          'Tổng biến cố thuận lợi: 672 + 240 = 912.',
          'Xác suất câu a: 912 / 2025 ≈ 0.4504.',
          'Xác suất câu b (Bayes/Điều kiện): 672 / 912 = 7/9.5 ≈ 0.7368.',
        ],
        solutionSteps: [
          'Số cách lấy 2 sản phẩm từ Hộp I: $C_{10}^2 = 45$. Số cách lấy 2 sản phẩm từ Hộp II: $C_{10}^2 = 45$. Số phần tử không gian mẫu $|\Omega| = 45 \\times 45 = 2025$.',
          'Gọi $A$ là biến cố lấy được đúng 3 chính phẩm. Biến cố $A$ xảy ra trong 2 trường hợp xung khắc:',
          '+ TH1: Hộp I lấy 2 chính phẩm và Hộp II lấy 1 chính, 1 phế: có $C_8^2 \\times (C_6^1 \\cdot C_4^1) = 28 \\times 24 = 672$ cách.',
          '+ TH2: Hộp I lấy 1 chính, 1 phế và Hộp II lấy 2 chính phẩm: có $(C_8^1 \\cdot C_2^1) \\times C_6^2 = 16 \\times 15 = 240$ cách.',
          'Số cách thuận lợi cho $A$: $m_A = 672 + 240 = 912$. Xác suất $P(A) = \\frac{912}{2025} = \\frac{304}{675} \\approx 0.4504$.',
          'b) Xác suất có điều kiện: $P(\\text{2 chính từ Hộp I} | A) = \\frac{672}{912} = \\frac{14}{19} \\approx 0.7368$ (73.68%).',
        ],
        finalAnswer: 'a) P(A) = 304/675 ≈ 0.4504; b) P(TH1|A) = 14/19 ≈ 0.7368',
        commonTraps: 'Quên không gian mẫu là tích số cách của 2 hộp (45 x 45 = 2025) mà đem cộng lại.',
      },
      {
        id: 'hub_2023_ca1_q2',
        questionNumber: 2,
        points: 2.0,
        title: 'Câu 2: Hệ Phương Trình Tìm Tham Số Hàm Mật Độ f(x) = ax + b',
        topic: 'Biến ngẫu nhiên liên tục',
        text: 'Biến ngẫu nhiên liên tục $X$ có hàm mật độ xác suất:\n$$f(x) = \\begin{cases} ax + b, & x \\in [0, 2] \\\\ 0, & x \\notin [0, 2] \\end{cases}$$\nBiết rằng kỳ vọng $E(X) = \\frac{7}{6}$.\na) Tìm các hằng số $a$ và $b$ bằng cách thiết lập hệ phương trình.\nb) Tính xác suất $P(X > 1)$ và trung vị $Median(X)$.',
        camScannerFormulaRef: 'Mục I.3: Hệ phương trình $\\int_0^2 f(x)dx = 1$ và $\\int_0^2 x f(x)dx = E(X)$ & Bấm máy MENU 9 1 2',
        casioKeySequence: [
          'Tích phân chuẩn hóa: ∫(ax + b)dx = [a x²/2 + bx] từ 0 đến 2 = 2a + 2b = 1',
          'Tích phân kỳ vọng: ∫(ax² + bx)dx = [a x³/3 + b x²/2] từ 0 đến 2 = (8/3)a + 2b = 7/6',
          'Bấm máy Casio fx-580VN X giải hệ phương trình:',
          '[MENU] [9] [1] [2] (Simul Equation - 2 Unknowns)',
          'Dòng 1: nhập [2] [=] [2] [=] [1] [=]',
          'Dòng 2: nhập [8] [÷] [3] [=] [2] [=] [7] [÷] [6] [=]',
          'Nhấn [=]: x = a = 1/4 (0.25); y = b = 1/4 (0.25).',
        ],
        solutionSteps: [
          'Hàm mật độ $f(x) = ax + b$ trên $[0, 2]$. Ta có 2 điều kiện:',
          '(1) $\\int_0^2 (ax + b)dx = 1 \\iff \\left[ \\frac{a x^2}{2} + bx \\right]_0^2 = 2a + 2b = 1$.',
          '(2) $E(X) = \\int_0^2 x(ax + b)dx = \\frac{7}{6} \\iff \\left[ \\frac{a x^3}{3} + \\frac{b x^2}{2} \\right]_0^2 = \\frac{8}{3}a + 2b = \\frac{7}{6}$.',
          'Lấy phương trình (2) trừ phương trình (1): $\\left(\\frac{8}{3} - 2\\right)a = \\frac{7}{6} - 1 \\iff \\frac{2}{3}a = \\frac{1}{6} \\implies a = \\frac{1}{4}$.',
          'Thay $a = 1/4$ vào (1): $2(1/4) + 2b = 1 \\implies 2b = 1/2 \\implies b = \\frac{1}{4}$. Vậy $f(x) = \\frac{1}{4}x + \\frac{1}{4}$ trên $[0, 2]$.',
          'Tính xác suất $P(X > 1) = \\int_1^2 \\left(\\frac{1}{4}x + \\frac{1}{4}\\right)dx = \\left[ \\frac{x^2}{8} + \\frac{x}{4} \\right]_1^2 = \\left( \\frac{4}{8} + \\frac{2}{4} \\right) - \\left( \\frac{1}{8} + \\frac{1}{4} \\right) = 1 - \\frac{3}{8} = \\frac{5}{8} = 0.625$.',
          'Tìm Median: $F(M) = \\int_0^M \\left(\\frac{1}{4}x + \\frac{1}{4}\\right)dx = 0.5 \\iff \\frac{M^2}{8} + \\frac{M}{4} = 0.5 \\iff M^2 + 2M - 4 = 0$. Bấm MENU 9 2 2: $M = -1 + \\sqrt{5} \\approx 1.2361$ (loại nghiệm âm).',
        ],
        finalAnswer: 'a = 1/4, b = 1/4; P(X > 1) = 5/8 = 0.625; Median = -1 + √5 ≈ 1.2361',
        commonTraps: 'Tính Median quên đặt phương trình F(M) = 0.5 mà đi tìm f(M) = 0.5 là sai định nghĩa.',
      },
      {
        id: 'hub_2023_ca1_q3',
        questionNumber: 3,
        points: 5.0,
        title: 'Câu 3: Bảng Tần Số Mẫu Lớn - Ước Lượng Khoảng & Kiểm Định Giả Thuyết HUB',
        topic: 'Thống kê 1 biến & Ước lượng/Kiểm định',
        text: 'Điều tra thời gian tự học mỗi tuần (đơn vị: giờ) của 120 sinh viên Khoa Ngân hàng tại HUB thu được bảng số liệu:\n\n| Thời gian (giờ) | [4, 8) | [8, 12) | [12, 16) | [16, 20) | [20, 24) |\n| :--- | :---: | :---: | :---: | :---: | :---: |\n| Số sinh viên | 15 | 32 | 43 | 20 | 10 |\n\na) Sử dụng máy tính Casio xác định: cỡ mẫu $n$, trung bình mẫu $\\bar{x}$, phương sai mẫu hiệu chỉnh $s^2$, và độ lệch chuẩn mẫu hiệu chỉnh $s$.\nb) Với độ tin cậy 95%, hãy ước lượng khoảng tin cậy cho thời gian tự học trung bình của toàn bộ sinh viên Khoa Ngân hàng.\nc) Muốn độ chính xác của ước lượng thời gian tự học trung bình đạt 0.5 giờ với độ tin cậy 99%, cần khảo sát thêm ít nhất bao nhiêu sinh viên?\nd) Sinh viên tự học từ 16 giờ trở lên mỗi tuần được xem là "Chuyên cần". Tìm khoảng tin cậy 95% cho tỷ lệ sinh viên chuyên cần.\ne) Trước đây thời gian tự học trung bình là 12.5 giờ/tuần. Với mức ý nghĩa 5%, có thể cho rằng hiện nay sinh viên tự học nhiều hơn trước hay không?',
        camScannerFormulaRef: 'Mục II & Mục III Tờ CamScanner HUB: Bảng số Phụ lục 2 Laplace $z_{0.025} = 1.96, z_{0.005} = 2.58, z_{0.05} = 1.645$',
        casioKeySequence: [
          'Bật tần số: [SHIFT] [MENU] [▼] [3] [1]',
          'Vào 1-Var: [MENU] [6] [1]',
          'Nhập x_i (trung điểm): 6, 10, 14, 18, 22',
          'Nhập FREQ: 15, 32, 43, 20, 10',
          'Bấm [AC] -> [OPTN] [2]',
          'Đọc kết quả: n = 120, x̄ = 13.2667, s_x = 4.2934, s_x² = 18.4333',
        ],
        solutionSteps: [
          'a) Lập bảng đại diện $x_i \\in \\{6, 10, 14, 18, 22\\}$. Bấm Casio Menu 6 1: $n = 120$, $\\bar{x} = 13.2667$ (giờ), $s^2 = 18.4333$, $s = 4.2934$ (giờ).',
          'b) Độ tin cậy 95% $\\implies z_{0.025} = 1.96$. Do $n = 120 \\ge 30$: $\\varepsilon = 1.96 \\times \\frac{4.2934}{\\sqrt{120}} = 0.7681$. Khoảng tin cậy cho $\\mu$: $(13.2667 - 0.7681, 13.2667 + 0.7681) = (12.4986, 14.0348)$ giờ.',
          'c) Độ tin cậy 99% $\\implies z_{0.005} = 2.58$. Cỡ mẫu tối thiểu: $n_{min} = \\frac{(2.58)^2 \\times 18.4333}{(0.5)^2} = \\frac{6.6564 \\times 18.4333}{0.25} \\approx 490.81$. Làm tròn lên: $n_{min} = 491$. Cần khảo sát THÊM: $491 - 120 = 371$ sinh viên.',
          'd) Số sinh viên chuyên cần: $m = 20 + 10 = 30$. Tỷ lệ mẫu: $f = \\frac{30}{120} = 0.25$. Sai số: $\\varepsilon_p = 1.96 \\times \\sqrt{\\frac{0.25 \\times 0.75}{120}} = 0.0775$. Khoảng tin cậy cho $p$: $(0.25 - 0.0775, 0.25 + 0.0775) = (0.1725, 0.3275)$ hay $(17.25\\%, 32.75\\%)$.',
          'e) Giả thiết $H_0: \\mu = 12.5$ vs $H_1: \\mu > 12.5$. Mức ý nghĩa $\\alpha = 0.05 \\implies z_{0.05} = 1.645$. Miền bác bỏ $W_\\alpha = (1.645, +\\infty)$.',
          'Tiêu chuẩn: $Z_{qs} = \\frac{13.2667 - 12.5}{4.2934 / \\sqrt{120}} = \\frac{0.7667}{0.3919} \\approx 1.9563$. Vì $Z_{qs} = 1.9563 > 1.645$, bác bỏ $H_0$. Sinh viên hiện nay tự học nhiều hơn trước.',
        ],
        finalAnswer: 'a) x̄ = 13.2667, s = 4.2934; b) KTC μ: (12.50, 14.03); c) Cần thêm 371 SV; d) KTC p: (17.25%, 32.75%); e) Z_qs = 1.956 > 1.645 => Bác bỏ H0.',
        commonTraps: 'Bẫy độ tin cậy 99% ở câu c: nhớ tra z = 2.58 chứ không được lấy 1.96 của câu b!',
      },
    ],
  },
];
