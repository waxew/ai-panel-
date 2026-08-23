import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, OPTIONS"};
function json(data:unknown,status=200){return Response.json(data,{status,headers:corsHeaders})}

const authenticated=withSupabase({auth:"user"},async(request,ctx)=>{
 if(request.method!=="GET")return json({ok:false,message:"Method not allowed"},405);
 const userId=ctx.userClaims?.id;if(!userId)return json({ok:false,message:"ورود به حساب الزامی است."},401);const admin=ctx.supabaseAdmin;
 const [{data:user,error:userError},{data:memberships,error:memberError}]=await Promise.all([admin.from("User").select("id,email,displayName,role,createdAt").eq("id",userId).single(),admin.from("WorkspaceMember").select("workspaceId,role").eq("userId",userId)]);
 if(userError||!user||memberError){console.error(userError,memberError);return json({ok:false,message:"اطلاعات حساب کاربری در دسترس نیست."},500)}
 const workspaceIds=(memberships??[]).map((x:any)=>x.workspaceId as string);
 const [subscriptionsResult,ordersResult,botsResult,rubikaResult,instagramResult,whatsappResult,jobsResult,workspacesResult]=await Promise.all([
  admin.from("Subscription").select("id,productId,status,startsAt,expiresAt,createdAt,updatedAt").eq("userId",userId).order("createdAt",{ascending:false}),
  admin.from("Order").select("id,productId,amount,currency,status,provider,createdAt,paidAt").eq("userId",userId).order("createdAt",{ascending:false}).limit(20),
  workspaceIds.length?admin.from("TelegramBot").select("id,workspaceId,telegramBotId,username,displayName,description,status,welcomeMessage,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):Promise.resolve({data:[],error:null}),
  workspaceIds.length?admin.from("RubikaBot").select("id,workspaceId,rubikaBotId,username,displayName,description,status,welcomeMessage,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):Promise.resolve({data:[],error:null}),
  workspaceIds.length?admin.from("InstagramAccount").select("id,workspaceId,username,displayName,followersCount,followingCount,postsCount,engagementRate,metrics,status,lastSyncedAt,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):Promise.resolve({data:[],error:null}),
  workspaceIds.length?admin.from("WhatsAppAccount").select("id,workspaceId,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,status,webhookSubscribed,qualityRating,lastSyncedAt,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):Promise.resolve({data:[],error:null}),
  workspaceIds.length?admin.from("ScheduledJob").select("id,workspaceId,platform,jobType,runAt,status,attempts,createdAt").in("workspaceId",workspaceIds).order("runAt",{ascending:false}).limit(50):Promise.resolve({data:[],error:null}),
  workspaceIds.length?admin.from("Workspace").select("id,name,createdAt,updatedAt").in("id",workspaceIds):Promise.resolve({data:[],error:null})
 ]);
 const firstError=[subscriptionsResult,ordersResult,botsResult,rubikaResult,instagramResult,whatsappResult,jobsResult,workspacesResult].map((x:any)=>x.error).find(Boolean);if(firstError){console.error(firstError);return json({ok:false,message:"دریافت اطلاعات داشبورد انجام نشد."},500)}
 const productIds=Array.from(new Set([...(subscriptionsResult.data??[]).map((x:any)=>x.productId),...(ordersResult.data??[]).map((x:any)=>x.productId)].filter(Boolean)));let products:any[]=[];
 if(productIds.length){const {data,error}=await admin.from("Product").select("id,name,shortDescription,category,status,priceAmount,currency,billingPeriod").in("id",productIds);if(error)return json({ok:false,message:"دریافت اطلاعات محصولات انجام نشد."},500);products=data??[]}
 const productMap=new Map(products.map((p:any)=>[p.id,p]));const subscriptions=(subscriptionsResult.data??[]).map((x:any)=>({...x,product:productMap.get(x.productId)??null}));const orders=(ordersResult.data??[]).map((x:any)=>({...x,product:productMap.get(x.productId)??null}));const telegramBots=botsResult.data??[],rubikaBots=rubikaResult.data??[],instagramAccounts=instagramResult.data??[],whatsappAccounts=whatsappResult.data??[],scheduledJobs=jobsResult.data??[];
 return json({ok:true,user,workspaces:workspacesResult.data??[],memberships:memberships??[],subscriptions,orders,telegramBots,rubikaBots,instagramAccounts,whatsappAccounts,scheduledJobs,summary:{activeSubscriptions:subscriptions.filter((x:any)=>x.status==="ACTIVE"||x.status==="TRIALING").length,activeTelegramBots:telegramBots.filter((x:any)=>x.status==="ACTIVE").length,activeRubikaBots:rubikaBots.filter((x:any)=>x.status==="ACTIVE").length,activeInstagramAccounts:instagramAccounts.filter((x:any)=>x.status==="ACTIVE").length,activeWhatsAppAccounts:whatsappAccounts.filter((x:any)=>x.status==="ACTIVE").length,pendingScheduledJobs:scheduledJobs.filter((x:any)=>x.status==="PENDING"||x.status==="PROCESSING").length}})
});
export default{async fetch(request:Request){if(request.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});const r=await authenticated(request);const h=new Headers(r.headers);Object.entries(corsHeaders).forEach(([k,v])=>h.set(k,v));return new Response(r.body,{status:r.status,headers:h})}};
