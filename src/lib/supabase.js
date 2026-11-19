
export const SB_URL="https://wxfjbomtpohnnqymskhd.supabase.co";

export const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4Zmpib210cG9obm5xeW1za2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTc4OTQsImV4cCI6MjA5NjQzMzg5NH0.C3tl5MD_qaIVpJNs4-OT2eVFKNOlzfMXetHry_a7uAA";

export const sbH={apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"};

export async function sbGet(t){try{const r=await fetch(`${SB_URL}/rest/v1/${t}?select=*`,{headers:sbH});return r.ok?r.json():[];}catch{return[];}}

export async function sbUpsert(t,d){try{await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:{...sbH,Prefer:"resolution=merge-duplicates"},body:JSON.stringify(Array.isArray(d)?d:[d])});}catch(e){console.error(e);}}

export async function sbDel(t,id){try{await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`,{method:"DELETE",headers:sbH});}catch(e){console.error(e);}}
