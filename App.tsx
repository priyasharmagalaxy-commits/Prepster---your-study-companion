
import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Upload,
  FileText,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Quote,
  Trophy,
  History,
  Camera,
  X,
  RefreshCw,
  Sparkles,
  Rocket,
  Star,
  Trees,
  PenTool,
  Pencil,
  Notebook,
  Heart,
  Smile,
  Frown,
  PartyPopper,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { analyzeNotes, generateTopicImage } from './services/geminiService';
import { AnalysisResult, Question, QuizScore, UserAnswer } from './types';

// New Expressive Logo Component
const PrepsterLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    {/* A collage of icons representing the Prepster brand */}
    <div className="absolute -top-1 -left-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" /></div>
    <div className="absolute -top-2 right-0"><Rocket className="w-4 h-4 text-orange-500" /></div>
    <div className="absolute -bottom-1 -left-1"><Trees className="w-4 h-4 text-green-500" /></div>
    <div className="absolute -bottom-2 -right-1"><Heart className="w-4 h-4 text-red-500 fill-red-500" /></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm border border-gray-100">
      <BrainCircuit className="w-6 h-6 text-indigo-600" />
    </div>
    <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-4"><Pencil className="w-3 h-3 text-gray-400 rotate-45" /></div>
  </div>
);

const Landing = ({ onStart }: { onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
    <div className="bg-indigo-50 p-8 rounded-[2rem] mb-8 relative animate-float">
      <PrepsterLogo className="w-24 h-24" />
      <div className="absolute -right-4 top-0 bg-white p-2 rounded-lg shadow-lg rotate-12">
        <Notebook className="w-6 h-6 text-indigo-400" />
      </div>
      <div className="absolute -left-4 bottom-0 bg-white p-2 rounded-lg shadow-lg -rotate-12">
        <PenTool className="w-6 h-6 text-pink-400" />
      </div>
    </div>
    <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
      Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Prepster</span>
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl mb-12 leading-relaxed doodle-font font-bold">
      Your notebook's new best friend. We turn raw ideas into rocket fuel for your exams. ✨
    </p>
    <button
      onClick={onStart}
      className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1"
    >
      Start My Journey
      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

const FileUploadArea = ({
  onAnalysisStart
}: {
  onAnalysisStart: (text: string, image?: string) => void
}) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCapturing(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <PrepsterLogo className="w-10 h-10" />
            Upload Notes
          </h2>
          <div className="hidden sm:flex gap-2">
            <Star className="text-yellow-400 w-5 h-5" />
            <Heart className="text-pink-400 w-5 h-5" />
            <Rocket className="text-indigo-400 w-5 h-5" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-sm font-black text-indigo-900 uppercase tracking-widest">The Written Word</label>
            <textarea
              className="w-full h-72 p-6 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none resize-none transition-all shadow-inner"
              placeholder="Dump your thoughts here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-black text-indigo-900 uppercase tracking-widest">The Visuals</label>
            <div className="relative h-72 border-4 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer overflow-hidden group">
              {image ? (
                <div className="relative w-full h-full">
                  <img src={image} className="w-full h-full object-cover" alt="Uploaded preview" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : isCapturing ? (
                <div className="w-full h-full relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                    <button onClick={capturePhoto} className="bg-indigo-600 p-5 rounded-full text-white shadow-2xl hover:scale-110 transition-transform"><Camera /></button>
                    <button onClick={stopCamera} className="bg-gray-800 p-5 rounded-full text-white shadow-2xl hover:scale-110 transition-transform"><X /></button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 p-4 text-center">
                  <div className="flex gap-6">
                    <label className="p-6 bg-white rounded-3xl shadow-lg border-2 border-transparent cursor-pointer hover:border-indigo-400 transition-all group-hover:-translate-y-2">
                      <FileText className="w-10 h-10 text-indigo-600 mb-2 mx-auto" />
                      <span className="text-xs font-black uppercase">Browse Files</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <button
                      onClick={startCamera}
                      className="p-6 bg-white rounded-3xl shadow-lg border-2 border-transparent hover:border-indigo-400 transition-all group-hover:-translate-y-2 delay-75"
                    >
                      <Camera className="w-10 h-10 text-pink-600 mb-2 mx-auto" />
                      <span className="text-xs font-black uppercase">Snap Photo</span>
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs font-bold doodle-font uppercase">Handwritten notes are welcome!</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button
            disabled={!text && !image}
            onClick={() => onAnalysisStart(text, image || undefined)}
            className={`flex items-center gap-3 px-12 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl ${(!text && !image) ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 hover:-translate-y-1'
              }`}
          >
            Power Up Prepster
            <Sparkles className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizSection = ({ questions, onComplete }: { questions: Question[], onComplete: (score: number) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    const isCorrect = option === questions[currentIndex].correctAnswer;
    if (isCorrect) setScore(s => s + 1);

    setAnswers([...answers, {
      questionIndex: currentIndex,
      answer: option,
      isCorrect,
      feedback: questions[currentIndex].explanation
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(score);
    }
  };

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrectChoice = selectedOption === q.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <PrepsterLogo className="w-8 h-8" />
            <span className="text-sm font-black text-indigo-900 uppercase tracking-wider">Mission {currentIndex + 1} of {questions.length}</span>
          </div>
          <span className="text-sm font-black text-gray-500 doodle-font">{Math.round(progress)}% To Mastery</span>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden p-1 shadow-inner">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
        {isAnswered && (
          <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rotate-12 flex items-center justify-center opacity-20`}>
            {isCorrectChoice ? <PartyPopper className="w-24 h-24 text-green-500" /> : <AlertCircle className="w-24 h-24 text-red-500" />}
          </div>
        )}

        <h3 className="text-2xl font-black text-gray-800 mb-10 leading-tight">
          {q.question}
        </h3>

        <div className="space-y-4">
          {q.options.map((option, idx) => {
            const isCorrect = option === q.correctAnswer;
            const isSelected = option === selectedOption;
            let bgColor = "bg-gray-50 hover:bg-gray-100";
            let borderColor = "border-gray-100";
            let textColor = "text-gray-700";

            if (isAnswered) {
              if (isCorrect) {
                bgColor = "bg-green-100";
                borderColor = "border-green-500";
                textColor = "text-green-900";
              } else if (isSelected) {
                bgColor = "bg-red-100";
                borderColor = "border-red-500";
                textColor = "text-red-900";
              }
            } else if (isSelected) {
              borderColor = "border-indigo-500 bg-indigo-50";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${bgColor} ${borderColor} ${textColor} ${!isAnswered && 'hover:scale-[1.02] active:scale-95'}`}
              >
                <span className="font-bold text-lg">{option}</span>
                {isAnswered && isCorrect && <div className="flex gap-1"><Smile className="text-green-600" /><ThumbsUp className="text-green-600" /></div>}
                {isAnswered && isSelected && !isCorrect && <div className="flex gap-1"><Frown className="text-red-600" /><AlertCircle className="text-red-600" /></div>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`mt-10 p-8 rounded-[2rem] border-2 animate-in slide-in-from-top-4 duration-500 ${isCorrectChoice ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${isCorrectChoice ? 'bg-green-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}>
                {isCorrectChoice ? <Trophy className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <p className={`text-4xl font-black mb-2 doodle-font ${isCorrectChoice ? 'text-green-700' : 'text-red-700 animate-bounce'}`}>
                  {isCorrectChoice ? 'Excellent !' : 'Oops !'}
                </p>
                <p className={`font-medium leading-relaxed ${isCorrectChoice ? 'text-green-800' : 'text-red-800'}`}>
                  {q.explanation}
                </p>
              </div>
            </div>
            <button
              onClick={nextQuestion}
              className={`mt-8 w-full py-5 rounded-2xl font-black text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isCorrectChoice ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
              {currentIndex === questions.length - 1 ? 'Finish Adventure' : 'Onward!'}
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({
  result,
  onTakeQuiz,
  onBack,
  history,
  topicImage
}: {
  result: AnalysisResult,
  onTakeQuiz: () => void,
  onBack: () => void,
  history: QuizScore[],
  topicImage: string | null
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Banner */}
      <div className="relative h-72 md:h-96 rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
        <img
          src={topicImage || `https://picsum.photos/seed/${result.topicTitle}/1200/500`}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
          alt="Topic visuals"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-10">
          <div className="flex items-center gap-3 text-pink-400 mb-3 font-black uppercase tracking-widest text-sm">
            <PrepsterLogo className="w-6 h-6" />
            Prepster Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">{result.topicTitle}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Summary */}
          <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 relative">
            <div className="absolute top-0 right-10 -mt-6 bg-pink-500 text-white p-3 rounded-2xl shadow-lg rotate-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <FileText className="text-indigo-600 w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-gray-800">The Core Idea</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-xl doodle-font font-bold border-l-4 border-indigo-500 pl-6 py-2">
              &ldquo;{result.summary}&rdquo;
            </p>
          </section>

          {/* Key Points */}
          <section className="grid sm:grid-cols-2 gap-6">
            {result.keyPoints.map((point, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-50 flex gap-5 items-start hover:translate-y-[-4px] transition-all hover:shadow-indigo-100 group">
                <div className="bg-pink-50 p-3 rounded-2xl text-pink-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 fill-pink-500" />
                </div>
                <p className="text-gray-700 font-bold leading-relaxed">{point}</p>
              </div>
            ))}
          </section>

          {/* Quiz Call to Action */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3.5rem] p-12 text-white flex flex-col md:flex-row items-center gap-12 shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 -mr-20 -mt-20">
              <Rocket className="w-80 h-80 rotate-12" />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-4xl font-black mb-5 leading-tight">Ready to launch?</h3>
              <p className="text-indigo-100 text-xl mb-8 font-medium">Test your knowledge with 5 hand-picked questions by Prepster.</p>
              <button
                onClick={onTakeQuiz}
                className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-black text-xl hover:bg-pink-50 transition-all flex items-center gap-3 mx-auto md:mx-0 shadow-2xl active:scale-95"
              >
                Launch Practice Quiz
                <Rocket className="w-6 h-6" />
              </button>
            </div>
            <div className="relative z-10 flex gap-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center w-28">
                <span className="block text-4xl font-black mb-1">5</span>
                <span className="text-[10px] uppercase font-black text-indigo-200 tracking-tighter">Challenges</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center w-28">
                <span className="block text-4xl font-black mb-1">AI</span>
                <span className="text-[10px] uppercase font-black text-indigo-200 tracking-tighter">Coach</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          {/* Quotes */}
          <section className="bg-indigo-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <Quote className="absolute -bottom-8 -left-8 text-indigo-500/20 w-48 h-48 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <PrepsterLogo className="w-8 h-8" />
              Prepster Wisdom
            </h2>
            <div className="space-y-8 relative z-10">
              {result.quotes.map((quote, idx) => (
                <div key={idx} className="relative">
                  <p className="text-indigo-200 italic font-medium doodle-font leading-relaxed text-lg">&ldquo;{quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </section>

          {/* History Tracker */}
          {history.length > 0 && (
            <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50">
              <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <History className="text-indigo-600 w-6 h-6" />
                Evolution
              </h2>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'black', color: '#4f46e5' }}
                    />
                    <Area
                      type="step"
                      dataKey="score"
                      stroke="#4f46e5"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-6 text-center text-sm font-black text-indigo-600 doodle-font bg-indigo-50 py-3 rounded-2xl">
                You're getting smarter every second! 🧠
              </p>
            </section>
          )}

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-3 py-6 border-4 border-dashed border-indigo-100 rounded-[2.5rem] text-indigo-400 font-black text-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
          >
            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            Analyze New Notes
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizResults = ({
  score,
  total,
  onRetry,
  onDone
}: {
  score: number,
  total: number,
  onRetry: () => void,
  onDone: () => void
}) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="max-w-xl mx-auto text-center py-12 space-y-10 animate-in zoom-in-95 duration-500">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-full shadow-2xl animate-bounce">
          <Trophy className="w-16 h-16 text-white" />
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-4xl font-black text-gray-900">Mission Accomplished!</h2>
          <p className="text-gray-500 font-bold doodle-font text-lg">Prepster is proud of you!</p>
        </div>

        <div className="my-12 relative inline-block">
          <svg className="w-64 h-64 -rotate-90">
            <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-gray-100" />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={691}
              strokeDashoffset={691 - (691 * percentage) / 100}
              className="text-indigo-600 transition-all duration-[1.5s] ease-out stroke-cap-round"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl font-black text-gray-900">{score}/{total}</span>
            <span className="text-xs uppercase font-black tracking-[0.2em] text-indigo-400">Total Points</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-3 py-5 bg-gray-100 text-gray-700 rounded-3xl font-black text-lg hover:bg-gray-200 transition-all active:scale-95"
          >
            <RefreshCw className="w-6 h-6" />
            Re-run Mission
          </button>
          <button
            onClick={onDone}
            className="flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            Review Insights
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className={`p-10 rounded-[3rem] border-2 flex items-center justify-center gap-4 ${percentage >= 80 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-pink-50 border-pink-200 text-pink-800'}`}>
        <Sparkles className="w-8 h-8" />
        <p className="text-2xl font-black doodle-font">
          {percentage >= 80 ? "Pure Brilliance!" :
            percentage >= 50 ? "Solid Progress!" :
              "Keep Pushing!"}
        </p>
      </div>
    </div>
  );
};

enum AppState {
  LANDING,
  UPLOADING,
  ANALYZING,
  DASHBOARD,
  QUIZ,
  QUIZ_RESULTS
}

export default function App() {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizScore[]>([]);
  const [lastQuizScore, setLastQuizScore] = useState({ score: 0, total: 0 });
  const [topicImage, setTopicImage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState("Waking up Prepster...");

  const handleStartAnalysis = async (text: string, image?: string) => {
    setState(AppState.ANALYZING);
    setLoadingStep("Reading your mind (and notes)...");

    try {
      const result = await analyzeNotes(text, image);
      setAnalysisResult(result);

      setLoadingStep("Drawing some cool diagrams...");
      const img = await generateTopicImage(result.imagePrompt);
      setTopicImage(img);

      setState(AppState.DASHBOARD);
    } catch (error) {
      console.error(error);
      alert("Prepster hit a small bump! Let's try that again.");
      setState(AppState.UPLOADING);
    }
  };

  const handleQuizComplete = (score: number) => {
    const total = analysisResult?.questions.length || 0;
    setLastQuizScore({ score, total });

    const newEntry: QuizScore = {
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: Math.round((score / total) * 100),
      total
    };
    setQuizHistory(prev => [...prev.slice(-9), newEntry]);
    setState(AppState.QUIZ_RESULTS);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20 custom-scrollbar overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setState(AppState.LANDING)}
          >
            <div className="transition-transform group-hover:scale-110">
              <PrepsterLogo className="w-10 h-10" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">Prepster</span>
          </div>
          {state !== AppState.LANDING && (
            <div className="flex items-center gap-6">
              <button
                onClick={() => setState(AppState.UPLOADING)}
                className="hidden md:flex items-center gap-2 px-6 py-3 text-sm font-black text-gray-600 hover:bg-gray-50 rounded-2xl transition-all hover:scale-105"
              >
                <Upload className="w-5 h-5" />
                New Study Pack
              </button>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {state === AppState.LANDING && <Landing onStart={() => setState(AppState.UPLOADING)} />}

        {state === AppState.UPLOADING && (
          <FileUploadArea onAnalysisStart={handleStartAnalysis} />
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-indigo-100 blur-[80px] rounded-full opacity-50 animate-pulse" />
              <div className="relative">
                <PrepsterLogo className="w-32 h-32 animate-float" />
                <Loader2 className="absolute -bottom-4 -right-4 w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 doodle-font">Prepster is hard at work...</h2>
            <p className="text-gray-500 font-bold text-lg">{loadingStep}</p>
          </div>
        )}

        {state === AppState.DASHBOARD && analysisResult && (
          <Dashboard
            result={analysisResult}
            onTakeQuiz={() => setState(AppState.QUIZ)}
            onBack={() => setState(AppState.UPLOADING)}
            history={quizHistory}
            topicImage={topicImage}
          />
        )}

        {state === AppState.QUIZ && analysisResult && (
          <QuizSection
            questions={analysisResult.questions}
            onComplete={handleQuizComplete}
          />
        )}

        {state === AppState.QUIZ_RESULTS && (
          <QuizResults
            score={lastQuizScore.score}
            total={lastQuizScore.total}
            onRetry={() => setState(AppState.QUIZ)}
            onDone={() => setState(AppState.DASHBOARD)}
          />
        )}
      </main>

      {/* Decorative Doodles Fixed */}
      <div className="fixed bottom-10 left-10 text-indigo-100 pointer-events-none select-none -z-10 opacity-30">
        <Rocket className="w-40 h-40 rotate-[20deg]" />
      </div>
      <div className="fixed top-32 right-10 text-pink-100 pointer-events-none select-none -z-10 opacity-30">
        <Star className="w-32 h-32 rotate-[-15deg] fill-pink-50" />
      </div>
    </div>
  );
}
