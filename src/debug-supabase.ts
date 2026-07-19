// Supabase Integration Debug Script
// Run this in browser console or add to your app temporarily

import { supabase } from "./src/integrations/supabase/client";
import { getDeviceId } from "./src/hooks/useExamSession";

console.log("🔍 ===== SUPABASE DEBUG =====\n");

// 1. Check environment variables
console.log("1️⃣ Environment Variables:");
console.log("   URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("   Key:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + "...");
console.log("   Anon Key:", import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + "...");
console.log("");

// 2. Test connection
async function testConnection() {
  console.log("2️⃣ Testing Connection...");
  
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("count")
      .limit(1);
    
    if (error) {
      console.error("   ❌ Error:", error);
      console.log("   Message:", error.message);
      console.log("   Code:", error.code);
      console.log("   Hint:", error.hint);
    } else {
      console.log("   ✅ Connection successful!");
    }
  } catch (err) {
    console.error("   ❌ Exception:", err);
  }
  console.log("");
}

// 3. Test insert student
async function testInsertStudent() {
  console.log("3️⃣ Testing Student Insert...");
  
  const deviceId = getDeviceId();
  const testStudent = {
    device_id: deviceId,
    name: "Debug Test",
    class: "12A",
    school: "Test School",
    email: "debug@test.com",
    contact: "08123456789"
  };
  
  console.log("   Data to insert:", testStudent);
  
  const { data, error } = await supabase
    .from("student_profiles")
    .insert(testStudent)
    .select()
    .single();
  
  if (error) {
    console.error("   ❌ Insert failed:", error);
    console.log("   Message:", error.message);
    console.log("   Code:", error.code);
    console.log("   Details:", error.details);
    console.log("   Hint:", error.hint);
  } else {
    console.log("   ✅ Insert successful! ID:", data.id);
    
    // Clean up
    await supabase.from("student_profiles").delete().eq("id", data.id);
    console.log("   🗑️  Test data cleaned up");
  }
  console.log("");
}

// 4. Test insert exam session
async function testInsertSession() {
  console.log("4️⃣ Testing Exam Session Insert...");
  
  const deviceId = getDeviceId();
  const testSession = {
    device_id: deviceId,
    unit: 1,
    answers: { q1: "A", q2: "B" },
    score: 0,
    total: 5,
    completed: false
  };
  
  console.log("   Data to insert:", testSession);
  
  const { data, error } = await supabase
    .from("exam_sessions")
    .insert(testSession)
    .select()
    .single();
  
  if (error) {
    console.error("   ❌ Insert failed:", error);
    console.log("   Message:", error.message);
    console.log("   Code:", error.code);
    console.log("   Details:", error.details);
    console.log("   Hint:", error.hint);
  } else {
    console.log("   ✅ Insert successful! ID:", data.id);
    
    // Clean up
    await supabase.from("exam_sessions").delete().eq("id", data.id);
    console.log("   🗑️  Test data cleaned up");
  }
  console.log("");
}

// 5. Query existing data
async function queryData() {
  console.log("5️⃣ Querying Existing Data...");
  
  const { data: students, error: studentErr } = await supabase
    .from("student_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  
  const { data: sessions, error: sessionErr } = await supabase
    .from("exam_sessions")
    .select("*, student_profiles(name, email)")
    .order("started_at", { ascending: false })
    .limit(5);
  
  if (studentErr) {
    console.error("   ❌ Student query error:", studentErr);
  } else {
    console.log(`   ✅ Found ${students?.length || 0} students`);
    if (students?.length > 0) {
      console.log("   Recent students:", students);
    }
  }
  
  if (sessionErr) {
    console.error("   ❌ Session query error:", sessionErr);
  } else {
    console.log(`   ✅ Found ${sessions?.length || 0} sessions`);
    if (sessions?.length > 0) {
      console.log("   Recent sessions:", sessions);
    }
  }
  console.log("");
}

// Run all tests
async function runAllTests() {
  await testConnection();
  await testInsertStudent();
  await testInsertSession();
  await queryData();
  
  console.log("🏁 ===== DEBUG COMPLETE =====");
  console.log("\n💡 If tests fail, check:");
  console.log("   1. Are Supabase keys correct in .env?");
  console.log("   2. Did you run the SQL migration in Supabase?");
  console.log("   3. Check Supabase dashboard: https://yoxcmbpgdlkrqhzngihb.supabase.co");
  console.log("   4. Check browser console for detailed errors");
}

// Export for manual running
export { testConnection, testInsertStudent, testInsertSession, queryData, runAllTests };

// Auto-run
runAllTests();
