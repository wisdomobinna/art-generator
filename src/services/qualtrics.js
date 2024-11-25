import axios from 'axios';

const QUALTRICS_API_TOKEN = process.env.REACT_APP_QUALTRICS_API_TOKEN;
const QUALTRICS_SURVEY_ID = process.env.REACT_APP_QUALTRICS_SURVEY_ID;
const QUALTRICS_DATA_CENTER = process.env.REACT_APP_QUALTRICS_DATA_CENTER;

const api = axios.create({
  baseURL: `https://${QUALTRICS_DATA_CENTER}.qualtrics.com/API/v3`,
  headers: {
    'X-API-TOKEN': QUALTRICS_API_TOKEN,
    'Content-Type': 'application/json'
  }
});

export const verifyQualtricsId = async (responseId) => {
  try {
    const response = await api.get(
      `/surveys/${QUALTRICS_SURVEY_ID}/responses/${responseId}`
    );
    
    return response.data.result && response.data.result.values ? true : false;
  } catch (error) {
    console.error('Error verifying Qualtrics ID:', error);
    return false;
  }
};