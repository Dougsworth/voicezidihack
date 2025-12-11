const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://unyttmpquqfypoxsbkve.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Helper function to download and transcribe voice notes
async function transcribeVoiceNote(audioUrl, messageId) {
  try {
    // Download audio file
    const response = await axios.get(audioUrl, { 
      responseType: 'stream',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`
      }
    });
    
    const tempPath = path.join(__dirname, `temp_${messageId}.ogg`);
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-1",
      language: "en", // You can add Spanish "es" support for Caribbean
    });

    // Clean up temp file
    await fs.unlink(tempPath);

    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Helper function to parse gig details from transcription
function parseGigDetails(transcription) {
  const details = {
    gig_type: null,
    category: null,
    description: transcription,
    title: null,
    location: null,
    budget_min: null,
    budget_max: null,
  };

  // Detect if it's a job posting or work request
  const jobKeywords = ['hiring', 'looking for', 'need someone', 'job available'];
  const workKeywords = ['looking for work', 'available for', 'can do', 'i do'];
  
  const lowerText = transcription.toLowerCase();
  if (jobKeywords.some(keyword => lowerText.includes(keyword))) {
    details.gig_type = 'job_posting';
  } else if (workKeywords.some(keyword => lowerText.includes(keyword))) {
    details.gig_type = 'work_request';
  }

  // Extract budget if mentioned
  const budgetMatch = transcription.match(/\$?(\d+)(?:\s*-\s*\$?(\d+))?/);
  if (budgetMatch) {
    details.budget_min = parseInt(budgetMatch[1]);
    details.budget_max = budgetMatch[2] ? parseInt(budgetMatch[2]) : details.budget_min;
  }

  // Generate title (first 50 chars of transcription)
  details.title = transcription.substring(0, 50) + (transcription.length > 50 ? '...' : '');

  return details;
}

// WhatsApp webhook endpoint
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { Body, From, MessageSid, NumMedia, MediaUrl0, MediaContentType0 } = req.body;

    console.log('Received WhatsApp message:', { From, MessageSid, NumMedia });

    // Check if it's a voice note
    if (NumMedia > 0 && MediaContentType0?.includes('audio')) {
      // Send immediate acknowledgment
      await twilioClient.messages.create({
        body: '🎤 Voice note received! Processing your request...',
        from: req.body.To,
        to: From
      });

      // Transcribe the voice note
      const transcription = await transcribeVoiceNote(MediaUrl0, MessageSid);
      
      // Parse gig details
      const gigDetails = parseGigDetails(transcription);

      // Save to Supabase
      const { data, error } = await supabase
        .from('voice_gigs')
        .insert({
          whatsapp_number: From,
          whatsapp_message_id: MessageSid,
          voice_url: MediaUrl0,
          transcription: transcription,
          ...gigDetails,
          status: 'active',
          processed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Send confirmation message
      let confirmationMsg = `✅ Got it! Here's what I understood:\n\n"${transcription}"\n\n`;
      
      if (gigDetails.gig_type === 'job_posting') {
        confirmationMsg += `📋 Job posted! Workers will contact you soon via WhatsApp.`;
      } else if (gigDetails.gig_type === 'work_request') {
        confirmationMsg += `👷 Work profile created! You'll be notified of matching jobs.`;
      } else {
        confirmationMsg += `📝 Request saved! We'll review and match you with opportunities.`;
      }

      await twilioClient.messages.create({
        body: confirmationMsg,
        from: req.body.To,
        to: From
      });

    } else {
      // Handle text messages
      await twilioClient.messages.create({
        body: '👋 Please send a voice note describing the job you need done or the work you\'re looking for!',
        from: req.body.To,
        to: From
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing request');
  }
});

// API endpoint to get active gigs
app.get('/api/gigs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voice_gigs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Geocode proxy endpoint to avoid CORS issues
app.get('/api/geocode', async (req, res) => {
  try {
    const { query, country = 'jm' } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        countrycodes: country,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        'accept-language': 'en'
      },
      headers: {
        'User-Agent': 'LinkUpWork/1.0 (voice-gig-connect)'
      },
      timeout: 3000
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Geocode API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Geocoding service temporarily unavailable',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Voice Gig Connect API running on port ${PORT}`);
  console.log(`WhatsApp webhook URL: https://your-domain.com/webhook/whatsapp`);
});