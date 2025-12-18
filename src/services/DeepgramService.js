import axios from 'axios';

class DeepgramService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.deepgram.com/v1',
      headers: {
        Authorization: `Token ${this.apiKey}`,
      },
    });
  }

  async transcribeAudio(audioBlob) {
    if (!this.apiKey) {
      throw new Error('Deepgram API key is missing');
    }

    try {
      const response = await this.client.post('/listen', audioBlob, {
        headers: {
          'Content-Type': audioBlob.type || 'audio/webm',
        },
        params: {
          model: 'nova',
          punctuate: true,
        },
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }

      const errMessage =
        response.data?.error || `Deepgram error ${response.status}: ${response.statusText}`;
      throw new Error(errMessage);
    } catch (error) {
      console.error('Deepgram transcription error:', error?.response || error);
      throw error;
    }
  }
}

export default DeepgramService;