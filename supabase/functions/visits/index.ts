import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      // Use raw SQL for atomic increment
      const { data, error } = await supabase.rpc("increment_visits");

      let finalCount = 0;

      if (error) {
        // Fallback: manual read-increment-write
        const { data: current } = await supabase
          .from("site_visits")
          .select("count")
          .eq("id", 1)
          .single();

        const newCount = (current?.count || 0) + 1;

        const { error: updateError } = await supabase
          .from("site_visits")
          .update({ count: newCount })
          .eq("id", 1);

        finalCount = updateError ? (current?.count || 0) : newCount;
      } else {
        finalCount = data;
      }

      return new Response(
        JSON.stringify({ count: finalCount }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET - return current count
    const { data, error } = await supabase
      .from("site_visits")
      .select("count")
      .eq("id", 1)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ count: 0, error: error.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ count: data?.count || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ count: 0, error: message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
