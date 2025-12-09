# WhatsApp Voice Note Integration Setup

## Quick Start with Twilio (15 minutes)

### 1. Create Twilio Account
- Go to [twilio.com](https://www.twilio.com)
- Sign up for free trial ($15 credit)
- Verify your phone number

### 2. Set Up WhatsApp Sandbox
- In Twilio Console, go to "Messaging" → "Try it out" → "Send a WhatsApp message"
- Follow the sandbox setup (send "join [your-sandbox-word]" to the Twilio number)
- You'll get a WhatsApp number immediately

### 3. Create a Simple Backend

Create a new file `server.js`:

```javascript
const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio credentials (get from console.twilio.com)
const accountSid = 'YOUR_ACCOUNT_SID';
const authToken = 'YOUR_AUTH_TOKEN';
const client = twilio(accountSid, authToken);

// Webhook endpoint for incoming WhatsApp messages
app.post('/whatsapp', async (req, res) => {
  const { Body, From, MediaUrl0, MediaContentType0 } = req.body;

  // Check if it's a voice note
  if (MediaUrl0 && MediaContentType0?.includes('audio')) {
    console.log('Voice note received from:', From);
    
    // Transcribe the voice note
    try {
      // Download and transcribe using your preferred service
      // Options: OpenAI Whisper, Google Speech-to-Text, AWS Transcribe
      
      // For now, just acknowledge receipt
      await client.messages.create({
        body: 'Thanks for your voice note! We\'ll process your request shortly.',
        from: 'whatsapp:+14155238886', // Twilio sandbox number
        to: From
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('WhatsApp webhook server running on port 3000');
});
```

### 4. Set Up Voice Transcription

Add OpenAI Whisper for transcription:

```javascript
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: 'YOUR_OPENAI_API_KEY'
});

async function transcribeVoiceNote(audioUrl) {
  // Download audio file
  const response = await axios.get(audioUrl, { responseType: 'stream' });
  const audioPath = './temp_audio.ogg';
  response.data.pipe(fs.createWriteStream(audioPath));

  // Wait for download to complete
  await new Promise(resolve => response.data.on('end', resolve));

  // Transcribe with Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
  });

  // Clean up
  fs.unlinkSync(audioPath);

  return transcription.text;
}
```

### 5. Update Your Frontend

In `src/components/Header.tsx`, update the WhatsApp number:

```javascript
const whatsappNumber = "14155238886"; // Twilio sandbox number (remove + sign)
```

## Production Setup

For production, you'll need:
1. WhatsApp Business API approval (1-2 days)
2. Dedicated WhatsApp number
3. Hosting for the webhook server (Vercel, Railway, etc.)

## Cost Estimate
- Twilio WhatsApp: ~$0.005 per message
- OpenAI Whisper: ~$0.006 per minute of audio
- Total: ~$0.02 per voice note interaction

## Alternative: No-Code Solution

Use **Zapier** or **Make.com**:
1. Connect WhatsApp Business
2. Add transcription step (built-in)
3. Send to your database/email
4. ~$20/month for starter plan