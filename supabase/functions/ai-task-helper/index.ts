import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { action, tasks, taskDescription } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'prioritize') {
      systemPrompt = 'You are a productivity expert. Help users prioritize their tasks effectively. Provide clear, actionable advice.';
      userPrompt = `Here are my tasks: ${JSON.stringify(tasks)}. Please help me prioritize them and explain your reasoning. Keep your response concise and practical.`;
    } else if (action === 'assist') {
      systemPrompt = 'You are a helpful assistant that provides practical suggestions for completing tasks efficiently.';
      userPrompt = `I need help with this task: "${taskDescription}". Please provide specific, actionable suggestions on how to approach or complete this task.`;
    } else if (action === 'suggest') {
      systemPrompt = 'You are a productivity coach. Based on existing tasks, suggest related or complementary tasks that might be helpful.';
      userPrompt = `Based on these existing tasks: ${JSON.stringify(tasks)}, suggest 3-5 additional tasks that might be helpful or related. Focus on practical, actionable items.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-task-helper function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});