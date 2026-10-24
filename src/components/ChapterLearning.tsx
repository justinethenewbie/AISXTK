import React, { useState, useRef } from 'react';
import { Chapter } from '../types/xstk';
import { InteractiveCanvas } from './InteractiveCanvas';
import { MathFormula, MathText } from './MathFormula';
import { aiFetch } from '../utils/apiHelper';
import { normalizeSpokenMath } from '../utils/mathSpeechParser';
import confetti from 'canvas-confetti';
import {
  Check,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileText,
  Send,
  Award,
  Plus,
  Zap,
  GraduationCap,
  MessageSquare,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  Paperclip,
  X,
  File as FileIcon,
} from 'lucide-react';

interface ChapterLearningProps {
  chapters: Chapter[];
  currentChapterId: number;
  onSelectChapter: (id: number) => void;
  onAddExp: (expAmount: number, activityDetail?: string, exercisesCount?: number, gpaValue?: number) => void;
  onRecordMistake: (mistake: any) => void;
}

export const ChapterLearning: React.FC<ChapterLearningProps> = ({
  chapters,
  currentChapterId,
  onSelectChapter,
  onAddExp,
  onRecordMistake,
}) => {
  const chapter = chapters.find((c) => c.id === currentChapterId) || chapters[0];

  const [activeTab, setActiveTab] = useState<'lecture' | 'formulas' | 'practice' | 'homework'>('lecture');
  const [teacherStep, setTeacherStep] = useState<number>(1);

  // Live Teacher Dialogue State for each step
  const [stepDialogues, setStepDialogues] = useState<
    Record<
      number,
      Array<{
        role: 'teacher' | 'student';
        text: string;
        extraExample?: { title: string; content: string };
        gaps?: string[];
        comprehensionCheck?: string;
        fileName?: string;
        fileDataUrl?: string;
      }>
    >
  >({});

  const [studentMsgInput, setStudentMsgInput] = useState('');
  const [isAskingTeacher, setIsAskingTeacher] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Attached File State for Multimodal Chat
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    size: number;
    base64?: string;
    dataUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Practice & Canvas Evaluation state
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Exercises state
  const [customHomeworkList, setCustomHomeworkList] = useState<any[]>([]);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const currentExample = chapter.practiceExamples[selectedExampleIndex] || chapter.practiceExamples[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: result,
        dataUrl: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Live Dialogue Handler with Teacher AI
  const handleSendTeacherMessage = async (requestMoreExample = false, requestDeepLecture = false) => {
    const msg = studentMsgInput.trim();
    if (!msg && !requestMoreExample && !requestDeepLecture && !attachedFile) return;

    setIsAskingTeacher(true);
    const currentStepDialogue = stepDialogues[teacherStep] || [];

    let studentDisplayText = msg || `Em gửi thầy xem tệp/ảnh: ${attachedFile?.name}`;
    if (requestMoreExample) {
      studentDisplayText = 'Thầy ơi, cho em xin thêm một ví dụ minh họa thực tế ngân hàng/tài chính với ạ!';
    } else if (requestDeepLecture) {
      studentDisplayText = `Thầy hãy giảng giải toàn diện và sâu sắc 4 phần về Bước ${teacherStep}: "${getStepTitle(teacherStep)}" giúp em với ạ!`;
    }

    const newHistory = [
      ...currentStepDialogue,
      {
        role: 'student' as const,
        text: studentDisplayText,
        fileName: attachedFile?.name,
        fileDataUrl: attachedFile?.dataUrl,
      },
    ];

    setStepDialogues((prev) => ({
      ...prev,
      [teacherStep]: newHistory,
    }));

    const filePayload = attachedFile
      ? {
          imageBase64: attachedFile.base64,
          fileMetadata: { name: attachedFile.name, type: attachedFile.type },
        }
      : {};

    setStudentMsgInput('');
    setAttachedFile(null);

    try {
      const response = await aiFetch('/api/tutor/teacher-dialogue', {
        method: 'POST',
        body: JSON.stringify({
          chapterTitle: chapter.title,
          stepNumber: teacherStep,
          stepTitle: getStepTitle(teacherStep),
          stepContent: chapter.feynmanSteps[teacherStep - 1]?.content || '',
          coreDefinition: chapter.feynmanConcept?.coreDefinition || '',
          realWorldAnalogy: chapter.feynmanConcept?.realWorldAnalogy || '',
          keyFormulas: chapter.keyFormulas?.map(f => `${f.name}: ${f.formula} - ${f.description}`) || [],
          practiceExamples: chapter.practiceExamples?.map(e => `${e.title}: ${e.problem} -> Lời giải: ${e.sampleSolution}`) || [],
          previousStepSummary: teacherStep > 1 ? `Bước ${teacherStep - 1}: ${getStepTitle(teacherStep - 1)} - ${chapter.feynmanSteps[teacherStep - 2]?.content || ''}` : 'Bước mở đầu của chương',
          history: newHistory,
          studentMessage: requestDeepLecture ? `Thầy hãy giảng giải toàn diện và sâu sắc 4 phần về Bước ${teacherStep}: "${getStepTitle(teacherStep)}" giúp em với ạ!` : msg,
          requestMoreExample,
          requestDeepLecture,
          ...filePayload,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        const reply = data.data;

        setStepDialogues((prev) => ({
          ...prev,
          [teacherStep]: [
            ...(prev[teacherStep] || []),
            {
              role: 'teacher' as const,
              text: reply.teacherReply || 'Thầy đã ghi nhận thắc mắc của em!',
              extraExample: reply.extraExample,
              gaps: reply.knowledgeGapsIdentified,
              comprehensionCheck: reply.comprehensionCheck,
            },
          ],
        }));

        onAddExp(15, `Trao đổi & hỏi bài Thầy AI (Bước ${teacherStep})`);

        if (reply.knowledgeGapsIdentified && reply.knowledgeGapsIdentified.length > 0) {
          onRecordMistake({
            id: `gap_step_${teacherStep}_${Date.now()}`,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sourceType: 'viva',
            questionSummary: `Thảo luận tại Bước ${teacherStep}: ${getStepTitle(teacherStep)}`,
            studentAnswer: msg,
            correctConcept: 'Lý thuyết chuẩn giáo viên',
            rootCauseError: reply.knowledgeGapsIdentified[0],
            remediationAdvice: 'Đọc lại nội dung bước bài giảng và trao đổi thêm với Giảng viên AI',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingTeacher(false);
    }
  };

  const handleUnderstandStep = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });

    if (teacherStep < 5) {
      onAddExp(
        25,
        `Nắm vững bản chất Bước ${teacherStep}: ${getStepTitle(teacherStep)} (${chapter.title})`,
        1
      );
      setTeacherStep((prev) => Math.min(5, prev + 1));
    } else {
      onAddExp(
        50,
        `Hoàn thành xuất sắc cả 5 bước học Chương ${chapter.id}: ${chapter.title}`,
        1
      );
      setActiveTab('homework');
    }
  };

  const startVoiceInput = () => {
    setIsVoiceRecording(true);
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const normalized = normalizeSpokenMath(transcript);
        setStudentMsgInput((prev) => (prev ? prev + ' ' + normalized : normalized));
        setIsVoiceRecording(false);
      };

      recognition.onerror = () => setIsVoiceRecording(false);
      recognition.onend = () => setIsVoiceRecording(false);

      recognition.start();
    } else {
      setTimeout(() => {
        setIsVoiceRecording(false);
        setStudentMsgInput((prev) => (prev ? prev + ' ' : '') + 'Em chưa hiểu rõ công thức tính xác suất có điều kiện');
      }, 1500);
    }
  };

  const handleEvaluateCanvasSubmission = async (canvasDataUrl: string, typedText: string) => {
    setIsSubmitting(true);
    setEvaluationResult(null);

    try {
      const response = await aiFetch('/api/tutor/evaluate-handwriting', {
        method: 'POST',
        body: JSON.stringify({
          problemTitle: currentExample?.title || 'Bài tập thực hành',
          problemStatement: currentExample?.problem || '',
          standardSolution: currentExample?.sampleSolution || '',
          baremRubric: currentExample?.baremRubric || 'Thang điểm 10',
          studentNotes: typedText,
          handwritingImageBase64: canvasDataUrl,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setEvaluationResult(data.data);
        const totalScore = typeof data.data.totalScore === 'number' ? data.data.totalScore : 7;
        const gpaEquivalent = (totalScore / 10) * 4.0;
        onAddExp(
          totalScore * 10,
          `Luyện tập viết tay & Chấm bài: ${totalScore}/10 điểm (${chapter.title})`,
          1,
          gpaEquivalent
        );

        if (data.data.totalScore < 8) {
          onRecordMistake({
            id: `practice_${chapter.id}_${Date.now()}`,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sourceType: 'homework',
            questionSummary: currentExample?.problem || 'Bài tập thực hành',
            studentAnswer: typedText,
            correctConcept: currentExample?.sampleSolution || 'Áp dụng công thức chuẩn',
            rootCauseError: data.data.rootCauseError || 'Lỗi lập luận công thức',
            remediationAdvice: data.data.betterStrategy || 'Luyện tập thêm dạng bài tương tự',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCustomHomework = async () => {
    setIsGeneratingCustom(true);
    try {
      const response = await aiFetch('/api/tutor/generate-similar', {
        method: 'POST',
        body: JSON.stringify({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          type: 'essay',
          count: 3,
        }),
      });
      const data = await response.json();
      if (data.success && data.exercises) {
        setCustomHomeworkList((prev) => [...prev, ...data.exercises]);
        onAddExp(30);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  function getStepTitle(num: number): string {
    switch (num) {
      case 1:
        return 'Đặt Vấn Đề Thực Tế';
      case 2:
        return 'Bản Chất Khái Niệm';
      case 3:
        return 'Xây Dựng Công Thức KaTeX';
      case 4:
        return 'Ví Dụ Mẫu Của Giáo Viên';
      case 5:
        return 'Thử Sức Tại Lớp & Chấm Bảng iPad';
      default:
        return 'Tiết Học Thực Tế';
    }
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Chapter Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => {
              onSelectChapter(ch.id);
              setEvaluationResult(null);
              setTeacherStep(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              ch.id === chapter.id
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-200 border border-slate-700 hover:text-white hover:border-cyan-400 hover:bg-slate-800'
            }`}
          >
            {ch.isCompleted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{ch.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Chapter Header Banner - High Contrast Neon Cyan & Emerald */}
      <div className="relative overflow-hidden border-2 border-cyan-500/40 text-white rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] group">
        {/* Subtle HUB Campus Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-25 pointer-events-none"
          style={{ backgroundImage: `url('/assets/hub-campus.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-cyan-950/70 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Chương {chapter.id} / 7 • Tiết Học Trực Tiếp Với Giảng Viên AI</span>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-bold text-slate-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 backdrop-blur-xs">
              🏛️ ĐH Ngân Hàng TP.HCM (HUB)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            {chapter.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed font-medium">
            {chapter.subtitle}
          </p>
        </div>
      </div>

      {/* Navigation Tabs - High Contrast Cyan */}
      <div className="flex border-b border-slate-800 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('lecture')}
          className={`pb-3 transition-colors ${
            activeTab === 'lecture'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          1. Bài Giảng Giảng Viên (5 Bước Tương Tác)
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`pb-3 transition-colors ${
            activeTab === 'formulas'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          2. Tra Cứu Công Thức KaTeX & Casio
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`pb-3 transition-colors ${
            activeTab === 'practice'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          3. Kho Bài Tập Thực Hành Tại Lớp
        </button>
        <button
          onClick={() => setActiveTab('homework')}
          className={`pb-3 transition-colors ${
            activeTab === 'homework'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          4. 10 Bài Tập Về Nhà Tự Luyện
        </button>
      </div>

      {/* TAB 1: Real Interactive Teacher Lecture Sequence */}
      {activeTab === 'lecture' && (
        <div className="space-y-6">
          {/* Stepper Header Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-cyan-500/30 p-3 rounded-2xl text-xs font-bold">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => setTeacherStep(stepNum)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  teacherStep === stepNum
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-black">
                  {stepNum}
                </span>
                <span className="hidden sm:inline">
                  {stepNum === 1 && '1. Đặt Vấn Đề'}
                  {stepNum === 2 && '2. Bản Chất'}
                  {stepNum === 3 && '3. Công Thức'}
                  {stepNum === 4 && '4. Ví Dụ Mẫu'}
                  {stepNum === 5 && '5. Thử Sức Lớp'}
                </span>
              </button>
            ))}
          </div>

          {/* Current Step Lecture Content */}
          <div className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-6 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            {/* Step 1: Real-World Problem Hook */}
            {teacherStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>Bước 1: Giảng Viên Đặt Vấn Đề Mở Đầu</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 text-xs text-slate-100 space-y-2">
                  <p className="font-black text-cyan-300 text-sm">
                    👨‍🏫 Giảng Viên Trực Tiếp Giảng Lớp:
                  </p>
                  <p className="leading-relaxed text-sm font-medium">
                    "{chapter.feynmanSteps[0]?.content || 'Thầy chào các em! Trước khi đi vào công thức toán học khô khan, hãy bắt đầu bằng một bài toán thực tế trong hoạt động ngân hàng và tài chính...'}"
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Intuitive Concept Explanation */}
            {teacherStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                  <Lightbulb className="w-5 h-5 text-cyan-400" />
                  <span>Bước 2: Giảng Giải Bản Chất Khái Niệm</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 text-xs space-y-2">
                  <span className="font-black text-cyan-300 uppercase tracking-wider text-[11px] block">
                    Định nghĩa cốt lõi:
                  </span>
                  <p className="text-white font-semibold leading-relaxed text-sm">
                    "{chapter.feynmanConcept.coreDefinition}"
                  </p>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed font-medium">
                  <MathText
                    text={
                      chapter.feynmanSteps[1]?.content ||
                      'Thầy diễn giải: Đừng học vẹt công thức! Hãy luôn nhớ rằng khái niệm này chuyển hóa hiện tượng ngẫu nhiên thành con số cụ thể.'
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3: Math Formulas with KaTeX */}
            {teacherStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>Bước 3: Xây Dựng Công Thức Toán & Ký Hiệu KaTeX</span>
                </div>

                <div className="space-y-3">
                  {chapter.keyFormulas.map((f, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{f.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold">Công thức #{idx + 1}</span>
                      </div>

                      <MathFormula math={f.formula} block />

                      <div className="text-xs text-slate-300">
                        <MathText text={f.description} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Teacher Worked Examples */}
            {teacherStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span>Bước 4: Các Ví Dụ Minh Họa Chi Tiết Của Giáo Viên</span>
                </div>

                <div className="space-y-4">
                  {chapter.practiceExamples.map((ex, idx) => (
                    <div key={ex.id} className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2 text-xs">
                      <h4 className="font-black text-white text-xs">
                        Ví dụ mẫu #{idx + 1}: {ex.title}
                      </h4>
                      <div className="text-slate-200 font-medium">
                        <MathText text={ex.problem} />
                      </div>

                      <div className="pt-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
                        <p className="font-bold text-cyan-300 mb-1">📝 Lời giải từng bước của Thầy:</p>
                        <div className="font-sans leading-relaxed text-slate-100 text-xs">
                          <MathText text={ex.sampleSolution} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: In-Class Practice & iPad Canvas AI Grading */}
            {teacherStep === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Bước 5: Thử Sức Bài Tập Tại Lớp & Chấm Bảng iPad AI</span>
                </div>

                {/* Example Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {chapter.practiceExamples.map((ex, idx) => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setSelectedExampleIndex(idx);
                        setEvaluationResult(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                        selectedExampleIndex === idx
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'bg-slate-950 text-slate-300 border border-slate-700'
                      }`}
                    >
                      Bài tập thực hành #{idx + 1}
                    </button>
                  ))}
                </div>

                {/* Prominent Question Display */}
                <div className="p-4 bg-slate-950 rounded-2xl border-2 border-cyan-400/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-black text-cyan-300">
                    <span>📌 Đề bài bài tập thực hành #{selectedExampleIndex + 1}:</span>
                    <span className="font-mono text-[10px] bg-cyan-950 text-cyan-200 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
                      Thang điểm 10
                    </span>
                  </div>
                  <div className="text-white font-medium text-xs leading-relaxed">
                    <MathText text={currentExample?.problem || ''} />
                  </div>
                </div>

                <InteractiveCanvas
                  onExportCanvas={handleEvaluateCanvasSubmission}
                  isSubmitting={isSubmitting}
                />

                {evaluationResult && (
                  <div className="p-5 bg-slate-950 rounded-2xl border-2 border-emerald-400/60 text-xs space-y-3">
                    <div className="flex items-center justify-between font-black text-emerald-300 text-sm">
                      <span>Kết Quả Chấm Điểm AI Tutor:</span>
                      <span className="font-mono text-base">{evaluationResult.totalScore} / 10 điểm</span>
                    </div>
                    <p className="text-slate-100 font-semibold leading-relaxed">{evaluationResult.detailedFeedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* LIVE TEACHER DIALOGUE SECTION AT EVERY STEP */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-black text-white text-xs">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Trò Chuyện & Hỏi Đáp Trực Tiếp Với Giảng Viên AI Tại Bước {teacherStep}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleSendTeacherMessage(false, true)}
                    disabled={isAskingTeacher}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>🎓 Thầy Giảng Chuyên Sâu (Bản Chất 4 Phần)</span>
                  </button>
                  <button
                    onClick={() => handleSendTeacherMessage(true, false)}
                    disabled={isAskingTeacher}
                    className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>🌟 Thêm Ví Dụ Thực Tế</span>
                  </button>
                </div>
              </div>

              {/* Dialogue Conversation History */}
              {stepDialogues[teacherStep] && stepDialogues[teacherStep].length > 0 && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-60 overflow-y-auto">
                  {stepDialogues[teacherStep].map((item, i) => (
                    <div key={i} className={`p-3.5 rounded-2xl text-xs space-y-2 ${
                      item.role === 'student'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold ml-8 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 border-2 border-cyan-500/50 text-white mr-8 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                    }`}>
                      <div className="font-black text-[11px] opacity-90 flex items-center gap-1.5 border-b border-white/20 pb-1">
                        {item.role === 'student' ? '💬 Bạn (Sinh viên):' : '👨‍🏫 Thầy Cú AI Giảng Giải:'}
                      </div>
                      <div className={`leading-relaxed text-xs sm:text-sm font-medium ${
                        item.role === 'student' ? 'text-slate-950 font-bold' : 'text-slate-100'
                      }`}>
                        <MathText text={item.text} />
                      </div>

                      {item.fileName && (
                        <div className="mt-1.5">
                          {item.fileDataUrl && item.fileDataUrl.startsWith('data:image/') ? (
                            <div className="rounded-xl overflow-hidden border border-cyan-400/50 max-w-xs mt-1">
                              <img src={item.fileDataUrl} alt={item.fileName} className="max-h-40 w-auto object-contain rounded-lg" />
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950/80 border border-cyan-400/40 rounded-lg text-[11px] text-cyan-300 font-mono">
                              <FileText className="w-3.5 h-3.5" />
                              {item.fileName}
                            </span>
                          )}
                        </div>
                      )}

                      {item.extraExample && (
                        <div className="p-3 bg-slate-950 text-white rounded-xl border border-cyan-400/50 mt-2 space-y-1">
                          <p className="font-black text-cyan-300">🌟 {item.extraExample.title}</p>
                          <div className="text-slate-200">
                            <MathText text={item.extraExample.content} />
                          </div>
                        </div>
                      )}

                      {item.comprehensionCheck && (
                        <div className="p-3 bg-cyan-950/90 border-2 border-cyan-400/70 rounded-xl mt-2 text-cyan-200 space-y-1 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                          <p className="font-black text-xs text-cyan-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>❓ Thầy Kiểm Tra Độ Hiểu Của Em:</span>
                          </p>
                          <div className="text-white text-xs font-medium leading-relaxed">
                            <MathText text={item.comprehensionCheck} />
                          </div>
                          <p className="text-[10px] text-cyan-400/90 italic">
                            (Em có thể gõ câu trả lời hoặc hỏi thêm bất kỳ thắc mắc nào bên dưới, đến khi thật sự hiểu bài thì hãy nhấn "Ok em đã hiểu" nhé!)
                          </p>
                        </div>
                      )}

                      {item.gaps && item.gaps.length > 0 && (
                        <div className="p-2 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Lỗ hổng kiến thức phát hiện: {item.gaps.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Attachment Preview if selected */}
              {attachedFile && (
                <div className="flex items-center gap-2 p-2 px-3 bg-cyan-950/90 border border-cyan-400/50 rounded-xl text-xs text-cyan-200">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate max-w-[220px] font-bold text-white">{attachedFile.name}</span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">({Math.round(attachedFile.size / 1024)} KB)</span>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="ml-auto text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800"
                    title="Gỡ bỏ tệp"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Chat & Voice Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentMsgInput}
                  onChange={(e) => setStudentMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendTeacherMessage(false)}
                  placeholder={`Hỏi Thầy/Cô trực tiếp 1-1 về Bước ${teacherStep} (AI phân tích chuyên sâu 4 phần, liên hệ trước-sau, giải thích bản chất & Casio)...`}
                  className="flex-1 p-3.5 rounded-xl border-2 border-cyan-500/40 bg-slate-950 text-white font-bold text-xs sm:text-sm outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/30 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Đính kèm Hình ảnh, PDF hoặc File bài tập"
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  onClick={startVoiceInput}
                  title="Nói bằng Giọng Nói Speech-to-Text"
                  className={`p-3 rounded-xl text-white transition-colors ${
                    isVoiceRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Mic className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  onClick={() => handleSendTeacherMessage(false)}
                  disabled={isAskingTeacher || (!studentMsgInput.trim() && !attachedFile)}
                  className="py-3 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{isAskingTeacher ? 'Thầy đang soạn...' : 'Hỏi Thầy'}</span>
                </button>
              </div>

              {/* Ready to Move Next Step Confirmation Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <p className="text-[11px] text-slate-300 font-medium italic">
                  💡 Bạn có thể hỏi đáp tự do với Thầy AI cho tới khi hoàn toàn nắm vững. Khi đã sẵn sàng:
                </p>

                {teacherStep < 5 ? (
                  <button
                    onClick={handleUnderstandStep}
                    className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ok em đã hiểu → Bước {teacherStep + 1} (+25 XP)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleUnderstandStep}
                    className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ok em đã hiểu → Sang 10 Bài Tập Về Nhà (+50 XP)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Formulas */}
      {activeTab === 'formulas' && (
        <div className="space-y-4">
          {chapter.keyFormulas.map((f, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-cyan-500/30 p-5 rounded-2xl space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">{f.name}</h4>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold px-2 py-0.5 rounded">
                  KaTeX Math Render
                </span>
              </div>

              <MathFormula math={f.formula} block />

              <div className="text-xs text-slate-200 font-medium">
                <MathText text={f.description} />
              </div>

              {f.casioTip && (
                <div className="text-xs font-semibold text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                  <MathText text={`🧮 Hướng dẫn bấm máy Casio FX-580VN X: ${f.casioTip}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Practice */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-cyan-500/30 p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-white text-base">{currentExample?.title}</h3>
            <div className="text-xs text-slate-200 leading-relaxed font-medium">
              <MathText text={currentExample?.problem || ''} />
            </div>
          </div>

          <InteractiveCanvas
            onExportCanvas={handleEvaluateCanvasSubmission}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* TAB 4: Homework */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-xs">
              Kho Bài Tập Về Nhà Tự Luyện (Chương {chapter.id})
            </h3>
            <button
              onClick={handleGenerateCustomHomework}
              disabled={isGeneratingCustom}
              className="py-2 px-3 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isGeneratingCustom ? 'AI đang tạo...' : 'Tạo Thêm Bài Tập Ngẫu Nhiên'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {chapter.homeworkTasks.map((hw, idx) => (
              <div
                key={hw.id}
                className="bg-slate-900 border border-cyan-500/30 p-4 rounded-2xl space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300">
                    Bài tập #{idx + 1}: {hw.title}
                  </span>
                  <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-cyan-400 text-[10px] font-bold border border-slate-700">
                    {hw.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                  </span>
                </div>
                <p className="text-xs text-slate-100 font-medium">{hw.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
