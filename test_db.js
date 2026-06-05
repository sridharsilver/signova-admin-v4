import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdemraprfvdlbagemwfs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZW1yYXByZnZkbGJhZ2Vtd2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTU0NDksImV4cCI6MjA5MzU3MTQ0OX0.6Bz71cKjbVOisO1dlUlUn_URAxkg5YgJtJHIeHsxmwU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('admin_users').select('*');
  console.log(JSON.stringify(data, null, 2));
}
check();
