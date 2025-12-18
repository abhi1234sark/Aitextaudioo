import React from 'react';

function AudioRecorder({ isRecording, onStartRecording, onStopRecording }) {
  return (
    <div className="controls">
      <button
        className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
        onClick={isRecording ? onStopRecording : onStartRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p className="hint">{isRecording ? 'Recording in progress...' : 'Allow mic access to start.'}</p>
    </div>
  );
}

export default AudioRecorder;

