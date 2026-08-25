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
const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, OPTIONS"};
// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data:unknown,status=200){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data,{status,headers:corsHeaders})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Response.json(data,{status,headers:corsHeaders})}
// راهنما: این تابع «emptyData» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function emptyData(){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Promise.resolve({data:[],error:null})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Promise.resolve({data:[],error:null})}
// راهنما: این تابع «emptyCount» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function emptyCount(){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Promise.resolve({count:0,error:null})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Promise.resolve({count:0,error:null})}
// راهنما: این تابع «numberValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function numberValue(value:unknown){/* راهنما: این دستور متغیر/ثابت «number» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const number=Number(value??0);/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Number.isFinite(number)?number:0» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Number.isFinite(number)?number:0}

// راهنما: این دستور متغیر/ثابت «authenticated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const authenticated=withSupabase({auth:"user"},async(request,ctx)=>{
 // راهنما: این شرط بررسی می‌کند آیا «request.method!=="GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
 if(request.method!=="GET")/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"Method not allowed"},405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"Method not allowed"},405);
 // راهنما: این دستور متغیر/ثابت «userId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const userId=ctx.userClaims?.id;/* راهنما: این شرط بررسی می‌کند آیا «!userId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(!userId)/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"ورود به حساب الزامی است."},401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"ورود به حساب الزامی است."},401);/* راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const admin=ctx.supabaseAdmin;
 // راهنما: این دستور متغیر/ثابت «[{data:user,error:userError},{data:membershi…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const [{data:user,error:userError},{data:memberships,error:memberError}]=await Promise.all([admin.from("User").select("id,email,displayName,role,createdAt").eq("id",userId).single(),admin.from("WorkspaceMember").select("workspaceId,role").eq("userId",userId)]);
 // راهنما: این شرط بررسی می‌کند آیا «userError||!user||memberError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
 if(userError||!user||memberError){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(userError,memberError)». */ console.error(userError,memberError);/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"اطلاعات حساب کاربری در دسترس نیست."},500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"اطلاعات حساب کاربری در دسترس نیست."},500)}
 // راهنما: این دستور متغیر/ثابت «workspaceIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const workspaceIds=(memberships??[]).map((x:any)=>x.workspaceId as string);
 // راهنما: این دستور متغیر/ثابت «hasWorkspaces» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const hasWorkspaces=workspaceIds.length>0;
 // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const now=new Date().toISOString();
 // راهنما: این دستور متغیر/ثابت «[subscriptionsResult,ordersResult,telegramRe…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const [subscriptionsResult,ordersResult,telegramResult,baleResult,rubikaResult,discordResult,instagramResult,whatsappResult,jobsResult,workspacesResult,storesResult,pendingJobsCountResult,openWhatsAppCountResult,bookingCustomersCountResult,upcomingBookingsCountResult]=await Promise.all([
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
  hasWorkspaces?admin.from("Store").select("id,workspaceId").in("workspaceId",workspaceIds):emptyData(),
  hasWorkspaces?admin.from("ScheduledJob").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds).in("status",["PENDING","PROCESSING"]):emptyCount(),
  hasWorkspaces?admin.from("WhatsAppConversation").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds).eq("status","OPEN"):emptyCount(),
  hasWorkspaces?admin.from("BookingCustomer").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds):emptyCount(),
  hasWorkspaces?admin.from("BookingAppointment").select("id",{count:"exact",head:true}).in("workspaceId",workspaceIds).gte("startsAt",now).in("status",["PENDING","CONFIRMED"]):emptyCount()
 ]);
 // راهنما: این دستور متغیر/ثابت «firstError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const firstError=[subscriptionsResult,ordersResult,telegramResult,baleResult,rubikaResult,discordResult,instagramResult,whatsappResult,jobsResult,workspacesResult,storesResult,pendingJobsCountResult,openWhatsAppCountResult,bookingCustomersCountResult,upcomingBookingsCountResult].map((x:any)=>x.error).find(Boolean);/* راهنما: این شرط بررسی می‌کند آیا «firstError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(firstError){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(firstError)». */ console.error(firstError);/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"دریافت اطلاعات داشبورد انجام نشد."},500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"دریافت اطلاعات داشبورد انجام نشد."},500)}
 // راهنما: این دستور متغیر/ثابت «storeIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const storeIds=(storesResult.data??[]).map((x:any)=>x.id as string);
 // راهنما: این دستور متغیر/ثابت «[storeOrdersCountResult,paidStoreOrdersCount…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const [storeOrdersCountResult,paidStoreOrdersCountResult]=storeIds.length?await Promise.all([
  admin.from("StoreOrder").select("id",{count:"exact",head:true}).in("storeId",storeIds),
  admin.from("StoreOrder").select("id",{count:"exact",head:true}).in("storeId",storeIds).in("status",["PAID","PROCESSING","COMPLETED"])
 ]):[{count:0,error:null},{count:0,error:null}];
 // راهنما: این شرط بررسی می‌کند آیا «storeOrdersCountResult.error||paidStoreOrdersCountResult.error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
 if(storeOrdersCountResult.error||paidStoreOrdersCountResult.error){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(storeOrdersCountResult.error,paidStoreOrdersCountResult.error)». */ console.error(storeOrdersCountResult.error,paidStoreOrdersCountResult.error);/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"دریافت آمار سفارش‌ها انجام نشد."},500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"دریافت آمار سفارش‌ها انجام نشد."},500)}
 // راهنما: این دستور متغیر/ثابت «productIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const productIds=Array.from(new Set([...(subscriptionsResult.data??[]).map((x:any)=>x.productId),...(ordersResult.data??[]).map((x:any)=>x.productId)].filter(Boolean)));/* راهنما: این دستور متغیر/ثابت «products» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ let products:any[]=[];
 // راهنما: این شرط بررسی می‌کند آیا «productIds.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
 if(productIds.length){/* راهنما: این دستور متغیر/ثابت «{data,error}» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const {data,error}=await admin.from("Product").select("id,name,shortDescription,category,status,priceAmount,currency,billingPeriod").in("id",productIds);/* راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(error)/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:false,message:"دریافت اطلاعات محصولات انجام نشد."},500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ok:false,message:"دریافت اطلاعات محصولات انجام نشد."},500);/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «products=data??[]». */ products=data??[]}
 // راهنما: این دستور متغیر/ثابت «productMap» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const productMap=new Map(products.map((p:any)=>[p.id,p]));
 // راهنما: این دستور متغیر/ثابت «subscriptions» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const subscriptions=(subscriptionsResult.data??[]).map((x:any)=>({...x,product:productMap.get(x.productId)??null}));
 // راهنما: این دستور متغیر/ثابت «orders» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const orders=(ordersResult.data??[]).map((x:any)=>({...x,product:productMap.get(x.productId)??null}));
 // راهنما: این دستور متغیر/ثابت «telegramBots، baleBots، rubikaBots، discordBots، instagramAccounts، whatsappAccounts، scheduledJobs» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const telegramBots=telegramResult.data??[],baleBots=baleResult.data??[],rubikaBots=rubikaResult.data??[],discordBots=discordResult.data??[],instagramAccounts=instagramResult.data??[],whatsappAccounts=whatsappResult.data??[],scheduledJobs=jobsResult.data??[];
 // راهنما: این دستور متغیر/ثابت «channelMetrics» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const channelMetrics=[
  {key:"telegram",label:"Telegram",connected:telegramBots.length,active:telegramBots.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"instagram",label:"Instagram",connected:instagramAccounts.length,active:instagramAccounts.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"whatsapp",label:"WhatsApp",connected:whatsappAccounts.length,active:whatsappAccounts.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"bale",label:"Bale",connected:baleBots.length,active:baleBots.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"rubika",label:"Rubika",connected:rubikaBots.length,active:rubikaBots.filter((x:any)=>x.status==="ACTIVE").length},
  {key:"discord",label:"Discord",connected:discordBots.length,active:discordBots.filter((x:any)=>x.status==="ACTIVE").length}
 ];
 // راهنما: این دستور متغیر/ثابت «engagementValues» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const engagementValues=instagramAccounts.map((x:any)=>Number(x.engagementRate)).filter((x:number)=>Number.isFinite(x));
 // راهنما: این دستور متغیر/ثابت «instagramFollowers» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const instagramFollowers=instagramAccounts.reduce((sum:number,x:any)=>sum+numberValue(x.followersCount),0);
 // راهنما: این دستور متغیر/ثابت «instagramFollowing» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const instagramFollowing=instagramAccounts.reduce((sum:number,x:any)=>sum+numberValue(x.followingCount),0);
 // راهنما: این دستور متغیر/ثابت «instagramPosts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const instagramPosts=instagramAccounts.reduce((sum:number,x:any)=>sum+numberValue(x.postsCount),0);
 // راهنما: این دستور متغیر/ثابت «averageEngagement» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const averageEngagement=engagementValues.length?Number((engagementValues.reduce((sum:number,x:number)=>sum+x,0)/engagementValues.length).toFixed(2)):null;
 // راهنما: این دستور متغیر/ثابت «lastInstagramSync» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const lastInstagramSync=instagramAccounts.map((x:any)=>x.lastSyncedAt).filter(Boolean).sort().at(-1)??null;
 // راهنما: این دستور متغیر/ثابت «analytics» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
 const analytics={
  generatedAt:new Date().toISOString(),
  channels:channelMetrics,
  totals:{connectedChannels:channelMetrics.filter((x:any)=>x.connected>0).length,connectedAccounts:channelMetrics.reduce((sum:number,x:any)=>sum+x.connected,0),activeAccounts:channelMetrics.reduce((sum:number,x:any)=>sum+x.active,0)},
  instagram:{followers:instagramFollowers,following:instagramFollowing,posts:instagramPosts,averageEngagementRate:averageEngagement,lastSyncedAt:lastInstagramSync,accounts:instagramAccounts.map((x:any)=>({id:x.id,workspaceId:x.workspaceId,username:x.username,displayName:x.displayName,followersCount:numberValue(x.followersCount),followingCount:numberValue(x.followingCount),postsCount:numberValue(x.postsCount),engagementRate:x.engagementRate==null?null:numberValue(x.engagementRate),metrics:x.metrics??{},status:x.status,lastSyncedAt:x.lastSyncedAt}))},
  operations:{pendingScheduledJobs:pendingJobsCountResult.count??0,openWhatsAppConversations:openWhatsAppCountResult.count??0,storeOrders:storeOrdersCountResult.count??0,paidStoreOrders:paidStoreOrdersCountResult.count??0,bookingCustomers:bookingCustomersCountResult.count??0,upcomingBookings:upcomingBookingsCountResult.count??0}
 };
 // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ok:true,user,workspaces:workspacesResult.data??[],memberships:member…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
 return json({ok:true,user,workspaces:workspacesResult.data??[],memberships:memberships??[],subscriptions,orders,telegramBots,baleBots,rubikaBots,discordBots,instagramAccounts,whatsappAccounts,scheduledJobs,analytics,summary:{activeSubscriptions:subscriptions.filter((x:any)=>x.status==="ACTIVE"||x.status==="TRIALING").length,activeTelegramBots:telegramBots.filter((x:any)=>x.status==="ACTIVE").length,activeBaleBots:baleBots.filter((x:any)=>x.status==="ACTIVE").length,activeRubikaBots:rubikaBots.filter((x:any)=>x.status==="ACTIVE").length,activeDiscordBots:discordBots.filter((x:any)=>x.status==="ACTIVE").length,activeInstagramAccounts:instagramAccounts.filter((x:any)=>x.status==="ACTIVE").length,activeWhatsAppAccounts:whatsappAccounts.filter((x:any)=>x.status==="ACTIVE").length,pendingScheduledJobs:pendingJobsCountResult.count??0}})
});
// راهنما: این دستور از نوع ExportAssignment بخشی از کنترل جریان یا تعریف منطق این فایل است.
export default{async fetch(request:Request){/* راهنما: این شرط بررسی می‌کند آیا «request.method==="OPTIONS"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(request.method==="OPTIONS")/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok",{headers:corsHeaders})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok",{headers:corsHeaders});/* راهنما: این دستور متغیر/ثابت «r» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const r=await authenticated(request);/* راهنما: این دستور متغیر/ثابت «h» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const h=new Headers(r.headers);/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Object.entries(corsHeaders).forEach(([k,v])=>h.set(k,v))». */ Object.entries(corsHeaders).forEach(([k,v])=>h.set(k,v));/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response(r.body,{status:r.status,headers:h})» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response(r.body,{status:r.status,headers:h})}};
