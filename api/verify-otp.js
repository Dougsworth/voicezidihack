const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { phoneNumber, code } = JSON.parse(event.body);

    if (!phoneNumber || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Phone number and verification code are required' }),
      };
    }

    // Verify OTP via Twilio Verify
    const verificationCheck = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });

    console.log('OTP verification for:', phoneNumber, 'Status:', verificationCheck.status);

    if (verificationCheck.status === 'approved') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Phone number verified successfully',
          status: verificationCheck.status 
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'Invalid verification code',
          status: verificationCheck.status 
        }),
      };
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    
    // Handle specific Twilio errors
    if (error.code === 20404) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'Invalid or expired verification code' 
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Verification failed',
        error: error.message 
      }),
    };
  }
};