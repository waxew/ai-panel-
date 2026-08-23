import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
function json(data:unknown,status=200){return Response.json(data,{status,headers:corsHeaders})}

const authenticated=withSupabase({auth:"user"},async(request,ctx)=>{
  const userId=ctx.userClaims?.id;
  if(!userId)return json({ok:false,message:"ورود به حساب الزامی است."},401);
  const admin=ctx.supabaseAdmin;

  if(request.method==="POST"){
    let body:{displayName?:unknown;phone?:unknown};
    try{body=await request.json()}catch{return json({ok:false,message:"درخواست معتبر نیست."},400)}
    const displayName=typeof body.displayName==="string"?body.displayName.trim():"";
    const phone=typeof body.phone==="string"?body.phone.trim():"";
    if(displayName.length>120)return json({ok:false,message:"نام نمایشی بیش از حد طولانی است."},400);
    if(phone.length>40)return json({ok:false,message:"شماره تماس معتبر نیست."},400);
    const {error}=await admin.from("User").update({displayName:displayName||null,phone:phone||null}).eq("id",userId);
    if(error){console.error(error);return json({ok:false,message:"ذخیره مشخصات حساب انجام نشد."},500)}
  }else if(request.method!=="GET"){
    return json({ok:false,message:"Method not allowed"},405);
  }

  const [{data:user,error:userError},{data:wallet,error:walletError},{data:transactions,error:txError}]=await Promise.all([
    admin.from("User").select("id,email,displayName,phone,role,createdAt,updatedAt").eq("id",userId).single(),
    admin.from("UserWallet").select("userId,balance,currency,createdAt,updatedAt").eq("userId",userId).maybeSingle(),
    admin.from("WalletTransaction").select("id,type,amount,balanceAfter,description,reference,createdAt").eq("userId",userId).order("createdAt",{ascending:false}).limit(30)
  ]);
  if(userError||!user||walletError||txError){console.error(userError,walletError,txError);return json({ok:false,message:"اطلاعات حساب کاربری در دسترس نیست."},500)}
  let resolvedWallet=wallet;
  if(!resolvedWallet){
    const {data,error}=await admin.from("UserWallet").insert({userId}).select("userId,balance,currency,createdAt,updatedAt").single();
    if(error){console.error(error);return json({ok:false,message:"کیف پول حساب ساخته نشد."},500)}
    resolvedWallet=data;
  }
  return json({ok:true,user,wallet:resolvedWallet,transactions:transactions??[]});
});
export default{async fetch(request:Request){
  if(request.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  const r=await authenticated(request);
  const h=new Headers(r.headers);Object.entries(corsHeaders).forEach(([k,v])=>h.set(k,v));
  return new Response(r.body,{status:r.status,headers:h});
}};
