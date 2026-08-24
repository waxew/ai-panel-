import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, OPTIONS"};
function json(data:unknown,status=200){return Response.json(data,{status,headers:corsHeaders})}
function emptyData(){return Promise.resolve({data:[],error:null})}
function emptyCount(){return Promise.resolve({count:0,error:null})}
function numberValue(value:unknown){const number=Number(value??0);return Number.isFinite(number)?number:0}

const authenticated=withSupabase({auth:"user"},async(request,ctx)=>{
 if(request.method!=="GET")return json({ok:false,message:"Method not allowed"},405);
 const userId=ctx.userClaims?.id;if(!userId)return json({ok:false,message:"ورود به حساب الزامی است."},401);const admin=ctx.supabaseAdmin;
 const [{data:user,error:userError},{data:memberships,error:memberError}]=await Promise.all([admin.from("User").select("id,email,displayName,role,createdAt").eq("id",userId).single(),admin.from("WorkspaceMember").select("workspaceId,role").eq("userId",userId)]);
 if(userError||!user||memberError){console.error(userError,memberError);return json({ok:false,message:"اطلاعات حساب کاربری در دسترس نیست."},500)}
 const workspaceIds=(memberships??[]).map((x:any)=>x.workspaceId as string);
 const hasWorkspaces=workspaceIds.length>0;
 const now=new Date().toISOString();
 const [subscriptionsResult,ordersResult,telegramResult,baleResult,rubikaResult,discordResult,instagramResult,whatsappResult,jobsResult,workspacesResult,pendingJobsCountResult,openWhatsAppCountResult,storeOrdersCountResult,paidStoreOrdersCountResult,bookingCustomersCountResult,upcomingBookingsCountResult]=await Promise.all([
  admin.from("Subscription").select("id,productId,status,startsAt,expiresAt,createdAt,updatedAt").eq("userId",userId).order("createdAt",{ascending:false}),
  admin.from("Order").select("id,productId,amount,currency,status,provider,createdAt,paidAt").eq("userId",userId).order("createdAt",{ascending:false}).limit(20),
  hasWorkspaces?admin.from("TelegramBot").select("id,workspaceId,telegramBotId,username,displayName,description,status,welcomeMessage,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):emptyData(),
  hasWorkspaces?admin.from("BaleBot").select("id,workspaceId,baleBotId,username,displayName,description,status,welcomeMessage,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):emptyData(),
  hasWorkspaces?admin.from("RubikaBot").select("id,workspaceId,rubikaBotId,username,displayName,description,status,welcomeMessage,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):emptyData(),
  hasWorkspaces?admin.from("DiscordBot").select("id,workspaceId,applicationId,botUserId,username,displayName,description,status,defaultGuildId,defaultChannelId,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):emptyData(),
  hasWorkspaces?admin.from("InstagramAccount").select("id,workspaceId,username,displayName,followersCount,followingCount,postsCount,engagementRate,metrics,status,lastSyncedAt,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):emptyData(),
  hasWorkspaces?admin.from("WhatsAppAccount").select("id,workspaceId,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,status,webhookSubscribed,qualityRating,lastSyncedAt,createdAt,updatedAt").in("workspaceId",workspaceIds).order("createdAt",{ascending:false}):emptyData(),
  hasWorkspaces?admin.from("ScheduledJob").select("id,workspaceId,platform,jobType,runAt,status,attempts,createdAt").in("workspaceId",workspaceIds).order("runAt",{ascending:false}).limit(50):emptyData(),
  hasWorkspaces?admin.from("Workspace").select("id,name,createdAt,updatedAt").in("id",workspaceIds):emptyData(),
  hasWorkspaces?admin.from("ScheduledJob").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds).in("status",["PENDING","PROCESSING"]):emptyCount(),
  hasWorkspaces?admin.from("WhatsAppConversation").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds).eq("status","OPEN"):emptyCount(),
  hasWorkspaces?admin.from("StoreOrder").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds):emptyCount(),
  hasWorkspaces?admin.from("StoreOrder").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds).in("status",["PAID","PROCESSING","COMPLETED"]):emptyCount(),
  hasWorkspaces?admin.from("BookingCustomer").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds):emptyCount(),
  hasWorkspaces?admin.from("BookingAppointment").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds).gte("startsAt",now).in("status",["PENDING","CONFIRMED"]):emptyCount()
 ]);
 const firstError=[subscriptionsResult,ordersResult,telegramResult,baleResult,rubikaResult,discordResult,instagramResult,whatsappResult,jobsResult,workspacesResult,pendingJobsCountResult,openWhatsAppCountResult,storeOrdersCountResult,paidStoreOrdersCountResult,bookingCustomersCountResult,upcomingBookingsCountResult].map((x:any)=>x.error).find(Boolean);if(firstError){console.error(firstError);return json({ok:false,message:"دریافت اطلاعات داشبورد انجام نشد."},500)}
 const productIds=Array.from(new Set([...(subscriptionsResult.data??[]).map((x:any)=>x.productId),...(ordersResult.data??[]).map((x:any)=>x.productId)].filter(Boolean)));let products:any[]=[];
 if(productIds.length){const {data,error}=await admin.from("Product").select("id,name,shortDescription,category,status,priceAmount,currency,billingPeriod").in("id",productIds);if(error)return json({ok:false,message:"دریافت اطلاعات محصولات انجام نشد."},500);products=data??[]}
 const productMap=new Map(products.map((p:any)=>[p.id,p]));
 const subscriptions=(subscriptionsResult.data??[]).map((x:any)=>({...x,product:productMap.get(x.productId)??null}));
 const orders=(ordersResult.data??[]).map((x:any)=>({...x,product:productMap.get(x.productId)??null}));
 const telegramBots=telegramResult.data??[],baleBots=baleResult.data??[],rubikaBots=rubikaResult.data??[],discordBots=discordResult.data??[],instagramAccounts=instagramResult.data??[],whatsappAccounts=whatsappResult.data??[],scheduledJobs=jobsResult.data??[];
 const channelMetrics=[
  {key:"telegram",label:"Telegram",connected:telegramBots.length,active:telegramBots.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"instagram",label:"Instagram",connected:instagramAccounts.length,active:instagramAccounts.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"whatsapp",label:"WhatsApp",connected:whatsappAccounts.length,active:whatsappAccounts.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"bale",label:"Bale",connected:baleBots.length,active:baleBots.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"rubika",label:"Rubika",connected:rubikaBots.length,active:rubikaBots.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"discord",label:"Discord",connected:discordBots.length,active:discordBots.filter((x:any)=>x.status==="ACTIVE").length}
 ];
 const engagementValues=instagramAccounts.map((x:any)=>Number(x.engagementRate)).filter((x:number)=>Number.isFinite(x));
 const instagramFollowers=instagramAccounts.reduce((sum:number,x:any)=>sum+numberValue(x.followersCount),0);
 const instagramFollowing=instagramAccounts.reduce((sum:number,x:any)=>sum+numberValue(x.followingCount),0);
 const instagramPosts=instagramAccounts.reduce((sum:number,x:any)=>sum+numberValue(x.postsCount),0);
 const averageEngagement=engagementValues.length?Number((engagementValues.reduce((sum:number,x:number)=>sum+x,0)/engagementValues.length).toFixed(2)):null;
 const lastInstagramSync=instagramAccounts.map((x:any)=>x.lastSyncedAt).filter(Boolean).sort().at(-1)??null;
 const analytics={
  generatedAt:new Date().toISOString(),
  channels:channelMetrics,
  totals:{connectedChannels:channelMetrics.filter((x:any)=>x.connected>0).length,connectedAccounts:channelMetrics.reduce((sum:number,x:any)=>sum+x.connected,0),activeAccounts:channelMetrics.reduce((sum:number,x:any)=>sum+x.active,0)},
  instagram:{followers:instagramFollowers,following:instagramFollowing,posts:instagramPosts,averageEngagementRate:averageEngagement,lastSyncedAt:lastInstagramSync,accounts:instagramAccounts.map((x:any)=>({id:x.id,workspaceId:x.workspaceId,username:x.username,displayName:x.displayName,followersCount:numberValue(x.followersCount),followingCount:numberValue(x.followingCount),postsCount:numberValue(x.postsCount),engagementRate:x.engagementRate==null?null:numberValue(x.engagementRate),metrics:x.metrics??{},status:x.status,lastSyncedAt:x.lastSyncedAt}))},
  operations:{pendingScheduledJobs:pendingJobsCountResult.count??0,openWhatsAppConversations:openWhatsAppCountResult.count??0,storeOrders:storeOrdersCountResult.count??0,paidStoreOrders:paidStoreOrdersCountResult.count??0,bookingCustomers:bookingCustomersCountResult.count??0,upcomingBookings:upcomingBookingsCountResult.count??0}
 };
 return json({ok:true,user,workspaces:workspacesResult.data??[],memberships:memberships??[],subscriptions,orders,telegramBots,baleBots,rubikaBots,discordBots,instagramAccounts,whatsappAccounts,scheduledJobs,analytics,summary:{activeSubscriptions:subscriptions.filter((x:any)=>x.status==="ACTIVE"||x.status==="TRIALING").length,activeTelegramBots:telegramBots.filter((x:any)=>x.status==="ACTIVE").length,activeBaleBots:baleBots.filter((x:any)=>x.status==="ACTIVE").length,activeRubikaBots:rubikaBots.filter((x:any)=>x.status==="ACTIVE").length,activeDiscordBots:discordBots.filter((x:any)=>x.status==="ACTIVE").length,activeInstagramAccounts:instagramAccounts.filter((x:any)=>x.status==="ACTIVE").length,activeWhatsAppAccounts:whatsappAccounts.filter((x:any)=>x.status==="ACTIVE").length,pendingScheduledJobs:pendingJobsCountResult.count??0}})
});
export default{async fetch(request:Request){if(request.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});const r=await authenticated(request);const h=new Headers(r.headers);Object.entries(corsHeaders).forEach(([k,v])=>h.set(k,v));return new Response(r.body,{status:r.status,headers:h})}};
