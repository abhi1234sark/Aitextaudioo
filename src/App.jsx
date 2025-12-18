import React, { useCallback, useEffect, useRef, useState } from 'react';
import AudioRecorder from './components/AudioRecorder.jsx';
import TranscriptionDisplay from './components/TranscriptionDisplay.jsx';
import DeepgramService from './services/DeepgramService';

const deepgramService = new DeepgramService(import.meta.env.VITE_DEEPGRAM_API_KEY);

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [error, setError] = useState('');

  const startRecording = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          const dgResponse = await deepgramService.transcribeAudio(audioBlob);
          const transcript =
            dgResponse?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
          setTranscription(transcript);
        } catch (dgError) {
          console.error(dgError);
          setError('Could not transcribe audio. Check your API key and network.');
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError('Microphone access failed. Please allow mic permissions.');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="app-shell">
      <div className="card">
        <header className="header">
          <div>
            <p className="eyebrow">Realtime voice-to-text</p>
            <h1 className="title">Voice-to-Text Studio</h1>
            <p className="subtitle">Record a short sample and let Deepgram transcribe it.</p>
          </div>
          <div className={`status-chip ${isRecording ? 'live' : ''}`}>
            <span className="status-dot" />
            {isRecording ? 'Recording' : 'Idle'}
          </div>
        </header>

        <div className="section">
          <AudioRecorder
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />
        </div>

        {error && <div className="alert">⚠️ {error}</div>}

        <TranscriptionDisplay transcription={transcription} />
        <p className="footnote">Audio stays in the browser until sent to Deepgram for text.</p>
      </div>
    </div>
  );
}

export default App;

