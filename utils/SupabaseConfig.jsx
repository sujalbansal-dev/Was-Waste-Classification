import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://cyxaoammueimtkzvavfb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eGFvYW1tdWVpbXRrenZhdmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2Njg1NzAsImV4cCI6MjA0NzI0NDU3MH0.NPOBpN1eWZV8NCST0TZlKJKWitzJJ4oPwTcUuIE2bs4"
);
//modify upr project URL AND Project APi keys under project settings

//check implementation in index.jsx
