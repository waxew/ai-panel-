/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور فایل/ماژول را از ماژول «jsr:@supabase/functions-js/edge-runtime.d.ts» وارد می‌کند تا در این فایل قابل استفاده باشد.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// راهنما: این دستور { withSupabase } را از ماژول «npm:@supabase/server@1.4.1» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { withSupabase } from "npm:@supabase/server@1.4.1";

// راهنما: این دستور متغیر/ثابت «corsHeaders» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data:unknown,status=200){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data,{status,headers:corsHeaders})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Response.json(data,{status,headers:corsHeaders})}

// راهنما: این دستور متغیر/ثابت «authenticated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const authenticated=withSupabase({auth:"user"},async(request,ctx)=>{
  // راهنما: این دستور متغیر/ثابت «userId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const userId=ctx.userClaims?.id;
  // راهنما: این شرط بررسی می‌کند آیا «!userId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(!userId)/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"ورود به حساب الزامی است."},401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"ورود به حساب الزامی است."},401);
  // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const admin=ctx.supabaseAdmin;

  // راهنما: این شرط بررسی می‌کند آیا «request.method==="POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(request.method==="POST"){
    // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let body:{displayName?:unknown;phone?:unknown};
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try{/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body=await request.json()». */ body=await request.json()}catch{/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"درخواست معتبر نیست."},400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"درخواست معتبر نیست."},400)}
    // راهنما: این دستور متغیر/ثابت «displayName» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const displayName=typeof body.displayName==="string"?body.displayName.trim():"";
    // راهنما: این دستور متغیر/ثابت «phone» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const phone=typeof body.phone==="string"?body.phone.trim():"";
    // راهنما: این شرط بررسی می‌کند آیا «displayName.length>120» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(displayName.length>120)/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"نام نمایشی بیش از حد طولانی است."},400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"نام نمایشی بیش از حد طولانی است."},400);
    // راهنما: این شرط بررسی می‌کند آیا «phone.length>40» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(phone.length>40)/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"شماره تماس معتبر نیست."},400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"شماره تماس معتبر نیست."},400);
    // راهنما: این دستور متغیر/ثابت «{error}» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const {error}=await admin.from("User").update({displayName:displayName||null,phone:phone||null}).eq("id",userId);
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(error){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error);/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"ذخیره مشخصات حساب انجام نشد."},500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"ذخیره مشخصات حساب انجام نشد."},500)}
  }else /* راهنما: این شرط بررسی می‌کند آیا «request.method!=="GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(request.method!=="GET"){
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"Method not allowed"},405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ok:false,message:"Method not allowed"},405);
  }

  // راهنما: این دستور متغیر/ثابت «[{data:user,error:userError},{data:wallet,er…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [{data:user,error:userError},{data:wallet,error:walletError},{data:transactions,error:txError}]=await Promise.all([
    admin.from("User").select("id,email,displayName,phone,role,createdAt,updatedAt").eq("id",userId).single(),
    admin.from("UserWallet").select("userId,balance,currency,createdAt,updatedAt").eq("userId",userId).maybeSingle(),
    admin.from("WalletTransaction").select("id,type,amount,balanceAfter,description,reference,createdAt").eq("userId",userId).order("createdAt",{ascending:false}).limit(30)
  ]);
  // راهنما: این شرط بررسی می‌کند آیا «userError||!user||walletError||txError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(userError||!user||walletError||txError){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(userError,walletError,txError)». */ console.error(userError,walletError,txError);/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"اطلاعات حساب کاربری در دسترس نیست."},500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"اطلاعات حساب کاربری در دسترس نیست."},500)}
  // راهنما: این دستور متغیر/ثابت «resolvedWallet» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let resolvedWallet=wallet;
  // راهنما: این شرط بررسی می‌کند آیا «!resolvedWallet» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(!resolvedWallet){
    // راهنما: این دستور متغیر/ثابت «{data,error}» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const {data,error}=await admin.from("UserWallet").insert({userId}).select("userId,balance,currency,createdAt,updatedAt").single();
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(error){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error);/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"کیف پول حساب ساخته نشد."},500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"کیف پول حساب ساخته نشد."},500)}
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «resolvedWallet=data».
    resolvedWallet=data;
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:true,user,wallet:resolvedWallet,transactions:transactions??[]})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({ok:true,user,wallet:resolvedWallet,transactions:transactions??[]});
});
// راهنما: این دستور از نوع ExportAssignment بخشی از کنترل جریان یا تعریف منطق این فایل است.
export default{async fetch(request:Request){
  // راهنما: این شرط بررسی می‌کند آیا «request.method==="OPTIONS"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(request.method==="OPTIONS")/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok",{headers:corsHeaders})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok",{headers:corsHeaders});
  // راهنما: این دستور متغیر/ثابت «r» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const r=await authenticated(request);
  // راهنما: این دستور متغیر/ثابت «h» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const h=new Headers(r.headers);/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Object.entries(corsHeaders).forEach(([k,v])=>h.set(k,v))». */ Object.entries(corsHeaders).forEach(([k,v])=>h.set(k,v));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response(r.body,{status:r.status,headers:h})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return new Response(r.body,{status:r.status,headers:h});
}};
