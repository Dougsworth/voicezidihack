const axios = require('axios');
const FormData = require('form-data');

exports.handler = function (context, event, callback) {
  console.log('=== ENHANCED WEBHOOK RECEIVED ===');
  
  const recordingSid = event.RecordingSid;
  const callSid = event.CallSid;
  const recordingUrl = event.RecordingUrl;
  const accountSid = context.ACCOUNT_SID;
  const authToken = context.AUTH_TOKEN;
  const twilioClient = context.getTwilioClient();
  const supabaseUrl = 'https://unyttmpquqfypoxsbkve.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXR0bXBxdXFmeXBveHNia3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODUzMTYsImV4cCI6MjA4MDg2MTMxNn0.0C2uxEYluWN_fuoKE7JCTiMQrPhddL9xPxnC9Cj6Erc';
  
  let callerNum;
  let eventId;

  twilioClient
    .calls(callSid)
    .fetch()
    .then((call) => {
      callerNum = call.from;
      console.log('Caller:', callerNum);
      
      const audioUrl = `https://${accountSid}:${authToken}@api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recordingSid}.wav`;
      
      return axios.get(audioUrl, {
        responseType: 'arraybuffer',
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
    })
    .then((audioResponse) => {
      console.log('Audio size:', audioResponse.data.length);
      
      const form = new FormData();
      form.append('files', Buffer.from(audioResponse.data), {
        filename: 'recording.wav',
        contentType: 'audio/wav',
      });
      
      return axios.post(
        'https://dougsworth-linkup-asr.hf.space/gradio_api/upload',
        form,
        {
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
    })
    .then((uploadResponse) => {
      console.log('Uploaded:', uploadResponse.data[0]);
      
      return axios.post(
        'https://dougsworth-linkup-asr.hf.space/gradio_api/call/transcribe',
        {
          data: [{ path: uploadResponse.data[0], meta: { _type: 'gradio.FileData' } }],
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
    })
    .then((transcribeResponse) => {
      eventId = transcribeResponse.data.event_id;
      console.log('Event ID:', eventId);
      
      return axios.post(
        `${supabaseUrl}/rest/v1/voice_jobs`,
        {
          caller_phone: callerNum,
          recording_sid: recordingSid,
          recording_url: recordingUrl + '.wav',
          gradio_event_id: eventId,
          status: 'processing',
          gig_type: null,
          category_confidence: null,
          category_indicators: null
        },
        {
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
        }
      );
    })
    .then(() => {
      console.log('SAVED, TRIGGERING ENHANCED COMPLETION ===');
      
      // Call the enhanced completion function
      axios.post(
        'https://linkupwork-8807.twil.io/complete-transcription',
        { event_id: eventId },
        { headers: { 'Content-Type': 'application/json' }, timeout: 1000 }
      ).catch(() => {});
      
      return callback(null, { success: true, eventId });
    })
    .catch((error) => {
      console.error('WEBHOOK ERR:', error.message);
      return callback(null, { error: error.message });
    });
};