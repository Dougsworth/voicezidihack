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

    // Caribbean Patois/Creole detection - more conservative approach
    const caribbeanMarkers = ['mi', 'dem', 'yuh', 'weh', 'deh', 'nuh', 'seh', 'fi', 'inna', 'pon', 'gwaan', 'cyaan', 'bredrin', 'sistren', 'pickney', 'ting', 'waan', 'yaad', 'bwoy', 'gyal'];
    const detectedMarkers = caribbeanMarkers.filter(marker => 
      new RegExp(`\\b${marker}\\b`, 'i').test(rawTranscription)
    );
    const isCaribbean = detectedMarkers.length >= 2;
    
    let finalTranscription = rawTranscription;

    if (isCaribbean && openAiKey) {
      console.log('Caribbean dialect detected:', detectedMarkers.join(', '));
      console.log('Translating Caribbean dialect to standard English...');
      try {
        const gptRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { 
                role: 'system', 
                content: 'You are a Caribbean dialect translator. Translate Caribbean Creole/Patois to clear standard English while preserving location names and job context. Keep Caribbean job terms like "promo" meaning "someone".' 
              },
              { 
                role: 'user', 
                content: `Translate this Caribbean dialect to standard English: "${rawTranscription}"` 
              },
            ],
            temperature: 0.1,
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
              content: `Analyze this Caribbean voice transcription: "${finalTranscription}"

IMPORTANT CARIBBEAN CONTEXT:
- "promo" = "someone" (Caribbean term)
- "I need a promo to fix..." = "I need someone to fix..." = HIRING
- Understanding Caribbean job culture and terminology

Return ONLY a JSON object with these exact fields:
{
  "category": "find_work" or "hire_workers",
  "confidence": confidence score 0-1,
  "indicators": ["reason1", "reason2"],
  "location": "specific Caribbean place mentioned (or null)",
  "budget": "money amount with currency (or null)",
  "skill": "type of work/service (or null)",
  "timing": "when work should be done (or null)",
  "description": "clean summary preserving Caribbean context"
}

Categories:
- "find_work": person seeking employment/work opportunities, offering skills
- "hire_workers": person looking to hire someone for a job, needs work done

EXAMPLES:
- "I need a promo to fix my sink" → "hire_workers" (needs someone)
- "I'm looking for work" → "find_work" (seeking employment)
- "I am a plumber" → "find_work" (offering skills)

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
        // Enhanced fallback categorization with Caribbean awareness
        const lower = finalTranscription.toLowerCase();
        let seekingScore = 0;
        let hiringScore = 0;
        
        // Work seeking patterns
        if (/\b(i|me|mi)\s+(am\s+)?(need|want|looking\s+for)\s+(work|job|employment)/i.test(lower)) {
          seekingScore += 3;
        }
        if (/\b(i|me|mi)\s+(am\s+)?(a|an)\s+\w+/i.test(lower)) {
          seekingScore += 2;
        }
        
        // Hiring patterns with Caribbean awareness
        if (/\b(i|me|mi)\s+(need|want)\s+(a|an|some)?\s*(promo|someone|somebody)\s+(to|for|who\s+can)/i.test(lower)) {
          hiringScore += 4;
        }
        if (/\b(fix|paint|clean|repair)\s+(my|mi|our)\s+\w+/i.test(lower)) {
          hiringScore += 3;
        }
        
        if (seekingScore > hiringScore) {
          categorization = { category: 'find_work', confidence: 0.7, indicators: ['Fallback: seeking pattern'] };
        } else {
          categorization = { category: 'hire_workers', confidence: 0.7, indicators: ['Fallback: hiring pattern'] };
        }
      }
    }

    console.log('CATEGORY:', categorization);

    await axios.patch(
      `${supabaseUrl}/rest/v1/voice_jobs?gradio_event_id=eq.${eventId}`,
      {
        transcription: finalTranscription,
        raw_transcription: rawTranscription,
        is_patois: isCaribbean,
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