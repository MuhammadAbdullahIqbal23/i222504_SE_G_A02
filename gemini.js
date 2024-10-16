const axios = require('axios');
const crypto = require('crypto');

class GeminiAPI {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseURL = 'https://api.gemini.com/v1';
  }

  async request(method, endpoint, data = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const payload = method === 'GET' ? {} : data;

    const timestamp = Date.now();
    const requestPayload = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha384', this.apiSecret)
      .update(`${timestamp}${requestPayload}`)
      .digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'X-GEMINI-APIKEY': this.apiKey,
      'X-GEMINI-PAYLOAD': Buffer.from(`${timestamp}${requestPayload}`).toString('base64'),
      'X-GEMINI-SIGNATURE': signature,
    };

    const response = await axios({ method, url, headers, data: payload });
    return response.data;
  }

  async getMarketData() {
    return await this.request('GET', '/markets');
  }
}

module.exports = GeminiAPI;
