import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) { return Response.json(data, { status, headers: corsHeaders }); }
function fromHex(hex: string) { if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("bad_key"); const b=new Uint8Array(hex.length/2); for(let i=0;i<b.length;i++) b[i]=parseInt(hex.slice(i*2,i*2+2),16); return b; }
function toBase64(bytes: Uint8Array) { let s=""; for(const b of bytes) s+=String.fromCharCode(b); return btoa(s); }
function toHex(bytes: Uint8Array) { return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join(""); }
async function sha256(v:string){ return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)))); }
async function encryptToken(token:string,keyHex:string){ const key=await crypto.subtle.importKey("raw",fromHex(keyHex),{name:"AES-GCM"},false,["encrypt"]); const iv=crypto.getRandomValues(new Uint8Array(12)); const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(token))); return `v1:${toBase64(iv)}:${toBase64(encrypted)}`; }
function randomSecret(){ const b=crypto.getRandomValues(new Uint8Array(32)); return Array.from(b,x=>x.toString(16).padStart(2,"0")).join(""); }
function validToken(token:string){ return token.length>=20 && token.length<=300 && !/\s/.test(token); }

async function rubikaCall(token:string,method:string,body:Record<string,unknown>={}){
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),12000);
  try { const r=await fetch(`https://botapi.rubika.ir/v3/${encodeURIComponent(token)}/${method}`,{method:"POST",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(body),signal:controller.signal}); const data=await r.json().catch(()=>({})); return {httpOk:r.ok,status:r.status,data}; }
  finally { clearTimeout(timeout); }
}
function unwrap(data:any){ return data?.data && typeof data.data==="object" ? data.data : data; }
function botIdentity(raw:any){ const x=unwrap(raw); const b=x?.bot && typeof x.bot==="object" ? x.bot : x; if(!b || typeof b!=="object") return null; const id=b.bot_id ?? b.id ?? b.object_guid ?? b.guid; const username=b.username ?? b.bot_username; const title=b.bot_title ?? b.title ?? b.first_name ?? b.name; if(!id && !username) return null; return { id:String(id ?? username), username:username?String(username):null, title:title?String(title):"Rubika Bot", description:b.description?String(b.description):null }; }
function apiRejected(result:any){ const status=String(result?.data?.status ?? result?.data?.status_det ?? "").toUpperCase(); return !result.httpOk || status==="ERROR" || status==="FAILED"; }

async function getWorkspace(admin:any,userId:string,email:string){
  const {error:userError}=await admin.from("User").upsert({id:userId,email},{onConflict:"id"}); if(userError) throw userError;
  const {data,error}=await admin.from("WorkspaceMember").select("workspaceId").eq("userId",userId).limit(1); if(error) throw error; if(data?.[0]?.workspaceId) return data[0].workspaceId as string;
  const workspaceId=`${userId}:workspace`; await admin.from("Workspace").upsert({id:workspaceId,name:"فضای کاری من"},{onConflict:"id"}); await admin.from("WorkspaceMember").upsert({id:`${userId}:member`,workspaceId,userId,role:"CUSTOMER"},{onConflict:"id"}); return workspaceId;
}
async function ensureDefaultButtons(admin:any,botId:string){
  const {count}=await admin.from("RubikaButton").select("id",{count:"exact",head:true}).eq("botId",botId); if((count??0)>0) return;
  const rows=[
    {title:"🛍 محصولات",actionType:"CATALOG",actionValue:"catalog",sortOrder:10},
    {title:"🛒 سبد خرید",actionType:"CART",actionValue:"cart",sortOrder:20},
    {title:"📦 سفارش‌های من",actionType:"ORDERS",actionValue:"orders",sortOrder:30},
    {title:"☎️ پشتیبانی",actionType:"SUPPORT",actionValue:"اطلاعات پشتیبانی هنوز تنظیم نشده است.",sortOrder:40},
  ].map(x=>({id:crypto.randomUUID(),botId,parentId:null,...x}));
  const {error}=await admin.from("RubikaButton").insert(rows); if(error) throw error;
}

const authenticated=withSupabase({auth:"user"},async(request,ctx)=>{
  if(request.method==="GET") return json({ok:true,service:"rubika-connect",version:1});
  if(request.method!=="POST") return json({ok:false,message:"Method not allowed"},405);
  const userId=ctx.userClaims?.id, email=ctx.userClaims?.email; if(!userId||!email) return json({ok:false,message:"حساب کاربری معتبر نیست."},401);
  let body:any; try{body=await request.json()}catch{return json({ok:false,message:"درخواست معتبر نیست."},400)}
  const token=typeof body.token==="string"?body.token.trim():""; if(!validToken(token)) return json({ok:false,message:"فرمت توکن روبیکا معتبر نیست."},400);
  let me:any; try{me=await rubikaCall(token,"getMe")}catch{return json({ok:false,message:"ارتباط با Rubika Bot API برقرار نشد."},502)}
  const identity=botIdentity(me.data); if(apiRejected(me)||!identity) return json({ok:false,message:"روبیکا این توکن را تأیید نکرد. توکن BotFather را بررسی کنید."},401);
  const admin=ctx.supabaseAdmin; let workspaceId:string; try{workspaceId=await getWorkspace(admin,userId,email)}catch(e){console.error(e);return json({ok:false,message:"Workspace آماده نشد."},500)}
  const {data:existing}=await admin.from("RubikaBot").select("id,workspaceId").eq("rubikaBotId",identity.id).maybeSingle(); if(existing && existing.workspaceId!==workspaceId) return json({ok:false,message:"این ربات قبلاً به حساب دیگری متصل شده است."},409);
  const {data:secret}=await admin.from("AppSecret").select("value").eq("id","rubika_token_encryption").single(); if(!secret?.value) return json({ok:false,message:"کلید رمزنگاری روبیکا در دسترس نیست."},500);
  const tokenCiphertext=await encryptToken(token,secret.value); const webhookSecret=randomSecret(); const webhookSecretHash=await sha256(webhookSecret);
  const {data:bot,error:saveError}=await admin.from("RubikaBot").upsert({workspaceId,rubikaBotId:identity.id,username:identity.username,displayName:identity.title,description:identity.description,tokenCiphertext,webhookSecretHash,status:"ACTIVE"},{onConflict:"rubikaBotId"}).select("id,rubikaBotId,username,displayName,description,status,welcomeMessage").single();
  if(saveError||!bot){console.error(saveError);return json({ok:false,message:"ذخیره ربات روبیکا انجام نشد."},500)}
  try{await ensureDefaultButtons(admin,bot.id)}catch(e){console.error("rubika defaults",e)}
  const webhookUrl=`https://spncmjuvnvfkrahjnyjm.supabase.co/functions/v1/rubika-webhook/${encodeURIComponent(identity.id)}/${webhookSecret}`;
  let endpoint:any; try{endpoint=await rubikaCall(token,"updateBotEndpoints",{url:webhookUrl,type:"ReceiveUpdate"})}catch(e){console.error(e);return json({ok:false,message:"ربات ذخیره شد اما Webhook روبیکا فعال نشد."},502)}
  if(apiRejected(endpoint)){console.error("rubika endpoint rejected",endpoint.data);return json({ok:false,message:"روبیکا تنظیم Webhook را نپذیرفت."},502)}
  try{await rubikaCall(token,"setCommands",{bot_commands:[{command:"start",description:"شروع ربات"},{command:"products",description:"مشاهده محصولات"},{command:"orders",description:"سفارش‌های من"}]})}catch{}
  return json({ok:true,status:"connected",webhookConfigured:true,bot:{id:bot.id,rubikaBotId:bot.rubikaBotId,username:bot.username??undefined,displayName:bot.displayName??undefined,description:bot.description??undefined,status:bot.status}});
});

export default {async fetch(request:Request){ if(request.method==="OPTIONS") return new Response("ok",{headers:corsHeaders}); const response=await authenticated(request); const headers=new Headers(response.headers); Object.entries(corsHeaders).forEach(([k,v])=>headers.set(k,v)); return new Response(response.body,{status:response.status,headers}); }};
