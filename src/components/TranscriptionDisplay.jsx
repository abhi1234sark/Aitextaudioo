import React from 'react';

function TranscriptionDisplay({ transcription }) {
  return (
    <div className="transcription">
      <h2>Transcription</h2>
      {transcription ? (
        <p>{transcription}</p>
      ) : (
        <p className="empty">No transcription yet. Record to see it appear here.</p>
      )}
    </div>
  );
}

export default TranscriptionDisplay;

