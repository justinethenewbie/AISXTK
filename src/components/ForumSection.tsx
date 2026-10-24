import React, { useState, useRef } from 'react';
import { ForumPost } from '../types/xstk';
import {
  MessageSquare,
  ThumbsUp,
  Send,
  ShieldCheck,
  AlertTriangle,
  Paperclip,
  Plus,
  User,
  Mic,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Check,
  Download,
  Sigma,
} from 'lucide-react';
import { MathText, MathFormula } from './MathFormula';
import { normalizeSpokenMath } from '../utils/mathSpeechParser';
import confetti from 'canvas-confetti';

interface ForumSectionProps {
  onAddExp: (amount: number, details?: string) => void;
}

const QUICK_MATH_SYMBOLS = [
  { label: 'x̄ (Trung bình mẫu)', latex: '$\\bar{x}$' },
  { label: 's² (Phương sai mẫu)', latex: '$s^2$' },
  { label: 'μ (Kỳ vọng)', latex: '$\\mu$' },
  { label: 'σ (Độ lệch chuẩn)', latex: '$\\sigma$' },
  { label: 'P(A|B)', latex: '$P(A|B)$' },
  { label: 'χ² (Chi bình phương)', latex: '$\\chi^2$' },
  { label: 'Zqs', latex: '$Z_{qs}$' },
  { label: 'tqs', latex: '$t_{qs}$' },
  { label: 'p̂ (Tỷ lệ mẫu)', latex: '$\\hat{p}$' },
  { label: 'a/b', latex: '$\\frac{a}{b}$' },
  { label: '√x', latex: '$\\sqrt{x}$' },
  { label: '∫ Tích phân', latex: '$\\int_{a}^{b} f(x) dx$' },
  { label: '∑ Tổng', latex: '$\\sum_{i=1}^{n}$' },
  { label: '1 - α', latex: '$1 - \\alpha$' },
  { label: 'ε', latex: '$\\varepsilon$' },
];

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post_1',
    authorName: 'Trần Minh Hoàng',
    authorClass: '2026-DHKT01',
    authorAvatar: '👨‍🎓',
    timestamp: '10 phút trước',
    title: 'Hỏi về cách phân biệt bài toán dùng Z-test hay Student T-test?',
    content:
      'Các bạn cho mình hỏi: Khi làm bài kiểm định trung bình mẫu, trong trường hợp mẫu $n < 30$ nhưng đề bài ĐÃ CHO BIẾT phương sai tổng thể $\\sigma^2$ thì mình dùng Z-test hay T-test vậy ạ?',
    likes: 12,
    commentsCount: 2,
    comments: [
      {
        id: 'c1',
        author: 'Linh Cú AI Classroom',
        authorAvatar: '🦉',
        text: 'Chào Hoàng! Nếu đã biết phương sai tổng thể $\\sigma^2$ thì theo lý thuyết Bài 5 dù $n < 30$ vẫn dùng phân phối Chuẩn tắc $Z$-test chuẩn nhé!',
        time: '8 phút trước',
      },
      {
        id: 'c2',
        author: 'Lê Thu Thảo',
        authorAvatar: '👩‍🎓',
        text: 'Đúng rồi bạn ơi, chỉ khi CHƯA BIẾT phương sai tổng thể $\\sigma^2$ và $n < 30$ mới chuyển sang dùng phân phối Student $t$-test với bậc tự do $(n-1)$!',
        time: '5 phút trước',
      },
    ],
  },
  {
    id: 'post_2',
    authorName: 'Nguyễn Bích Ngọc',
    authorClass: '2026-NHDH02',
    authorAvatar: '👩‍🎓',
    timestamp: '1 giờ trước',
    title: 'Chia sẻ Bộ Đề Thi Thử Cuối Kỳ Xác Suất Thống Kê 2026 kèm Đáp Án Chi Tiết',
    content:
      'Mình vừa tổng hợp bộ 10 đề thi thử XSTK có lời giải chi tiết theo chuẩn Barem của trường. Mọi người tải về luyện cùng mình nhé!',
    attachmentType: 'pdf',
    attachmentName: 'De_Thi_Thu_XSTK_2026_Full_Dap_An.pdf',
    likes: 38,
    commentsCount: 0,
    comments: [],
  },
];

export const ForumSection: React.FC<ForumSectionProps> = ({ onAddExp }) => {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isModerating, setIsModerating] = useState(false);
  const [modWarning, setModWarning] = useState<string | null>(null);

  // New Post Attachment & Speech state
  const [postAttachment, setPostAttachment] = useState<{
    name: string;
    type: 'image' | 'pdf' | 'doc';
    size: number;
    dataUrl: string;
  } | null>(null);
  const [isRecordingPost, setIsRecordingPost] = useState(false);
  const [showPostMathToolbar, setShowPostMathToolbar] = useState(false);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  // Comments State (Active Post & Comment Input Bar)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentAttachment, setCommentAttachment] = useState<{
    name: string;
    type: 'image' | 'pdf' | 'doc';
    size: number;
    dataUrl: string;
  } | null>(null);
  const [isRecordingComment, setIsRecordingComment] = useState(false);
  const [showCommentMathToolbar, setShowCommentMathToolbar] = useState(false);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox modal for zooming into full image
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>, isComment = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const isImg = file.type.startsWith('image/');
      const attachment = {
        name: file.name,
        type: isImg ? ('image' as const) : ('pdf' as const),
        size: file.size,
        dataUrl,
      };

      if (isComment) {
        setCommentAttachment(attachment);
      } else {
        setPostAttachment(attachment);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startVoiceInput = (isComment = false) => {
    if (isComment) setIsRecordingComment(true);
    else setIsRecordingPost(true);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const normalized = normalizeSpokenMath(transcript);
        if (isComment) {
          setCommentText((prev) => (prev ? prev + ' ' + normalized : normalized));
          setIsRecordingComment(false);
        } else {
          setNewContent((prev) => (prev ? prev + ' ' + normalized : normalized));
          setIsRecordingPost(false);
        }
      };

      recognition.onerror = () => {
        if (isComment) setIsRecordingComment(false);
        else setIsRecordingPost(false);
      };
      recognition.onend = () => {
        if (isComment) setIsRecordingComment(false);
        else setIsRecordingPost(false);
      };

      recognition.start();
    } else {
      setTimeout(() => {
        if (isComment) {
          setIsRecordingComment(false);
          setCommentText((prev) => (prev ? prev + ' ' : '') + 'Theo công thức Bayes thì $P(A|B) = \\frac{P(A)P(B|A)}{P(B)}$');
        } else {
          setIsRecordingPost(false);
          setNewContent((prev) => (prev ? prev + ' ' : '') + 'Cho mình hỏi về công thức tính phương sai mẫu hiệu chỉnh $s^2$');
        }
      }, 1500);
    }
  };

  const insertMathToPost = (latex: string) => {
    setNewContent((prev) => (prev ? prev + ' ' + latex : latex));
  };

  const insertMathToComment = (latex: string) => {
    setCommentText((prev) => (prev ? prev + ' ' + latex : latex));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || (!newContent.trim() && !postAttachment)) return;

    setIsModerating(true);
    setModWarning(null);

    try {
      const response = await fetch('/api/tutor/forum-moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postContent: `${newTitle} ${newContent}` }),
      });

      const data = await response.json();
      const mod = data.data;

      if (mod && !mod.isApproved) {
        setModWarning(`⚠️ AI Giám sát nhắc nhở: ${mod.moderatorNote || 'Nội dung chứa từ ngữ không phù hợp!'}`);
        return;
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b'],
      });

      const newPost: ForumPost = {
        id: `post_${Date.now()}`,
        authorName: 'Bạn (Sinh viên AI Classroom)',
        authorClass: '2026-DHKT01',
        authorAvatar: '🦉',
        timestamp: 'Vừa xong',
        title: newTitle.trim(),
        content: newContent.trim(),
        attachmentType: postAttachment?.type,
        attachmentUrl: postAttachment?.dataUrl,
        attachmentName: postAttachment?.name,
        likes: 0,
        commentsCount: 0,
        comments: [],
        isModerated: true,
      };

      setPosts([newPost, ...posts]);
      setNewTitle('');
      setNewContent('');
      setPostAttachment(null);
      setShowPostMathToolbar(false);
      onAddExp(25, `Đăng bài thảo luận mới trên Diễn đàn: "${newPost.title.slice(0, 30)}..."`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsModerating(false);
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim() && !commentAttachment) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [
              ...p.comments,
              {
                id: `c_${Date.now()}`,
                author: 'Bạn (Sinh viên AI Classroom)',
                authorAvatar: '👨‍🎓',
                text: commentText.trim(),
                time: 'Vừa xong',
                attachmentUrl: commentAttachment?.dataUrl,
                attachmentName: commentAttachment?.name,
              },
            ],
          };
        }
        return p;
      })
    );

    setCommentText('');
    setCommentAttachment(null);
    setShowCommentMathToolbar(false);
    onAddExp(15, 'Đóng góp câu trả lời học thuật trên Diễn đàn');
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <span>DIỄN ĐÀN ĐIỆN TỬ HỌC XÁC SUẤT THỐNG KÊ (XSTK FORUM)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Kênh Trao Đổi Tri Thức XSTK Đa Phương Thức Có Giám Sát AI
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Đăng bài thảo luận toán học với thanh công cụ gõ công thức KaTeX, tải lên hình ảnh đề thi/bài tập, nhập liệu bằng giọng nói tiếng Việt và chia sẻ tài liệu cùng sinh viên toàn quốc!
        </p>
      </div>

      {/* Hidden File Input for New Post */}
      <input
        ref={postFileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFilePick(e, false)}
      />

      {/* Hidden File Input for Comments */}
      <input
        ref={commentFileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFilePick(e, true)}
      />

      {/* New Post Form with Advanced Chat Toolbar */}
      <form onSubmit={handleCreatePost} className="bg-slate-900/90 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs sm:text-sm text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>✍️ ĐĂNG BÀI VIẾT / ĐỀ THI / THẮC MẮC MỚI (+25 XP)</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowPostMathToolbar(!showPostMathToolbar)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              showPostMathToolbar
                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Sigma className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chèn Ký Hiệu KaTeX</span>
          </button>
        </div>

        {modWarning && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{modWarning}</span>
          </div>
        )}

        <input
          type="text"
          required
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Tiêu đề thảo luận ngắn gọn (VD: Thắc mắc bài toán Bayes câu 3 đề thi 2026)..."
          className="w-full p-3.5 rounded-xl border-2 border-cyan-500/30 bg-slate-950 text-white placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-bold shadow-inner"
        />

        {/* Quick Math Symbols Ribbon for Post */}
        {showPostMathToolbar && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
              <span>Bấm nhanh để chèn công thức KaTeX vào nội dung bài viết:</span>
              <span className="text-[10px] text-slate-400">Tự động căn chỉnh chuẩn KaTeX</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_MATH_SYMBOLS.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => insertMathToPost(s.latex)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-xs font-mono font-bold transition-all shadow-xs"
                >
                  <MathFormula math={s.latex} />
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          required
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Nội dung chi tiết thắc mắc, bài tập hoặc chia sẻ tài liệu (hỗ trợ nhập công thức $...$, nói qua micro hoặc tải lên ảnh)..."
          className="w-full p-4 rounded-xl border-2 border-cyan-500/30 bg-slate-950 text-white placeholder-slate-400 text-xs sm:text-sm h-28 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none font-medium shadow-inner"
        />

        {/* Post Attachment Preview */}
        {postAttachment && (
          <div className="p-3 bg-cyan-950/80 border-2 border-cyan-400/50 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {postAttachment.type === 'image' ? (
                <img
                  src={postAttachment.dataUrl}
                  alt={postAttachment.name}
                  className="w-14 h-14 rounded-xl object-cover border border-cyan-400 shrink-0 cursor-pointer"
                  onClick={() => setPreviewImageUrl(postAttachment.dataUrl)}
                />
              ) : (
                <div className="w-12 h-12 bg-slate-900 rounded-xl border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="font-bold text-white text-xs truncate max-w-xs">{postAttachment.name}</p>
                <p className="text-[10px] text-cyan-300 font-mono">
                  {postAttachment.type.toUpperCase()} • {Math.round(postAttachment.size / 1024)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPostAttachment(null)}
              className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => postFileInputRef.current?.click()}
              title="Đính kèm Hình ảnh đề bài, ảnh chụp hoặc tệp PDF/Word"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Paperclip className="w-4 h-4 text-cyan-400" />
              <span>Đính Kèm Ảnh / Tệp</span>
            </button>

            <button
              type="button"
              onClick={() => startVoiceInput(false)}
              title="Nhập liệu bằng giọng nói (Speech-to-Text chuẩn XSTK)"
              className={`p-2.5 rounded-xl text-white transition-colors flex items-center gap-1.5 text-xs font-bold ${
                isRecordingPost
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400'
              }`}
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>{isRecordingPost ? 'Đang lắng nghe...' : 'Nói Qua Mic'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 font-medium ml-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AI Giám sát tự động</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isModerating}
            className="py-2.5 px-6 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>{isModerating ? 'AI đang kiểm duyệt...' : 'ĐĂNG BÀI LÊN DIỄN ĐÀN'}</span>
          </button>
        </div>
      </form>

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-md hover:border-cyan-500/50 transition-all"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1 bg-slate-950 rounded-xl border border-cyan-500/30">
                  {post.authorAvatar}
                </span>
                <div>
                  <h4 className="font-black text-white">{post.authorName}</h4>
                  <p className="text-[11px] text-slate-300 font-medium">{post.authorClass} • {post.timestamp}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/40">
                ✓ Đã kiểm duyệt AI
              </span>
            </div>

            {/* Title & Content rendered with KaTeX */}
            <div className="space-y-1.5">
              <h3 className="font-black text-cyan-300 text-sm sm:text-base">
                <MathText text={post.title} inline />
              </h3>
              <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                <MathText text={post.content} />
              </div>
            </div>

            {/* Attachment Preview (Image or PDF) */}
            {post.attachmentUrl && (post.attachmentType === 'image' || post.attachmentUrl.startsWith('data:image')) && (
              <div className="rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-slate-950 max-w-md relative group">
                <img
                  src={post.attachmentUrl}
                  alt={post.attachmentName || 'Hình ảnh thảo luận'}
                  className="w-full max-h-72 object-contain rounded-2xl cursor-pointer group-hover:opacity-95 transition-opacity"
                  onClick={() => setPreviewImageUrl(post.attachmentUrl!)}
                />
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(post.attachmentUrl!)}
                  className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black/90 text-cyan-300 text-[11px] font-bold rounded-lg backdrop-blur flex items-center gap-1 border border-cyan-500/30"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Phóng to ảnh</span>
                </button>
              </div>
            )}

            {/* Document Attachment if present */}
            {post.attachmentName && post.attachmentType !== 'image' && !post.attachmentUrl?.startsWith('data:image') && (
              <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  <span>{post.attachmentName}</span>
                </div>
                <button
                  onClick={() => alert(`Tải xuống ${post.attachmentName} thành công!`)}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 rounded-lg text-[10px] font-black shadow flex items-center gap-1"
                >
                  <Download className="w-3 h-3 text-slate-950" />
                  <span>Tải Về</span>
                </button>
              </div>
            )}

            {/* Actions: Likes & Comments */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => handleLikePost(post.id)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4 text-cyan-400" />
                <span>Hữu ích ({post.likes})</span>
              </button>

              <button
                onClick={() => {
                  setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                  setCommentText('');
                  setCommentAttachment(null);
                  setShowCommentMathToolbar(false);
                }}
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Bình luận & Trả lời ({post.commentsCount || post.comments.length})</span>
              </button>
            </div>

            {/* Comments List & High-End Chatbox */}
            {activeCommentPostId === post.id && (
              <div className="pt-3 border-t border-slate-800 space-y-3.5">
                {/* Existing Comments */}
                <div className="space-y-2.5">
                  {post.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!</p>
                  ) : (
                    post.comments.map((c) => (
                      <div key={c.id} className="p-3.5 bg-slate-950 rounded-2xl text-xs space-y-1.5 border border-slate-800">
                        <div className="flex items-center justify-between font-bold text-cyan-300 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span>{c.authorAvatar || '👨‍🎓'}</span>
                            <span className="text-white font-bold">{c.author}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">{c.time}</span>
                        </div>

                        <div className="text-slate-100 font-medium">
                          <MathText text={c.text} />
                        </div>

                        {/* Comment Image Attachment if present */}
                        {c.attachmentUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-cyan-500/30 max-w-xs">
                            <img
                              src={c.attachmentUrl}
                              alt={c.attachmentName || 'Ảnh bình luận'}
                              className="max-h-48 w-auto object-contain cursor-pointer hover:opacity-90"
                              onClick={() => setPreviewImageUrl(c.attachmentUrl!)}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* HIGH-END COMMENT CHAT TOOLBAR */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border-2 border-cyan-500/40 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Thanh chat trao đổi toán học & giải đáp</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCommentMathToolbar(!showCommentMathToolbar)}
                      className="text-[10px] text-cyan-300 hover:text-white font-bold bg-slate-900 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1"
                    >
                      <Sigma className="w-3 h-3" />
                      <span>{showCommentMathToolbar ? 'Ẩn ký hiệu' : 'Chèn KaTeX'}</span>
                    </button>
                  </div>

                  {/* Comment Math Ribbon */}
                  {showCommentMathToolbar && (
                    <div className="p-2 bg-slate-900 rounded-xl border border-cyan-500/30 flex flex-wrap gap-1">
                      {QUICK_MATH_SYMBOLS.slice(0, 10).map((s, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => insertMathToComment(s.latex)}
                          className="px-2 py-0.5 bg-slate-950 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-500/30 rounded text-[11px] font-mono font-bold"
                        >
                          <MathFormula math={s.latex} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Comment Attachment Preview if selected */}
                  {commentAttachment && (
                    <div className="flex items-center gap-2 p-2 px-3 bg-cyan-950/90 border border-cyan-400/50 rounded-xl text-xs text-cyan-200">
                      {commentAttachment.type === 'image' ? (
                        <img
                          src={commentAttachment.dataUrl}
                          alt={commentAttachment.name}
                          className="w-8 h-8 rounded-lg object-cover border border-cyan-400 shrink-0"
                        />
                      ) : (
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[200px] font-bold text-white text-[11px]">{commentAttachment.name}</span>
                      <button
                        type="button"
                        onClick={() => setCommentAttachment(null)}
                        className="ml-auto text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800"
                        title="Gỡ bỏ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Input & Action buttons */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      placeholder="Gõ bình luận trao đổi, công thức KaTeX $...$ hoặc nói qua mic..."
                      className="flex-1 p-2.5 rounded-xl border-2 border-cyan-500/30 bg-slate-900 text-white placeholder-slate-400 text-xs outline-none focus:border-cyan-400 font-medium"
                    />

                    {/* Attachment button for comment */}
                    <button
                      type="button"
                      onClick={() => commentFileInputRef.current?.click()}
                      title="Gửi kèm hình ảnh giải bài hoặc tệp"
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 rounded-xl transition-colors shrink-0"
                    >
                      <Paperclip className="w-4 h-4 text-cyan-400" />
                    </button>

                    {/* Mic button for comment */}
                    <button
                      type="button"
                      onClick={() => startVoiceInput(true)}
                      title="Nói bằng giọng nói Speech-to-Text"
                      className={`p-2.5 rounded-xl text-white transition-colors shrink-0 ${
                        isRecordingComment
                          ? 'bg-rose-500 animate-ping'
                          : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400'
                      }`}
                    >
                      <Mic className="w-4 h-4 text-cyan-400" />
                    </button>

                    {/* Send comment */}
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentText.trim() && !commentAttachment}
                      className="py-2 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-950" />
                      <span>Gửi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal: View Full Image */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-10 right-0 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Ảnh phóng to"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border-2 border-cyan-400 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};