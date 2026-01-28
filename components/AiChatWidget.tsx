
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Mic, Send, MessageCircle, Volume2, Square } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { useAuth } from '../App';

// --- Utility Functions for Audio (from documentation) ---
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
  const dataInt16 = new Int16Array(data.buffer);
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

  // Refs for Live API
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
    setIsActive(true);
    setMessages([{ role: 'ai', text: `Hi ${user?.businessName}! I'm Nashwa, your AI business assistant. How can I help you today?` }]);

    // Initialize Gemini with the API key from process.env as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Store session promise to follow strict concurrency rules from guidelines
    sessionPromiseRef.current = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => console.log('AI session opened'),
        onmessage: async (message: LiveServerMessage) => {
          // Handle Transcriptions
          if (message.serverContent?.outputTranscription) {
            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            // Update UI with latest partial AI response
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

          // Handle Audio Data
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
            source.onended = () => sourcesRef.current.delete(source);
          }

          // Handle Interruption
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsAiSpeaking(false);
          }
        },
        onerror: (e) => console.error('AI Error:', e),
        onclose: () => {
          setIsActive(false);
          sessionPromiseRef.current = null;
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: `You are Nashwa, a proactive and brilliant business consultant for ${user?.businessName}. 
        You are the voice of the Nashwa platform. 
        You have access to the dashboard, inventory, and sales data. 
        Be professional, helpful, and concise. Your goal is to help the business owner grow.`,
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
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
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
        for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
        
        const base64Data = encode(new Uint8Array(int16.buffer));
        // Use sessionPromise.then to ensure data is sent to the resolved session and avoid race conditions
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
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;
    const text = currentInput;
    setCurrentInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    
    if (!sessionPromiseRef.current) await startSession();
    
    // Always use sessionPromise.then for sending inputs to comply with SDK guidelines
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        session.sendRealtimeInput({
          parts: [{ text: text }]
        });
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Nashwa AI Assistant</h3>
                <div className="flex items-center text-[10px] text-indigo-100">
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></div>
                  {isActive ? 'Real-time Connected' : 'Ready to help'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isAiSpeaking && (
              <div className="flex justify-start items-center space-x-2 p-2 text-indigo-500 animate-pulse">
                <Volume2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Nashwa Speaking...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMic}
                className={`p-3 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-rose-100 text-rose-600 shadow-inner' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isListening ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
              </button>
              <div className="flex-1 relative">
                <input 
                  type="text"
                  placeholder="Ask Nashwa about your business..."
                  className="w-full pl-4 pr-10 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-center text-slate-400 font-medium">
              Powered by Gemini 2.5 Live
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 group ${
          isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-indigo-600 text-white'
        }`}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <MessageCircle size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
            <Sparkles className="absolute -top-4 -right-4 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" size={16} />
          </div>
        )}
      </button>
    </div>
  );
};

export default AiChatWidget;
