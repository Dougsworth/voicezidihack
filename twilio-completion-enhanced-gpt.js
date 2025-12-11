const axios = require('axios');

exports.handler = async function (context, event, callback) {
  const eventId = event.event_id;
  const attempt = event.attempt || 1;

  console.log(`=== ENHANCED GPT ATTEMPT ${attempt} for ${eventId} ===`);

  const openAiKey = context.OPENAI_API_KEY;
  const supabaseUrl = context.SUPABASE_URL || 'https://unyttmpquqfypoxsbkve.supabase.co';
  const supabaseKey = context.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXR0bXBxdXFmeXBveHNia3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODUzMTYsImV4cCI6MjA4MDg2MTMxNn0.0C2uxEYluWN_fuoKE7JCTiMQrPhddL9xPxnC9Cj6Erc';

  try {
    let rawTranscription = null;

    for (let i = 0; i < 6; i++) {
      console.log(`Poll ${i + 1}/6`);

      const result = await axios.get(
        `https://dougsworth-linkup-asr.hf.space/gradio_api/call/transcribe/${eventId}`
      );

      const lines = String(result.data).split('\n');
      const dataLine = lines.find((l) => l.startsWith('data:'));

      if (dataLine) {
        rawTranscription = JSON.parse(dataLine.replace('data: ', ''))[0];
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!rawTranscription) {
      if (attempt < 5) {
        console.log('Not ready, chaining...');
        axios.post(
          'https://linkupwork-8807.twil.io/complete-transcription',
          { event_id: eventId, attempt: attempt + 1 },
          { headers: { 'Content-Type': 'application/json' }, timeout: 1000 }
        ).catch(() => {});
        return callback(null, { status: 'retrying', attempt });
      }

      await axios.patch(
        `${supabaseUrl}/rest/v1/voice_jobs?gradio_event_id=eq.${eventId}`,
        { status: 'failed' },
        {
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return callback(null, { status: 'failed' });
    }

    console.log('RAW:', rawTranscription);

    // Patois detection and translation (keep existing logic)
    const patoisPattern = /\b(mi|dem|yuh|weh|deh|nuh|seh|fi|inna|pon|gwaan|cyaan|bredrin|sistren|pickney|ting|waan|yaad|bwoy|gyal)\b/i;
    const isPatois = patoisPattern.test(rawTranscription);
    let finalTranscription = rawTranscription;

    if (isPatois && openAiKey) {
      console.log('Translating Patois...');
      try {
        const gptRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Translate Jamaican Patois to clear standard English while preserving location names and job context.' },
              { role: 'user', content: `Translate: "${rawTranscription}"` },
            ],
            temperature: 0.3,
            max_tokens: 200,
          },
          { headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' } }
        );
        finalTranscription = gptRes.data.choices[0]?.message?.content || rawTranscription;
      } catch (gptError) {
        console.error('GPT translation failed:', gptError.message);
      }
    }

    console.log('FINAL:', finalTranscription);

    // GPT-powered job categorization and detail extraction
    let categorization = { category: 'hire_workers', confidence: 0.5, indicators: [] };
    let extractedDetails = {
      location: null,
      budget: null,
      skill: null,
      timing: null,
      description: finalTranscription
    };

    if (openAiKey) {
      try {
        console.log('🤖 Using GPT for categorization and extraction...');
        
        const gptResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: `Analyze this Jamaican voice transcription: "${finalTranscription}"

Return ONLY a JSON object with these exact fields:
{
  "category": "find_work" or "hire_workers",
  "confidence": confidence score 0-1,
  "indicators": ["reason1", "reason2"],
  "location": "specific place in Jamaica mentioned (or null)",
  "budget": "money amount with currency (or null)",
  "skill": "type of work/service (or null)",
  "timing": "when work should be done (or null)",
  "description": "clean summary of the request"
}

Categories:
- "find_work": person seeking employment/work opportunities
- "hire_workers": person looking to hire someone for a job

Be conservative with extractions - only extract if clearly stated.`
            }],
            temperature: 0.1,
            max_tokens: 300
          },
          { headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' } }
        );

        const gptContent = gptResponse.data.choices[0]?.message?.content;
        if (gptContent) {
          const parsed = JSON.parse(gptContent);
          categorization = {
            category: parsed.category || 'hire_workers',
            confidence: parsed.confidence || 0.8,
            indicators: parsed.indicators || ['GPT analysis']
          };
          extractedDetails = {
            location: parsed.location,
            budget: parsed.budget,
            skill: parsed.skill,
            timing: parsed.timing,
            description: parsed.description || finalTranscription
          };
          console.log('✅ GPT Analysis:', { categorization, extractedDetails });
        }
      } catch (gptError) {
        console.error('GPT analysis failed:', gptError.message);
        // Fallback to basic categorization
        const seeking = /\b(i|me|mi)\s+(need|want|looking\s+for|am\s+looking\s+for)\s+(a\s+)?(job|work|employment)|available\s+(for\s+)?(work|job)|i\s+(can|do|offer)/i;
        const hiring = /\b(need|want|looking\s+for)\s+(a|an|some|someone|somebody)\s+\w+\s+(to|for|who\s+can)|someone\s+(to|must|should)\s+\w+|fix\s+my|paint\s+my|clean\s+my/i;
        
        if (seeking.test(finalTranscription.toLowerCase())) {
          categorization = { category: 'find_work', confidence: 0.7, indicators: ['Fallback: seeking pattern'] };
        }
      }
    }

    console.log('CATEGORY:', categorization);

    await axios.patch(
      `${supabaseUrl}/rest/v1/voice_jobs?gradio_event_id=eq.${eventId}`,
      {
        transcription: finalTranscription,
        raw_transcription: rawTranscription,
        is_patois: isPatois,
        gig_type: categorization.category === 'find_work' ? 'work_request' : 'job_posting',
        category_confidence: categorization.confidence,
        category_indicators: categorization.indicators,
        // Add extracted details
        extracted_location: extractedDetails.location,
        extracted_budget: extractedDetails.budget,
        extracted_skill: extractedDetails.skill,
        extracted_timing: extractedDetails.timing,
        extracted_description: extractedDetails.description,
        extraction_completed: true,
        status: 'completed',
      },
      {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('=== ENHANCED GPT DONE ===');
    return callback(null, {
      success: true,
      category: categorization.category,
      extractedDetails: extractedDetails
    });

  } catch (error) {
    console.error('ERR:', error.message);
    return callback(null, { error: error.message });
  }
};