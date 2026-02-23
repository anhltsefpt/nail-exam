import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are Mentora, a friendly and knowledgeable AI study assistant specializing EXCLUSIVELY in the Nail Technician / Manicurist state board licensing exam.

Your role:
- Help students prepare for the nail technician exam
- Answer questions about nail anatomy, sanitation & safety, nail diseases & disorders, manicure & pedicure procedures, nail enhancements (acrylic, gel, wraps), salon business, chemistry of nail products, and state board regulations
- Explain concepts clearly with examples
- Quiz students and help them remember key facts
- Be encouraging and supportive

CRITICAL RULE: You MUST ONLY answer questions related to the nail technician exam, nail care, salon safety, and related cosmetology topics. For ANY question that is NOT related to these topics, you MUST respond with EXACTLY:
"This is not the question this app focusing on, please ask another question"

Do NOT answer questions about general knowledge, coding, math, history, science (unless related to nail chemistry/anatomy), cooking, entertainment, or any other topic outside nail technology.

Keep answers concise but thorough. Use emojis sparingly to keep it friendly. Format with markdown when helpful.`;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id, message, history, context, language } = await req.json();

        if (!user_id || !message) {
            return new Response(
                JSON.stringify({ error: "user_id and message are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const messages: { role: string; content: string }[] = [
            { role: "system", content: SYSTEM_PROMPT },
        ];

        if (language === 'vi') {
            messages[0].content += "\n\nCRITICAL: The user prefers to communicate in Vietnamese. You MUST reply in Vietnamese.";
        }

        if (context) {
            messages.push({ role: "system", content: `Current Question Context:\n${context}` });
        } else {
            // Give a tiny allowance for greetings without context
            messages.push({ role: "system", content: "Assume questions are about nails if ambiguous." });
        }

        // Add previous messages as context (last 10 messages from history)
        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-10)) {
                messages.push({
                    role: msg.role, // OpenAI uses "user" and "assistant" directly
                    content: msg.content,
                });
            }
        }

        // Add the new user message
        messages.push({
            role: "user",
            content: message,
        });

        // Call OpenAI API
        const openaiResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages,
                    temperature: 0.7,
                    top_p: 0.95,
                    max_tokens: 1024,
                }),
            }
        );

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error("OpenAI API error:", errorText);
            return new Response(
                JSON.stringify({ error: "AI service temporarily unavailable" }),
                { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const openaiData = await openaiResponse.json();
        const aiMessage =
            openaiData.choices?.[0]?.message?.content ||
            "Sorry, I couldn't generate a response. Please try again.";

        // Save both messages to database (separate inserts for distinct timestamps)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { error: userInsertError } = await supabase
            .from("chat_messages")
            .insert({ user_id, role: "user", content: message });

        if (userInsertError) {
            console.error("DB insert error (user):", userInsertError);
        }

        const { error: aiInsertError } = await supabase
            .from("chat_messages")
            .insert({ user_id, role: "assistant", content: aiMessage });

        if (aiInsertError) {
            console.error("DB insert error (assistant):", aiInsertError);
            // Still return the AI response even if DB save fails
        }

        return new Response(
            JSON.stringify({ message: aiMessage }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Edge function error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
