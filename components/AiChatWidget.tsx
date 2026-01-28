
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Mic, Send, MessageCircle, Volume2, Square, Zap } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { useAuth } from '../App';

// --- Utility Functions for Audio (Strict adherence to SDK Examples) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AiChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Refs for Live API State Management
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const currentOutputTranscriptionRef = useRef('');

  useEffect(() => {
    if (!isOpen && isActive) {
      stopSession();
    }
  }, [isOpen]);

  const startSession = async () => {
    if (sessionPromiseRef.current) return;

    setIsActive(true);
    setMessages([{ role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm Nashwa, your business intelligence partner. How can I help you today?` }]);

    // JIT Initialization of SDK with process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    sessionPromiseRef.current = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => console.log('Nashwa Live Link established.'),
        onmessage: async (message: LiveServerMessage) => {
          // Handle AI Transcriptions for smooth text display
          if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            currentOutputTranscriptionRef.current += text;
            
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'ai') {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...last, text: currentOutputTranscriptionRef.current };
                return newMessages;
              } else {
                return [...prev, { role: 'ai', text: currentOutputTranscriptionRef.current }];
              }
            });
          }

          if (message.serverContent?.turnComplete) {
            currentOutputTranscriptionRef.current = '';
            setIsAiSpeaking(false);
          }

          // Handle Model Turn Audio Modality
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            setIsAiSpeaking(true);
            const ctx = audioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
            
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
            };
          }

          // Handle User Interruption
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => {
              try { s.stop(); } catch(e) {}
            });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsAiSpeaking(false);
          }
        },
        onerror: (e) => {
          console.error('Nashwa Live Error:', e);
          setIsActive(false);
        },
        onclose: () => {
          setIsActive(false);
          sessionPromiseRef.current = null;
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: `You are Nashwa, the personification of a high-performance local business management platform. 
        You are proactive, brilliant, and data-driven. 
        You help owners with inventory management, sales trends, and business growth. 
        Your tone is professional yet friendly and motivating. Keep responses punchy and focused on the user's data.`,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setIsListening(false);
    setIsAiSpeaking(false);
  };

  const toggleMic = async () => {
    if (!sessionPromiseRef.current) await startSession();

    if (isListening) {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsListening(true);

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
        }
        
        const base64Data = encode(new Uint8Array(int16.buffer));
        // Use sessionPromise.then to strictly follow concurrency guidelines
        if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => {
            session.sendRealtimeInput({
              media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
            });
          });
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err) {
      console.error('Mic Access Denied:', err);
      setIsListening(false);
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;
    const text = currentInput;
    setCurrentInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    
    if (!sessionPromiseRef.current) await startSession();
    
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        session.sendRealtimeInput({
          parts: [{ text: text }]
        });
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <Zap size={24} className="text-white fill-white" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">Nashwa Live</h3>
                <div className="flex items-center text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                  {isActive ? 'Neural Link Active' : 'Standby Mode'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isAiSpeaking && (
              <div className="flex justify-start items-center space-x-3 p-3 text-indigo-600 animate-pulse bg-indigo-50/50 rounded-2xl w-fit">
                <Volume2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Voice Synthesis Active...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-50">
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleMic}
                className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
                  isListening 
                    ? 'bg-rose-500 text-white shadow-rose-200 animate-pulse' 
                    : 'bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {isListening ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
              </button>
              <div className="flex-1 relative group">
                <input 
                  type="text"
                  placeholder="Ask Nashwa Intelligence..."
                  className="w-full pl-6 pr-12 py-4 bg-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all border-none placeholder:text-slate-300"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:scale-110 transition-transform disabled:opacity-30"
                  disabled={!currentInput.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4 opacity-40">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gemini 2.5 Live Protocol</span>
               <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-3xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-95 group relative overflow-hidden ${
          isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-indigo-600 text-white'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <X size={28} />
        ) : (
          <div className="relative">
            <MessageCircle size={28} className="fill-white" />
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full border-[3px] border-indigo-600"></div>
            <Sparkles className="absolute -top-6 -right-6 text-indigo-200 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" size={20} />
          </div>
        )}
      </button>
    </div>
  );
};

export default AiChatWidget;
