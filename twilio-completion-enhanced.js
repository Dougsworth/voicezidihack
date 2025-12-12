const axios = require('axios');

exports.handler = async function (context, event, callback) {
  const eventId = event.event_id;
  const attempt = event.attempt || 1;

  console.log(`=== ENHANCED ATTEMPT ${attempt} for ${eventId} ===`);

  const openAiKey = context.OPENAI_API_KEY;
  const supabaseUrl = 'https://unyttmpquqfypoxsbkve.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXR0bXBxdXFmeXBveHNia3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODUzMTYsImV4cCI6MjA4MDg2MTMxNn0.0C2uxEYluWN_fuoKE7JCTiMQrPhddL9xPxnC9Cj6Erc';

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

    // Intelligent location correction
    let locationCorrected = await correctLocationsIntelligently(rawTranscription);

    // Caribbean-aware patois detection - only apply if actually detected
    const patoisMarkers = ['mi', 'dem', 'yuh', 'weh', 'deh', 'nuh', 'seh', 'fi', 'inna', 'pon', 'gwaan', 'cyaan', 'bredrin', 'sistren', 'pickney', 'ting', 'waan', 'yaad', 'bwoy', 'gyal'];
    const detectedMarkers = patoisMarkers.filter(marker => 
      new RegExp(`\\b${marker}\\b`, 'i').test(rawTranscription)
    );
    const isPatois = detectedMarkers.length >= 2;
    
    let finalTranscription = locationCorrected;

    // Only translate if we're confident it's patois
    if (isPatois && openAiKey) {
      console.log('Patois detected:', detectedMarkers.join(', '));
      console.log('Translating patois to English...');
      try {
        const gptRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4-turbo-preview',
            messages: [
              { 
                role: 'system', 
                content: 'You are a Jamaican Patois to English translator. Translate ONLY if the text contains clear Patois. Preserve location names, job context, and Caribbean terms like "promo" (someone). Do not change regular English text.'
              },
              { 
                role: 'user', 
                content: `Text: "${locationCorrected}"\n\nIf this contains Jamaican Patois, translate to clear English. If it's already English, return it unchanged. Keep Caribbean job terms like "promo" meaning "someone".`
              },
            ],
            temperature: 0.1,
            max_tokens: 200,
          },
          { headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' } }
        );
        finalTranscription = gptRes.data.choices[0]?.message?.content || locationCorrected;
      } catch (gptError) {
        console.error('GPT translation failed:', gptError.message);
      }
    } else {
      console.log('No patois detected - keeping original text');
    }

    console.log('FINAL:', finalTranscription);

    // Enhanced job categorization with Caribbean awareness
    const categorization = categorizeJobWithCaribbean(finalTranscription);
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

    console.log('=== ENHANCED DONE ===');
    return callback(null, {
      success: true,
      category: categorization.category,
      locationsCorrected: finalTranscription !== rawTranscription
    });

  } catch (error) {
    console.error('ERR:', error.message);
    return callback(null, { error: error.message });
  }
};

// Smart location correction using OpenStreetMap API
async function correctLocationsIntelligently(text) {
  const locationPattern = /(?:in|at|to|from|near|inna|deh|a)\s+([A-Z][a-zA-Z\s]{2,}?)(?:\s|,|\.|\b)/gi;
  const matches = [...text.matchAll(locationPattern)];

  if (matches.length === 0) return text;

  let correctedText = text;

  for (const match of matches) {
    const potentialLocation = match[1].trim();

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(potentialLocation)}&countrycodes=jm&format=json&limit=2`,
        {
          headers: { 'User-Agent': 'LinkUpWork/1.0' },
          timeout: 1500
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const placeName = result.address?.suburb || result.address?.city || result.address?.town || result.name;

        if (placeName && calculateSimilarity(potentialLocation.toLowerCase(), placeName.toLowerCase()) > 0.6) {
          console.log(`Location corrected: "${potentialLocation}" -> "${placeName}"`);
          correctedText = correctedText.replace(
            new RegExp(potentialLocation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            placeName
          );
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(`Location API error for "${potentialLocation}":`, error.message);
    }
  }

  return correctedText;
}

// Enhanced Caribbean-aware job categorization
function categorizeJobWithCaribbean(text) {
  const lower = text.toLowerCase();
  const indicators = [];
  let seekingScore = 0;
  let hiringScore = 0;

  // WORK SEEKING patterns (work_request)
  // "I need work", "I'm looking for work", "I am a plumber", etc.
  if (/\b(i|me|mi)\s+(am\s+)?(need|want|looking\s+for)\s+(work|job|employment)/i.test(lower)) {
    seekingScore += 3;
    indicators.push('Seeking work directly');
  }
  
  if (/\b(i|me|mi)\s+(am\s+)?(a|an)\s+\w+/i.test(lower)) {
    seekingScore += 2;
    indicators.push('Job role declaration');
  }
  
  if (/\bavailable\s+(for\s+)?(work|job)/i.test(lower)) {
    seekingScore += 3;
    indicators.push('Availability for work');
  }
  
  if (/\b(i|me|mi)\s+(can|do|know\s+how\s+to)\s+\w+/i.test(lower)) {
    seekingScore += 2;
    indicators.push('Skill offering');
  }

  // HIRING patterns (job_posting)
  // Key: "I need a promo to..." or "I need someone to..."
  if (/\b(i|me|mi)\s+(need|want)\s+(a|an|some)?\s*(promo|someone|somebody)\s+(to|for|who\s+can)/i.test(lower)) {
    hiringScore += 4;
    indicators.push('Need someone for task (promo=someone)');
  }
  
  if (/\bneed\s+(a|an|some|someone|somebody|promo)\s+(to|for|who\s+can)/i.test(lower)) {
    hiringScore += 3;
    indicators.push('Hiring need expressed');
  }
  
  if (/\blooking\s+for\s+(a|an|some|someone|somebody|promo)\s+(to|for|who\s+can)/i.test(lower)) {
    hiringScore += 3;
    indicators.push('Looking to hire');
  }

  // Possessive patterns indicate hiring
  if (/\b(fix|paint|clean|repair|wash|cut|trim)\s+(my|mi|our)\s+\w+/i.test(lower)) {
    hiringScore += 3;
    indicators.push('Personal task needing worker');
  }

  // Rate/pricing patterns indicate work seeking
  if (/\b(my|mi)\s+(rate|charge|price|fee)/i.test(lower)) {
    seekingScore += 2;
    indicators.push('Worker pricing mention');
  }

  // Location context
  if (/\b(come\s+to|at\s+my|in\s+my|to\s+my)\s+\w+/i.test(lower)) {
    hiringScore += 1;
    indicators.push('Employer location');
  }

  // Determine final category
  const category = seekingScore > hiringScore ? 'find_work' : 'hire_workers';
  const scoreDiff = Math.abs(seekingScore - hiringScore);
  const confidence = scoreDiff >= 2 ? 0.9 : scoreDiff >= 1 ? 0.7 : 0.6;

  console.log(`Categorization: seeking=${seekingScore}, hiring=${hiringScore} -> ${category} (${confidence})`);

  return { category, confidence, indicators };
}

// Helper: Simple similarity calculation
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const editDistance = [...shorter].reduce((prev, char, i) => longer[i] === char ? prev : prev + 1, 0);
  return (longer.length - editDistance) / longer.length;
}