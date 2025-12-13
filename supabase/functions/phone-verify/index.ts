import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action') // 'send' or 'verify'

  try {
    const body = await req.json()
    const { phoneNumber, code } = body

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioVerifyServiceSid = Deno.env.get('TWILIO_VERIFY_SERVICE_SID')

    if (!twilioAccountSid || !twilioAuthToken || !twilioVerifyServiceSid) {
      throw new Error('Missing Twilio credentials')
    }

    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

    if (action === 'send') {
      // Send OTP
      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phoneNumber,
            Channel: 'sms'
          })
        }
      )

      const result = await response.json()

      if (response.ok) {
        return new Response(
          JSON.stringify({ message: 'Verification code sent', status: result.status }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        throw new Error(result.message || 'Failed to send verification code')
      }

    } else if (action === 'verify') {
      // Verify OTP
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Verification code is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/VerificationCheck`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phoneNumber,
            Code: code
          })
        }
      )

      const result = await response.json()

      if (response.ok && result.status === 'approved') {
        return new Response(
          JSON.stringify({ message: 'Phone verified successfully', status: result.status }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid verification code' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use ?action=send or ?action=verify' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Phone verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})