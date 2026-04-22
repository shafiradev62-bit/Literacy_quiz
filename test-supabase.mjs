import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yoxcmbpgdlkrqhzngihb.supabase.co";
const SUPABASE_KEY = "sb_publishable_xfAkt2PvuM4_595ivnbsZQ_2G-BOdic";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log("Testing student_profiles insert...");
  const { data, error } = await supabase
    .from('student_profiles')
    .insert({
      device_id: 'test_node_device',
      name: 'NodeJS Test',
      class: 'Test Class',
      school: 'Test School'
    })
    .select();
    
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Inserted:", data);
  }
}

test();
