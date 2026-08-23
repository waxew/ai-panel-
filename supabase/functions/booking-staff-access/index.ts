import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{...cors,"Cache-Control":"no-store"}});
const defaults={booking:true,customers:false,finance:false,reports:false,services:false,staff:false,settings:false,automations:false};

async function membership(admin:any,userId:string){const{data,error}=await admin.from("WorkspaceMember").select("workspaceId,role").eq("userId",userId).limit(1);if(error)throw error;return data?.[0] as {workspaceId:string;role:string}|undefined;}
async function dashboard(admin:any,workspaceId:string){
  const [staff,access]=await Promise.all([
    admin.from("BookingStaff").select("id,name,roleTitle,email,phone,color,isActive").eq("workspaceId",workspaceId).order("createdAt",{ascending:true}),
    admin.from("BookingStaffAccess").select("staffId,userId,isEnabled,appointmentScope,permissions,updatedAt").eq("workspaceId",workspaceId),
  ]);if(staff.error)throw staff.error;if(access.error)throw access.error;
  const userIds=(access.data??[]).map((x:any)=>x.userId).filter(Boolean);
  let users:any[]=[];if(userIds.length){const{data,error}=await admin.from("User").select("id,email,displayName").in("id",userIds);if(error)throw error;users=data??[];}
  return{ok:true,staff:(staff.data??[]).map((s:any)=>{const a=(access.data??[]).find((x:any)=>x.staffId===s.id);const u=users.find((x:any)=>x.id===a?.userId);return{...s,access:{userId:a?.userId??null,linkedEmail:u?.email??null,linkedName:u?.displayName??null,isEnabled:a?.isEnabled??false,appointmentScope:a?.appointmentScope??'OWN',permissions:{...defaults,...(a?.permissions??{})},updatedAt:a?.updatedAt??null}}})};
}

const handler=withSupabase({auth:"user"},async(req,ctx)=>{
  const userId=ctx.userClaims?.id;if(!userId)return json({ok:false,message:"ورود به حساب الزامی است."},401);
  const admin=ctx.supabaseAdmin;const member=await membership(admin,userId);if(!member)return json({ok:false,message:"فضای کاری پیدا نشد."},404);
  const isAdmin=member.role==='ADMIN'||member.role==='SUPER_ADMIN';
  if(req.method==='GET'){if(!isAdmin)return json({ok:false,message:"مدیریت دسترسی فقط برای مدیر Workspace مجاز است."},403);try{return json(await dashboard(admin,member.workspaceId));}catch(e){console.error(e);return json({ok:false,message:"اطلاعات دسترسی پرسنل در دسترس نیست."},500)}}
  if(req.method!=='POST')return json({ok:false,message:"Method not allowed"},405);
  if(!isAdmin)return json({ok:false,message:"تغییر دسترسی فقط برای مدیر Workspace مجاز است."},403);
  let body:any;try{body=await req.json()}catch{return json({ok:false,message:"درخواست معتبر نیست."},400)}
  try{
    const staffId=typeof body.staffId==='string'?body.staffId:'';const{data:staff,error:se}=await admin.from("BookingStaff").select("id,email").eq("id",staffId).eq("workspaceId",member.workspaceId).maybeSingle();if(se)throw se;if(!staff)return json({ok:false,message:"پرسنل پیدا نشد."},404);
    if(body.action==='save_access'){
      const permissions={...defaults};for(const key of Object.keys(defaults)){(permissions as any)[key]=body.permissions?.[key]===true;}
      const appointmentScope=body.appointmentScope==='ALL'?'ALL':'OWN';
      const{error}=await admin.from("BookingStaffAccess").upsert({staffId,workspaceId:member.workspaceId,isEnabled:body.isEnabled===true,appointmentScope,permissions},{onConflict:"staffId"});if(error)throw error;return json(await dashboard(admin,member.workspaceId));
    }
    if(body.action==='link_existing_user'){
      const email=(typeof body.email==='string'?body.email:staff.email||'').trim().toLowerCase();if(!email||!email.includes('@'))return json({ok:false,message:"ایمیل معتبر وارد کنید."},400);
      const{data:user,error:ue}=await admin.from("User").select("id,email,displayName").eq("email",email).maybeSingle();if(ue)throw ue;if(!user)return json({ok:false,message:"کاربری با این ایمیل هنوز در AI Panel حساب ندارد."},404);
      const{data:wm,error:we}=await admin.from("WorkspaceMember").select("id").eq("workspaceId",member.workspaceId).eq("userId",user.id).maybeSingle();if(we)throw we;if(!wm)return json({ok:false,message:"این کاربر عضو Workspace نیست. افزودن عضو/دعوت را در مرحله بعد وصل می‌کنیم."},409);
      const{error}=await admin.from("BookingStaffAccess").upsert({staffId,workspaceId:member.workspaceId,userId:user.id},{onConflict:"staffId"});if(error)throw error;return json(await dashboard(admin,member.workspaceId));
    }
    if(body.action==='unlink_user'){
      const{error}=await admin.from("BookingStaffAccess").update({userId:null,isEnabled:false}).eq("staffId",staffId).eq("workspaceId",member.workspaceId);if(error)throw error;return json(await dashboard(admin,member.workspaceId));
    }
    return json({ok:false,message:"عملیات شناخته‌شده نیست."},400);
  }catch(e){console.error('booking-staff-access',e);return json({ok:false,message:"عملیات دسترسی پرسنل انجام نشد."},500)}
});
export default{async fetch(req:Request){if(req.method==='OPTIONS')return new Response('ok',{headers:cors});const res=await handler(req);const h=new Headers(res.headers);Object.entries(cors).forEach(([k,v])=>h.set(k,v));return new Response(res.body,{status:res.status,headers:h});}};
