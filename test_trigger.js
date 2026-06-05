import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: prods } = await supabase.from('products').select('*').limit(1);
  const p = prods[0];
  console.log("Original description:", p.description);
  
  const { error: updErr, data: result } = await supabase.from('products').update({ description: p.description + ' test' }).eq('id', p.id).select();
  if (updErr) console.error("Update Error:", updErr);
  else console.log("Update success! Returned rows:", result.length);
}
test();
