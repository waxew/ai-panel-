import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{...cors,"Cache-Control":"no-store"}});
async function membership(admin:any,userId:string){const{data,error}=await admin.from("WorkspaceMember").select("workspaceId,role").eq("userId",userId).limit(1);if(error)throw error;return data?.[0] as {workspaceId:string;role:string}|undefined;}
async function staffAccess(admin:any,workspaceId:string,userId:string){const{data,error}=await admin.from("BookingStaffAccess").select("staffId,isEnabled,appointmentScope,permissions").eq("workspaceId",workspaceId).eq("userId",userId).maybeSingle();if(error)throw error;return data;}
async function snapshot(admin:any,workspaceId:string,staffFilter?:string){
  const appointmentsQuery=admin.from("BookingAppointment").select("id,customerId,serviceId,staffId,startsAt,status,amount,paidAmount,currency,BookingCustomer(fullName,phone),BookingService(title),BookingStaff(name)").eq("workspaceId",workspaceId).order("startsAt",{ascending:false}).limit(1000);if(staffFilter)appointmentsQuery.eq("staffId",staffFilter);
  const [payments,expenses,appointments,services,staff]=await Promise.all([
    admin.from("BookingPayment").select("id,appointmentId,customerId,type,method,amount,currency,reference,note,status,paidAt,createdAt,BookingCustomer(fullName,phone),BookingAppointment(startsAt,staffId,amount,paidAmount,BookingService(title),BookingStaff(name))").eq("workspaceId",workspaceId).order("paidAt",{ascending:false}).limit(500),
    admin.from("BookingExpense").select("id,category,amount,currency,vendor,note,status,occurredAt,createdAt").eq("workspaceId",workspaceId).order("occurredAt",{ascending:false}).limit(500),
    appointmentsQuery,
    admin.from("BookingService").select("id,title,color").eq("workspaceId",workspaceId),
    admin.from("BookingStaff").select("id,name,color").eq("workspaceId",workspaceId),
  ]);
  const error=[payments.error,expenses.error,appointments.error,services.error,staff.error].find(Boolean);if(error)throw error;
  const aps=appointments.data??[];const allowedIds=new Set(aps.map((a:any)=>a.id));
  const ps=(payments.data??[]).filter((p:any)=>!staffFilter||allowedIds.has(p.appointmentId));
  const es=staffFilter?[]:(expenses.data??[]);
  const postedPayments=ps.filter((p:any)=>p.status==='POSTED');
  const income=postedPayments.reduce((s:number,p:any)=>s+(p.type==='PAYMENT'?Number(p.amount):-Number(p.amount)),0);
  const expense=es.filter((e:any)=>e.status==='POSTED').reduce((s:number,e:any)=>s+Number(e.amount),0);
  const receivable=aps.filter((a:any)=>a.status!=='CANCELLED').reduce((s:number,a:any)=>s+Math.max(0,Number(a.amount)-Number(a.paidAmount)),0);
  const now=new Date();const monthStart=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));
  const monthIncome=postedPayments.filter((p:any)=>new Date(p.paidAt)>=monthStart).reduce((s:number,p:any)=>s+(p.type==='PAYMENT'?Number(p.amount):-Number(p.amount)),0);
  const monthExpense=es.filter((e:any)=>e.status==='POSTED'&&new Date(e.occurredAt)>=monthStart).reduce((s:number,e:any)=>s+Number(e.amount),0);
  const byService=(services.data??[]).map((sv:any)=>{const rows=aps.filter((a:any)=>a.serviceId===sv.id);return{id:sv.id,title:sv.title,color:sv.color,count:rows.length,revenue:rows.reduce((s:number,a:any)=>s+Number(a.paidAmount||0),0)};}).sort((a:any,b:any)=>b.revenue-a.revenue);
  const byStaff=(staff.data??[]).filter((st:any)=>!staffFilter||st.id===staffFilter).map((st:any)=>{const rows=aps.filter((a:any)=>a.staffId===st.id);return{id:st.id,name:st.name,color:st.color,count:rows.length,revenue:rows.reduce((s:number,a:any)=>s+Number(a.paidAmount||0),0)};}).sort((a:any,b:any)=>b.revenue-a.revenue);
  return{ok:true,summary:{income,expense,net:income-expense,receivable,monthIncome,monthExpense,monthNet:monthIncome-monthExpense},payments:ps,expenses:es,appointments:aps,byService,byStaff};
}
const handler=withSupabase({auth:"user"},async(req,ctx)=>{
  const userId=ctx.userClaims?.id;if(!userId)return json({ok:false,message:"ورود به حساب الزامی است."},401);const admin=ctx.supabaseAdmin;const member=await membership(admin,userId);if(!member)return json({ok:false,message:"فضای کاری پیدا نشد."},404);
  const isAdmin=member.role==='ADMIN'||member.role==='SUPER_ADMIN';let access:any=null;if(!isAdmin){access=await staffAccess(admin,member.workspaceId,userId);if(!access?.isEnabled)return json({ok:false,message:"دسترسی پرسنلی شما غیرفعال است."},403);}
  const mode=new URL(req.url).searchParams.get('mode')==='reports'?'reports':'finance';
  if(req.method==='GET'){
    const permitted=isAdmin||(mode==='reports'?access?.permissions?.reports===true:access?.permissions?.finance===true);if(!permitted)return json({ok:false,message:"برای مشاهده این بخش دسترسی ندارید."},403);
    try{return json(await snapshot(admin,member.workspaceId,!isAdmin&&access.appointmentScope==='OWN'?access.staffId:undefined));}catch(e){console.error(e);return json({ok:false,message:"گزارش مالی در دسترس نیست."},500)}
  }
  if(req.method!=='POST')return json({ok:false,message:"Method not allowed"},405);if(!isAdmin&&access?.permissions?.finance!==true)return json({ok:false,message:"مجوز عملیات مالی ندارید."},403);
  let body:any;try{body=await req.json()}catch{return json({ok:false,message:"درخواست معتبر نیست."},400)}
  try{
    if(body.action==='add_payment'){
      const appointmentId=typeof body.appointmentId==='string'?body.appointmentId:'';const amount=Number(body.amount);const method=['CASH','CARD','POS','TRANSFER','OTHER'].includes(body.method)?body.method:'CASH';if(!appointmentId||!Number.isSafeInteger(amount)||amount<=0)return json({ok:false,message:"مبلغ یا نوبت معتبر نیست."},400);
      let q=admin.from("BookingAppointment").select("id,workspaceId,staffId,amount,paidAmount").eq("id",appointmentId).eq("workspaceId",member.workspaceId);if(!isAdmin&&access.appointmentScope==='OWN')q=q.eq("staffId",access.staffId);const{data:appt,error:ae}=await q.maybeSingle();if(ae)throw ae;if(!appt)return json({ok:false,message:"نوبت پیدا نشد یا خارج از محدوده دسترسی است."},404);const remaining=Math.max(0,Number(appt.amount)-Number(appt.paidAmount));if(amount>remaining)return json({ok:false,message:"مبلغ پرداخت از مانده نوبت بیشتر است."},400);
      const{error}=await admin.from("BookingPayment").insert({workspaceId:member.workspaceId,appointmentId,customerId:'',amount,method,type:'PAYMENT',reference:typeof body.reference==='string'?body.reference.trim().slice(0,120)||null:null,note:typeof body.note==='string'?body.note.trim().slice(0,500)||null:null,paidAt:body.paidAt?new Date(body.paidAt).toISOString():new Date().toISOString(),createdByUserId:userId});if(error)throw error;return json(await snapshot(admin,member.workspaceId,!isAdmin&&access.appointmentScope==='OWN'?access.staffId:undefined),201);
    }
    if(body.action==='add_refund'){
      const appointmentId=typeof body.appointmentId==='string'?body.appointmentId:'';const amount=Number(body.amount);if(!appointmentId||!Number.isSafeInteger(amount)||amount<=0)return json({ok:false,message:"اطلاعات بازپرداخت معتبر نیست."},400);let q=admin.from("BookingAppointment").select("id,staffId,paidAmount").eq("id",appointmentId).eq("workspaceId",member.workspaceId);if(!isAdmin&&access.appointmentScope==='OWN')q=q.eq("staffId",access.staffId);const{data:appt}=await q.maybeSingle();if(!appt)return json({ok:false,message:"نوبت پیدا نشد."},404);if(amount>Number(appt.paidAmount))return json({ok:false,message:"مبلغ بازپرداخت از مبلغ پرداخت‌شده بیشتر است."},400);const{error}=await admin.from("BookingPayment").insert({workspaceId:member.workspaceId,appointmentId,customerId:'',amount,type:'REFUND',method:'OTHER',note:typeof body.note==='string'?body.note.trim().slice(0,500)||null:null,createdByUserId:userId});if(error)throw error;return json(await snapshot(admin,member.workspaceId,!isAdmin&&access.appointmentScope==='OWN'?access.staffId:undefined),201);
    }
    if(body.action==='void_payment'){
      const id=typeof body.id==='string'?body.id:'';if(!id)return json({ok:false,message:"شناسه تراکنش معتبر نیست."},400);if(!isAdmin&&access.appointmentScope==='OWN'){const{data:p}=await admin.from("BookingPayment").select("id,BookingAppointment!inner(staffId)").eq("id",id).eq("workspaceId",member.workspaceId).eq("BookingAppointment.staffId",access.staffId).maybeSingle();if(!p)return json({ok:false,message:"تراکنش خارج از محدوده دسترسی است."},403);}const{error}=await admin.from("BookingPayment").update({status:'VOID'}).eq("id",id).eq("workspaceId",member.workspaceId).eq("status",'POSTED');if(error)throw error;return json(await snapshot(admin,member.workspaceId,!isAdmin&&access.appointmentScope==='OWN'?access.staffId:undefined));
    }
    if(body.action==='add_expense'||body.action==='void_expense'){if(!isAdmin)return json({ok:false,message:"ثبت و ابطال هزینه فقط برای مدیر مجاز است."},403);}
    if(body.action==='add_expense'){const amount=Number(body.amount);const category=typeof body.category==='string'?body.category.trim().slice(0,100):'';if(!category||!Number.isSafeInteger(amount)||amount<=0)return json({ok:false,message:"اطلاعات هزینه معتبر نیست."},400);const{error}=await admin.from("BookingExpense").insert({workspaceId:member.workspaceId,category,amount,vendor:typeof body.vendor==='string'?body.vendor.trim().slice(0,160)||null:null,note:typeof body.note==='string'?body.note.trim().slice(0,500)||null:null,occurredAt:body.occurredAt?new Date(body.occurredAt).toISOString():new Date().toISOString(),createdByUserId:userId});if(error)throw error;return json(await snapshot(admin,member.workspaceId),201);}
    if(body.action==='void_expense'){const id=typeof body.id==='string'?body.id:'';if(!id)return json({ok:false,message:"شناسه هزینه معتبر نیست."},400);const{error}=await admin.from("BookingExpense").update({status:'VOID',updatedAt:new Date().toISOString()}).eq("id",id).eq("workspaceId",member.workspaceId).eq("status",'POSTED');if(error)throw error;return json(await snapshot(admin,member.workspaceId));}
    return json({ok:false,message:"عملیات مالی شناخته‌شده نیست."},400);
  }catch(e){console.error('booking-finance',e);return json({ok:false,message:"عملیات مالی انجام نشد."},500)}
});
export default{async fetch(req:Request){if(req.method==='OPTIONS')return new Response('ok',{headers:cors});const res=await handler(req);const h=new Headers(res.headers);Object.entries(cors).forEach(([k,v])=>h.set(k,v));return new Response(res.body,{status:res.status,headers:h});}};
