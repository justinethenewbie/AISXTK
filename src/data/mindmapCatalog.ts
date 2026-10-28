import { MindmapData } from '../components/MindmapViewer';

/**
 * Kho Dữ Liệu Sơ Đồ Tư Duy Chuẩn Hóa Đại Học Ngân Hàng HUB - 7 Bài Toàn Diện
 * Phân cấp đa tầng: Root -> Nhánh Lớn Cấp 1 -> Tiểu mục Cấp 2 -> Hộp Định Nghĩa Khái Niệm & Công Thức Cấp 3
 * Được xây dựng theo đúng cấu trúc trực quan từ Giáo trình và đồ họa của Giảng viên.
 */

export const CHAPTER_1_MINDMAP: MindmapData = {
  id: 'bai-1-xac-suat',
  title: 'BÀI 1: XÁC SUẤT VÀ CÔNG THỨC TÍNH XÁC SUẤT',
  summary: 'Hệ thống hóa toàn diện các khái niệm cơ bản về phép thử, biến cố, định nghĩa xác suất cổ điển & thống kê, cùng các công thức tính xác suất cốt lõi (Cộng, Nhân điều kiện, Bernoulli, Xác suất toàn phần & Bayes).',
  category: 'Giáo Trình Xác Suất Thống Kê HUB - Bài 1',
  casioShortcut: 'Bấm Shift ÷ (nCr) tính tổ hợp C(n, k); Shift × (nPr) tính chỉnh hợp A(n, k); MENU 7 -> 4 tính Bernoulli PD.',
  goldenRules: [
    'Xác suất của mọi biến cố luôn nằm trong đoạn [0, 1]: $0 \\le P(A) \\le 1$.',
    'Biến cố chắc chắn có $P(\\Omega) = 1$, biến cố không thể có $P(\\emptyset) = 0$.',
    'Nếu A và B xung khắc (không cùng xảy ra) thì $P(A + B) = P(A) + P(B)$.',
    'Nhóm biến cố $\\{H_1, H_2, ..., H_n\\}$ là đầy đủ khi chúng xung khắc từng đôi và tổng xác suất bằng 1.'
  ],
  branches: [
    {
      id: 'b1',
      title: '1. Khái niệm cơ bản về xác suất',
      badge: 'Khái niệm & Định nghĩa',
      color: '#2563eb', // Blue
      children: [
        {
          id: 'b1-1',
          title: '1.1. Xác suất là gì?',
          detail: 'Xác suất là tỷ lệ dự đoán về một hiện tượng nào đó mà chưa biết trước kết quả xảy ra như thế nào (đo lường bằng một số thực nằm trong khoảng từ 0 đến 1 biểu thị mức độ chắc chắn xảy ra của biến cố).',
        },
        {
          id: 'b1-2',
          title: '1.2. Các khái niệm liên quan đến xác suất',
          subItems: [
            {
              label: '• Phép thử (Trial / Experiment)',
              content: '+ là một hành động mà kết quả của nó không thể biết chắc trước là kết quả nào sẽ xảy ra.',
            },
            {
              label: '• Biến cố (Event)',
              content: 'là một sự kiện có thể xảy ra hoặc không xảy ra trong kết quả của một phép thử.',
              subList: [
                '+ Biến cố chắc chắn (\\Omega): là biến cố nhất định phải xảy ra trong mỗi lần thực hiện phép thử ($P(\\Omega) = 1$).',
                '+ Biến cố không thể (\\emptyset): là biến cố nhất định không xảy ra trong bất kỳ lần thực hiện phép thử nào ($P(\\emptyset) = 0$).',
                '+ Biến cố ngẫu nhiên: là biến cố có thể xảy ra hoặc không xảy ra tùy thuộc vào kết quả của phép thử ($0 \\le P \\le 1$).'
              ]
            }
          ]
        },
        {
          id: 'b1-3',
          title: '1.3. Định nghĩa và công thức xác suất',
          subItems: [
            {
              label: '• Định nghĩa xác suất cổ điển:',
              content: 'Áp dụng cho phép thử có không gian mẫu hữu hạn gồm $n$ biến cố đồng khả năng, trong đó có $m$ kết quả thuận lợi cho biến cố A:',
              formula: 'P(A) = \\frac{m}{n} = \\frac{|A|}{|\\Omega|}',
            },
            {
              label: '• Định nghĩa xác suất theo thống kê:',
              content: 'Khi số lần lặp lại phép thử $n$ rất lớn ($n \\to \\infty$), tần suất xuất hiện $f_n(A) = \\frac{k}{n}$ sẽ dao động ổn định quanh một hằng số xác định:',
              formula: 'P(A) \\approx f_n(A) = \\frac{k}{n}',
            }
          ]
        }
      ]
    },
    {
      id: 'b2',
      title: '2. Các công thức tính xác suất cơ bản',
      badge: 'Công thức trọng tâm',
      color: '#ea580c', // Orange
      children: [
        {
          id: 'b2-1',
          title: '2.1. Công thức cộng xác suất',
          formula: 'P(A + B) = P(A) + P(B) - P(AB)',
          detail: 'Áp dụng tính xác suất có ít nhất một trong hai biến cố A hoặc B xảy ra.',
          examTip: 'Đặc biệt: Nếu A và B xung khắc (không cùng xảy ra, AB = ∅) thì P(AB) = 0 => P(A + B) = P(A) + P(B).'
        },
        {
          id: 'b2-2',
          title: '2.2. Công thức xác suất có điều kiện',
          formula: 'P(A \\cdot B) = \\frac{k}{n}, \\quad P(A/B) = \\frac{k}{m}, \\quad P(B) = \\frac{m}{n} \\implies P(A/B) = \\frac{P(AB)}{P(B)}',
          detail: 'Xác suất biến cố A xảy ra trong điều kiện biến cố B đã xảy ra (với $P(B) > 0$).',
          examTip: 'Công thức nhân tổng quát: P(AB) = P(B).P(A/B) = P(A).P(B/A). Nếu A, B độc lập thì P(A/B) = P(A) => P(AB) = P(A).P(B).'
        },
        {
          id: 'b2-3',
          title: '2.3. Công thức Bernoulli',
          formula: 'P_n(x) = C_n^x p^x q^{n-x}',
          detail: 'Dùng cho dãy $n$ phép thử độc lập đồng dạng, mỗi phép thử chỉ có 2 kết quả (thành công với xác suất $p$, thất bại với xác suất $q = 1 - p$).',
          examTip: 'Bấm Casio fx-580VN X: MENU 7 -> 4: Binomial PD để tính nhanh kết quả trong 3 giây.'
        },
        {
          id: 'b2-4',
          title: '2.4. Công thức xác suất đầy đủ và công thức Bayes',
          detail: 'Cho nhóm biến cố đầy đủ $\\{H_1, H_2, \\dots, H_n\\}$ (xung khắc từng đôi và $\\sum P(H_i) = 1$). Khi đó:',
          formula: 'P(H_i / A) = \\frac{P(H_i \\cdot A)}{P(A)} = \\frac{P(H_i) \\cdot P(A / H_i)}{P(A)} \\quad (i = 1, 2, \\dots, n)',
          subItems: [
            {
              label: 'Công thức xác suất toàn phần (Mẫu số):',
              formula: 'P(A) = P(H_1)P(A/H_1) + P(H_2)P(A/H_2) + \\dots + P(H_n)P(A/H_n)',
            }
          ],
          examTip: 'Tử số của công thức Bayes luôn là một trong các số hạng nằm ở mẫu số! Bấm máy tính nên lưu mẫu số vào STO M trước.'
        }
      ]
    },
    {
      id: 'b3',
      title: '3. Ghi chú ký hiệu',
      badge: 'Bảng ký hiệu',
      color: '#16a34a', // Green
      children: [
        {
          id: 'b3-1',
          title: 'Ký hiệu & Ý nghĩa toán học',
          subItems: [
            {
              label: '$\\Omega$',
              content: 'Biến cố chắc chắn (Không gian mẫu chứa toàn bộ các kết quả có thể có)',
            },
            {
              label: '$\\emptyset$',
              content: 'Biến cố không thể (Tập hợp rỗng, không bao giờ xảy ra, $P(\\emptyset) = 0$)',
            },
            {
              label: '$P(B)$',
              content: 'Xác suất của biến cố B ($0 \\le P(B) \\le 1$)',
            },
            {
              label: '$A + B$ (hoặc $A \\cup B$)',
              content: 'Biến cố tổng: Xảy ra khi có ít nhất một trong hai biến cố A hoặc B xảy ra',
            },
            {
              label: '$AB$ (hoặc $A \\cap B$)',
              content: 'Biến cố tích: Xảy ra khi và chỉ khi cả hai biến cố A và B đồng thời xảy ra',
            },
            {
              label: '$\\bar{A}$',
              content: 'Biến cố đối lập của A: Xảy ra khi A không xảy ra ($P(\\bar{A}) = 1 - P(A)$)',
            }
          ]
        }
      ]
    },
    {
      id: 'b4',
      title: '4. Mẹo Casio fx-580VN X & Phòng thi',
      badge: 'Kỹ năng thực chiến',
      color: '#9333ea', // Purple
      children: [
        {
          id: 'b4-1',
          title: 'Phím bấm Casio fx-580VN X trọng tâm',
          detail: '• Tính tổ hợp $C_n^k$: Bấm n SHIFT ÷ k (nCr)\n• Tính chỉnh hợp $A_n^k$: Bấm n SHIFT × k (nPr)\n• Bấm xác suất Bernoulli: MENU 7 -> 4 (Binomial PD), chọn 2 (Variable) -> nhập x, n, p -> bấm =.',
          formula: 'C_n^k = \\frac{n!}{k!(n-k)!}, \\quad A_n^k = \\frac{n!}{(n-k)!}',
          examTip: 'Chọn mẫu không phân biệt thứ tự (lấy cùng lúc k sản phẩm) luôn dùng C(n, k).'
        },
        {
          id: 'b4-2',
          title: 'Phân biệt bẫy đề thi hay gặp',
          detail: 'Phân biệt "Biến cố xung khắc" ($AB = \\emptyset \\implies P(AB) = 0$) với "Biến cố độc lập" ($P(AB) = P(A)P(B)$). Hai khái niệm này hoàn toàn khác nhau.',
          examTip: 'Từ khóa "lấy KHÔNG HOÀN LẠI" là xác suất có điều kiện; "lấy CÓ HOÀN LẠI" là chuỗi phép thử độc lập Bernoulli!'
        }
      ]
    }
  ]
};

export const CHAPTER_2_MINDMAP: MindmapData = {
  id: 'bai-2-bien-ngau-nhien-roi-rac',
  title: 'BÀI 2: BIẾN NGẪU NHIÊN RỜI RẠC & CÁC QUY LUẬT PHÂN PHỐI',
  summary: 'Khái niệm biến ngẫu nhiên, bảng phân phối xác suất, các số đặc trưng (Kỳ vọng, Phương sai, Độ lệch chuẩn, Mode, Median) và các quy luật phân phối rời rạc kinh điển (Nhị thức, Poisson, Siêu bội).',
  category: 'Giáo Trình Xác Suất Thống Kê HUB - Bài 2',
  casioShortcut: 'MENU 6 1 nhập bảng X và Tần số P; OPTN 2 để đọc x̄ (E(X)), σx (Độ lệch chuẩn), σ²x (Phương sai).',
  goldenRules: [
    'Tổng xác suất trong bảng phân phối rời rạc luôn bằng 1: $\\sum p_i = 1$.',
    'Phương sai luôn không âm: $\\text{Var}(X) = E(X^2) - [E(X)]^2 \\ge 0$.',
    'Phân phối Poisson dùng cho biến cố hiếm gặp khi $n$ lớn, $p$ nhỏ ($np < 10$).'
  ],
  branches: [
    {
      id: 'b1',
      title: '1. Khái niệm biến ngẫu nhiên & Số đặc trưng',
      badge: 'Định nghĩa cơ bản',
      color: '#2563eb',
      children: [
        {
          id: 'b1-1',
          title: '1.1. Biến ngẫu nhiên rời rạc là gì?',
          detail: 'Là đại lượng nhận các giá trị số thực rời rạc, đếm được (hữu hạn hoặc vô hạn đếm được) tùy thuộc vào kết quả của phép thử ngẫu nhiên.',
          formula: 'X \\in \\{x_1, x_2, \\dots, x_n\\}, \\quad \\sum_{i=1}^n P(X = x_i) = 1'
        },
        {
          id: 'b1-2',
          title: '1.2. Kỳ vọng toán học E(X) (Giá trị trung bình)',
          detail: 'Đại diện cho giá trị trung bình theo xác suất của biến ngẫu nhiên trong dài hạn.',
          formula: 'E(X) = \\sum_{i=1}^n x_i p_i'
        },
        {
          id: 'b1-3',
          title: '1.3. Phương sai Var(X) & Độ lệch chuẩn σ',
          detail: 'Đo lường mức độ biến động, phân tán hoặc rủi ro của biến ngẫu nhiên quanh kỳ vọng trung bình.',
          formula: '\\text{Var}(X) = E(X^2) - [E(X)]^2 = \\sum x_i^2 p_i - [E(X)]^2, \\quad \\sigma(X) = \\sqrt{\\text{Var}(X)}'
        }
      ]
    },
    {
      id: 'b2',
      title: '2. Các phân phối xác suất rời rạc',
      badge: 'Quy luật cốt lõi',
      color: '#ea580c',
      children: [
        {
          id: 'b2-1',
          title: '2.1. Phân phối Nhị thức B(n, p)',
          detail: 'Số lần thành công trong $n$ phép thử Bernoulli độc lập.',
          formula: 'P(X = k) = C_n^k p^k (1-p)^{n-k}, \\quad E(X) = np, \\quad \\text{Var}(X) = np(1-p)',
          examTip: 'Casio fx-580VN X: MENU 7 -> 4 (Binomial PD) để tra xác suất tại điểm, MENU 7 -> 1 (Binomial CD) để tính xác suất tích lũy P(X <= k).'
        },
        {
          id: 'b2-2',
          title: '2.2. Phân phối Poisson P(λ)',
          detail: 'Số biến cố xảy ra trong một khoảng thời gian hoặc không gian nhất định với cường độ trung bình $\\lambda = np$.',
          formula: 'P(X = k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}, \\quad E(X) = \\lambda, \\quad \\text{Var}(X) = \\lambda',
          examTip: 'Đặc trưng độc nhất của phân phối Poisson: Kỳ vọng bằng đúng phương sai $E(X) = \\text{Var}(X) = \\lambda$.'
        },
        {
          id: 'b2-3',
          title: '2.3. Phân phối Siêu bội H(N, M, n)',
          detail: 'Lấy ngẫu nhiên không hoàn lại $n$ phần tử từ lô $N$ phần tử có $M$ chính phẩm.',
          formula: 'P(X = k) = \\frac{C_M^k C_{N-M}^{n-k}}{C_N^n}'
        }
      ]
    },
    {
      id: 'b3',
      title: '3. Ghi chú ký hiệu & Bảng tóm tắt',
      badge: 'Ký hiệu & Ý nghĩa',
      color: '#16a34a',
      children: [
        {
          id: 'b3-1',
          title: 'Ký hiệu tham số phân phối',
          subItems: [
            { label: '$X \\sim B(n, p)$', content: 'Biến ngẫu nhiên X tuân theo phân phối Nhị thức với cỡ mẫu n và xác suất p' },
            { label: '$X \\sim P(\\lambda)$', content: 'Biến ngẫu nhiên X tuân theo phân phối Poisson với tham số cường độ λ' },
            { label: '$E(X)$', content: 'Kỳ vọng toán học (Expected value / Mean)' },
            { label: '$\\text{Var}(X)$', content: 'Phương sai (Variance)' },
            { label: '$\\sigma(X)$', content: 'Độ lệch chuẩn (Standard deviation)' },
            { label: '$\\text{Mod}(X)$', content: 'Giá trị mốt có xác suất xuất hiện lớn nhất' }
          ]
        }
      ]
    }
  ]
};

export const CHAPTER_3_MINDMAP: MindmapData = {
  id: 'bai-3-phan-phoi-chuan-gauss',
  title: 'BÀI 3: BIẾN LIÊN TỤC & PHÂN PHỐI CHUẨN GAUSS',
  summary: 'Hàm mật độ xác suất f(x), hàm phân phối tích lũy F(x), phân phối chuẩn N(μ, σ²), quy tắc chuẩn hóa Z-score, hàm Laplace Φ(z) và mẹo bấm máy Casio fx-580VN X Menu 7 Normal CD.',
  category: 'Giáo Trình Xác Suất Thống Kê HUB - Bài 3',
  casioShortcut: 'MENU 7 -> 2: Normal CD. Nhập Lower, Upper, σ, μ. Quy ước cận +∞ nhập 10^9, cận -∞ nhập -10^9.',
  goldenRules: [
    'Xác suất tại 1 điểm của biến ngẫu nhiên liên tục luôn bằng 0: $P(X = c) = 0$.',
    'Diện tích dưới đường cong hàm mật độ luôn bằng 1: $\\int_{-\\infty}^{+\\infty} f(x)dx = 1$.',
    'Chuẩn hóa sang biến chuẩn tắc: $Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1)$.'
  ],
  branches: [
    {
      id: 'b1',
      title: '1. Khái niệm biến liên tục & Hàm mật độ',
      badge: 'Định nghĩa toán',
      color: '#2563eb',
      children: [
        {
          id: 'b1-1',
          title: '1.1. Hàm mật độ xác suất f(x)',
          detail: 'Hàm số $f(x) \\ge 0$ biểu thị mật độ phân bố xác suất của biến ngẫu nhiên liên tục trên trục số thực.',
          formula: 'P(a \\le X \\le b) = \\int_a^b f(x) dx, \\quad \\int_{-\\infty}^{+\\infty} f(x) dx = 1'
        },
        {
          id: 'b1-2',
          title: '1.2. Kỳ vọng & Phương sai tích phân',
          detail: 'Tính thông qua tích phân suy rộng trên toàn bộ miền xác định.',
          formula: 'E(X) = \\int_{-\\infty}^{+\\infty} x f(x) dx, \\quad \\text{Var}(X) = \\int_{-\\infty}^{+\\infty} x^2 f(x) dx - [E(X)]^2'
        }
      ]
    },
    {
      id: 'b2',
      title: '2. Phân phối Chuẩn Gauss N(μ, σ²)',
      badge: 'Quy luật trung tâm',
      color: '#ea580c',
      children: [
        {
          id: 'b2-1',
          title: '2.1. Đường cong hình chuông đối xứng',
          detail: 'Hàm mật độ có dạng chuông đối xứng qua đường thẳng $x = \\mu$. Điểm uốn tại $x = \\mu \\pm \\sigma$.',
          formula: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}'
        },
        {
          id: 'b2-2',
          title: '2.2. Công thức tính xác suất bằng hàm Laplace',
          detail: 'Dùng hàm tích phân Laplace $\\Phi(z)$ sau khi đã chuẩn hóa Z-score.',
          formula: 'P(a < X < b) = \\Phi\\left(\\frac{b - \\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a - \\mu}{\\sigma}\\right)',
          examTip: 'Chú ý tính chất hàm lẻ: $\\Phi(-z) = -\\Phi(z)$ (với hàm Laplace gốc 0) hoặc $1 - \\Phi(z)$ (với hàm phân phối tích lũy chuẩn tắc).'
        },
        {
          id: 'b2-3',
          title: '2.3. Quy tắc 3-Sigma (Thực nghiệm)',
          detail: '• $P(\\mu - \\sigma < X < \\mu + \\sigma) \\approx 68.26\\%$\n• $P(\\mu - 2\\sigma < X < \\mu + 2\\sigma) \\approx 95.44\\%$\n• $P(\\mu - 3\\sigma < X < \\mu + 3\\sigma) \\approx 99.74\\%$'
        }
      ]
    },
    {
      id: 'b3',
      title: '3. Ghi chú ký hiệu & Casio fx-580VN X',
      badge: 'Bảng tra & Phím bấm',
      color: '#16a34a',
      children: [
        {
          id: 'b3-1',
          title: 'Ký hiệu & Thao tác bấm máy',
          subItems: [
            { label: '$\\mu$', content: 'Kỳ vọng toán học (Tâm đối xứng của phân phối chuẩn)' },
            { label: '$\\sigma^2$', content: 'Phương sai (Độ phân tán của dữ liệu)' },
            { label: '$\\sigma$', content: 'Độ lệch chuẩn (Căn bậc hai của phương sai, luôn lấy căn trước khi nhập Casio)' },
            { label: 'Normal CD', content: 'MENU 7 -> 2. Nhập Lower, Upper, σ, μ rồi ấn =' },
            { label: 'Inverse Normal', content: 'MENU 7 -> 3. Tìm phân vị x khi biết diện tích xác suất tích lũy' }
          ]
        }
      ]
    }
  ]
};

export const CHAPTER_5_MINDMAP: MindmapData = {
  id: 'bai-5-uoc-luong-khoang',
  title: 'BÀI 5: ƯỚC LƯỢNG KHOẢNG TIN CẬY THỐNG KÊ',
  summary: 'Khoảng tin cậy cho kỳ vọng μ (trường hợp biết σ và chưa biết σ, cỡ mẫu lớn và nhỏ), khoảng tin cậy cho tỷ lệ p, công thức tính kích thước mẫu tối thiểu n và sai số ước lượng ε.',
  category: 'Giáo Trình Xác Suất Thống Kê HUB - Bài 5',
  casioShortcut: 'MENU 6 1 nhập dữ liệu mẫu -> OPTN 2 đọc x̄ và s (dòng sx) -> tính sai số ε và khoảng tin cậy.',
  goldenRules: [
    'Độ tin cậy $1 - \\alpha$: thường dùng $95\\% (z_{\\alpha/2} = 1.96)$ hoặc $99\\% (z_{\\alpha/2} = 2.58)$.',
    'Nếu chưa biết $\\sigma$ và mẫu nhỏ $n < 30$: Bắt buộc tra phân phối Student $t_{\\alpha/2}^{(n-1)}$.',
    'Nếu mẫu lớn $n \\ge 30$: Áp dụng Định lý giới hạn trung tâm dùng phân phối Chuẩn $z_{\\alpha/2}$.'
  ],
  branches: [
    {
      id: 'b1',
      title: '1. Khái niệm ước lượng & Độ tin cậy',
      badge: 'Lý thuyết thống kê',
      color: '#2563eb',
      children: [
        {
          id: 'b1-1',
          title: '1.1. Ước lượng điểm vs Ước lượng khoảng',
          detail: 'Ước lượng khoảng cung cấp một khoảng ngẫu nhiên $(\\theta_1, \\theta_2)$ chứa tham số thực $\\theta$ với xác suất tin cậy $1 - \\alpha$.',
          formula: 'P(\\theta_1 < \\theta < \\theta_2) = 1 - \\alpha'
        },
        {
          id: 'b1-2',
          title: '1.2. Sai số ước lượng ε & Bán kính khoảng',
          detail: 'Khoảng tin cậy đối xứng luôn có dạng: $[\\text{Thống kê mẫu} - \\varepsilon, \\; \\text{Thống kê mẫu} + \\varepsilon]$ với độ dài khoảng bằng $2\\varepsilon$.',
          formula: '\\varepsilon = Z_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}}'
        }
      ]
    },
    {
      id: 'b2',
      title: '2. Các công thức khoảng tin cậy',
      badge: 'Công thức ước lượng',
      color: '#ea580c',
      children: [
        {
          id: 'b2-1',
          title: '2.1. Ước lượng kỳ vọng μ (Đã biết σ)',
          detail: 'Áp dụng thống kê chuẩn tắc Z.',
          formula: '\\mu \\in \\left[ \\bar{x} - z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}, \\; \\bar{x} + z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\right]'
        },
        {
          id: 'b2-2',
          title: '2.2. Ước lượng kỳ vọng μ (Chưa biết σ)',
          detail: '• Nếu $n \\ge 30$: Thay $\\sigma$ bằng độ lệch chuẩn mẫu hiệu chỉnh $s$ và dùng $z_{\\alpha/2}$.\n• Nếu $n < 30$: Dùng phân phối Student $t_{\\alpha/2}^{(n-1)}$.',
          formula: '\\varepsilon = t_{\\alpha/2}^{(n-1)} \\cdot \\frac{s}{\\sqrt{n}}',
          examTip: 'Bẫy phòng thi: Luôn lấy dòng sx trên máy tính Casio làm độ lệch chuẩn mẫu hiệu chỉnh s, không lấy dòng σx.'
        },
        {
          id: 'b2-3',
          title: '2.3. Ước lượng tỷ lệ p',
          detail: 'Dùng tỷ lệ mẫu $f = \\frac{m}{n}$ với điều kiện $np \\ge 5, n(1-p) \\ge 5$.',
          formula: 'p \\in \\left[ f - z_{\\alpha/2} \\sqrt{\\frac{f(1-f)}{n}}, \\; f + z_{\\alpha/2} \\sqrt{\\frac{f(1-f)}{n}} \\right]'
        },
        {
          id: 'b2-4',
          title: '2.4. Xác định kích thước mẫu tối thiểu n',
          detail: 'Cỡ mẫu cần thiết để sai số không vượt quá $\\varepsilon_0$.',
          formula: 'n \\ge \\left( \\frac{z_{\\alpha/2} \\cdot s}{\\varepsilon_0} \\right)^2, \\quad n \\ge \\frac{z_{\\alpha/2}^2 \\cdot f(1-f)}{\\varepsilon_0^2}'
        }
      ]
    },
    {
      id: 'b3',
      title: '3. Bảng giá trị tới hạn thường dùng',
      badge: 'Tra bảng nhanh',
      color: '#16a34a',
      children: [
        {
          id: 'b3-1',
          title: 'Hệ số độ tin cậy chuẩn tắc',
          subItems: [
            { label: 'Độ tin cậy 90% (α = 0.10)', content: '$z_{\\alpha/2} = z_{0.05} = 1.645$' },
            { label: 'Độ tin cậy 95% (α = 0.05)', content: '$z_{\\alpha/2} = z_{0.025} = 1.96$' },
            { label: 'Độ tin cậy 98% (α = 0.02)', content: '$z_{\\alpha/2} = z_{0.01} = 2.33$' },
            { label: 'Độ tin cậy 99% (α = 0.01)', content: '$z_{\\alpha/2} = z_{0.005} = 2.58$' }
          ]
        }
      ]
    }
  ]
};

export const ALL_PRESET_CHAPTER_MINDMAPS: Record<number, MindmapData> = {
  1: CHAPTER_1_MINDMAP,
  2: CHAPTER_2_MINDMAP,
  3: CHAPTER_3_MINDMAP,
  5: CHAPTER_5_MINDMAP,
};
