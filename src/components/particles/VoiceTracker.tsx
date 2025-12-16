import React, { useEffect, useState } from 'react';

interface VoiceTrackerProps {
  onCommand: (command: string) => void;
}

export const VoiceTracker: React.FC<VoiceTrackerProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      // Auto-restart if it stops unexpected
      setIsListening(false);
      // Optional: recognition.start(); // Be careful with loops
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const command = event.results[i][0].transcript.trim().toLowerCase();
          console.log("Voice Command Detected:", command);
          
          if (command.includes('fire') || command.includes('ball') || command.includes('explode') || command.includes('boom')) {
            onCommand('fireball');
            setTranscript('FIREBALL!');
            setTimeout(() => setTranscript(''), 2000);
          } else if (command.includes('reset') || command.includes('clear')) {
            onCommand('reset');
            setTranscript('RESET');
             setTimeout(() => setTranscript(''), 2000);
          }
        } else {
             currentTranscript += event.results[i][0].transcript;
        }
      }
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Failed to start voice recognition", e);
    }

    return () => {
      recognition.stop();
    };
  }, [onCommand]);

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-none">
       {/* Visual Feedback for Voice */}
       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500/20 border border-red-500/50' : 'bg-gray-800/50 border border-gray-700'}`}>
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">
              {transcript || (isListening ? "Listening..." : "Voice Off")}
          </span>
       </div>
    </div>
  );
};
