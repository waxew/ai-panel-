import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
function json(data:unknown,status=200){return Response.json(data,{status,headers:{...corsHeaders,"Cache-Control":"no-store"}})}
async function context(admin:any,userId:string){const {data:member,error}=await admin.from("WorkspaceMember").select("workspaceId,role").eq("userId",userId).limit(1).maybeSingle();if(error)throw error;if(!member)return null;return member;}
async function snapshot(admin:any,workspaceId:string){
 const [settings,accounts,rewards,redemptions,campaigns,entries,customers,ledger]=await Promise.all([
  admin.from("BookingLoyaltySettings").select("*").eq("workspaceId",workspaceId).maybeSingle(),
  admin.from("BookingLoyaltyAccount").select("*").eq("workspaceId",workspaceId).order("pointsBalance",{ascending:false}).limit(250),
  admin.from("BookingLoyaltyReward").select("*").eq("workspaceId",workspaceId).order("createdAt",{ascending:false}),
  admin.from("BookingLoyaltyRedemption").select("*").eq("workspaceId",workspaceId).order("issuedAt",{ascending:false}).limit(200),
  admin.from("BookingLotteryCampaign").select("*").eq("workspaceId",workspaceId).order("createdAt",{ascending:false}),
  admin.from("BookingLotteryEntry").select("*").eq("workspaceId",workspaceId),
  admin.from("BookingCustomer").select("id,fullName,phone,isVip").eq("workspaceId",workspaceId).order("createdAt",{ascending:false}),
  admin.from("BookingLoyaltyLedger").select("id,customerId,type,deltaPoints,reason,createdAt").eq("workspaceId",workspaceId).order("createdAt",{ascending:false}).limit(200),
 ]);
 const err=[settings,accounts,rewards,redemptions,campaigns,entries,customers,ledger].map(x=>x.error).find(Boolean);if(err)throw err;
 return {ok:true,settings:settings.data,accounts:accounts.data??[],rewards:rewards.data??[],redemptions:redemptions.data??[],campaigns:campaigns.data??[],entries:entries.data??[],customers:customers.data??[],ledger:ledger.data??[]};
}
const handler=withSupabase({auth:"user"},async(request,ctx)=>{
 const userId=ctx.userClaims?.id;if(!userId)return json({ok:false,message:"ورود الزامی است."},401);const admin=ctx.supabaseAdmin;const member=await context(admin,userId);if(!member)return json({ok:false,message:"Workspace پیدا نشد."},404);const workspaceId=member.workspaceId;
 if(request.method==="GET")return json(await snapshot(admin,workspaceId));
 if(request.method!=="POST")return json({ok:false,message:"Method not allowed"},405);
 let body:any;try{body=await request.json()}catch{return json({ok:false,message:"درخواست نامعتبر است."},400)}const action=body?.action;
 try{
  if(action==="bootstrap"){
   await admin.from("BookingLoyaltySettings").upsert({workspaceId},{onConflict:"workspaceId"});
   for(const c of (await admin.from("BookingCustomer").select("id").eq("workspaceId",workspaceId)).data??[]){await admin.rpc("booking_loyalty_rebuild_entries",{p_workspace_id:workspaceId,p_campaign_id:"__noop__"}).catch(()=>undefined);await admin.from("BookingLoyaltyAccount").upsert({workspaceId,customerId:c.id},{onConflict:"workspaceId,customerId"});}
  }else if(action==="save_settings"){
   const spend=Math.max(1,Math.round(Number(body.spendUnitAmount||100000)));const ppu=Math.max(1,Math.round(Number(body.pointsPerUnit||1)));const s=Math.max(0,Math.round(Number(body.silverThreshold||0)));const g=Math.max(s,Math.round(Number(body.goldThreshold||s)));const v=Math.max(g,Math.round(Number(body.vipThreshold||g)));
   const {error}=await admin.from("BookingLoyaltySettings").upsert({workspaceId,enabled:body.enabled!==false,spendUnitAmount:spend,pointsPerUnit:ppu,silverThreshold:s,goldThreshold:g,vipThreshold:v,updatedAt:new Date().toISOString()},{onConflict:"workspaceId"});if(error)throw error;
  }else if(action==="adjust_points"){
   const customerId=String(body.customerId||"");const points=Math.trunc(Number(body.points||0));if(!customerId||!points)return json({ok:false,message:"مشتری و مقدار امتیاز الزامی است."},400);const {data:c}=await admin.from("BookingCustomer").select("id").eq("id",customerId).eq("workspaceId",workspaceId).maybeSingle();if(!c)return json({ok:false,message:"مشتری معتبر نیست."},400);const {error}=await admin.from("BookingLoyaltyLedger").insert({workspaceId,customerId,type:points>0?"BONUS":"ADJUST",deltaPoints:points,reason:String(body.reason||"اصلاح دستی امتیاز").slice(0,300),createdByUserId:userId});if(error)throw error;
  }else if(action==="create_reward"){
   const title=String(body.title||"").trim().slice(0,120);const pointsCost=Math.max(1,Math.round(Number(body.pointsCost||0)));if(!title)return json({ok:false,message:"عنوان پاداش الزامی است."},400);const payload={workspaceId,title,description:String(body.description||"").trim().slice(0,500)||null,pointsCost,rewardType:["DISCOUNT_AMOUNT","DISCOUNT_PERCENT","FREE_SERVICE","CUSTOM"].includes(body.rewardType)?body.rewardType:"CUSTOM",rewardValue:body.rewardValue==null||body.rewardValue===""?null:Math.max(0,Math.round(Number(body.rewardValue))),serviceId:body.serviceId||null,stock:body.stock==null||body.stock===""?null:Math.max(0,Math.round(Number(body.stock))),isActive:true};const {error}=await admin.from("BookingLoyaltyReward").insert(payload);if(error)throw error;
  }else if(action==="toggle_reward"){
   const {error}=await admin.from("BookingLoyaltyReward").update({isActive:!!body.isActive,updatedAt:new Date().toISOString()}).eq("id",body.id).eq("workspaceId",workspaceId);if(error)throw error;
  }else if(action==="redeem_reward"){
   const {error}=await admin.rpc("booking_loyalty_redeem_reward",{p_workspace_id:workspaceId,p_customer_id:String(body.customerId||""),p_reward_id:String(body.rewardId||""),p_user_id:userId});if(error)throw error;
  }else if(action==="cancel_redemption"){
   const {error}=await admin.rpc("booking_loyalty_cancel_redemption",{p_workspace_id:workspaceId,p_redemption_id:String(body.id||""),p_user_id:userId});if(error)throw error;
  }else if(action==="use_redemption"){
   const {error}=await admin.from("BookingLoyaltyRedemption").update({status:"USED",usedAt:new Date().toISOString()}).eq("id",body.id).eq("workspaceId",workspaceId).eq("status","ISSUED");if(error)throw error;
  }else if(action==="create_campaign"){
   const title=String(body.title||"").trim().slice(0,120),prize=String(body.prize||"").trim().slice(0,240);if(!title||!prize)return json({ok:false,message:"عنوان و جایزه الزامی است."},400);const {data:campaign,error}=await admin.from("BookingLotteryCampaign").insert({workspaceId,title,prize,status:"OPEN",minimumPoints:Math.max(0,Math.round(Number(body.minimumPoints||0))),minimumVisits:Math.max(0,Math.round(Number(body.minimumVisits||0))),vipOnly:!!body.vipOnly,startsAt:body.startsAt||new Date().toISOString(),endsAt:body.endsAt||null,createdByUserId:userId}).select("id").single();if(error)throw error;const rebuilt=await admin.rpc("booking_lottery_rebuild_entries",{p_workspace_id:workspaceId,p_campaign_id:campaign.id});if(rebuilt.error)throw rebuilt.error;
  }else if(action==="rebuild_campaign"){
   const {error}=await admin.rpc("booking_lottery_rebuild_entries",{p_workspace_id:workspaceId,p_campaign_id:String(body.id||"")});if(error)throw error;
  }else if(action==="draw_campaign"){
   const {error}=await admin.rpc("booking_lottery_draw",{p_workspace_id:workspaceId,p_campaign_id:String(body.id||""),p_user_id:userId});if(error)throw error;
  }else if(action==="cancel_campaign"){
   const {error}=await admin.from("BookingLotteryCampaign").update({status:"CANCELLED",updatedAt:new Date().toISOString()}).eq("id",body.id).eq("workspaceId",workspaceId).in("status",["DRAFT","OPEN"]);if(error)throw error;
  }else return json({ok:false,message:"Action ناشناخته است."},400);
  return json(await snapshot(admin,workspaceId));
 }catch(error:any){console.error("booking-loyalty",error);return json({ok:false,message:error?.message||"عملیات باشگاه مشتریان انجام نشد."},400)}
});
export default{async fetch(request:Request){if(request.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});return handler(request)}};
