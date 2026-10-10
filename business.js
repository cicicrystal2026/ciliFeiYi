import crypto from 'node:crypto';
export const roles=['管理员','内容编辑','审核员','非遗工作人员','数据管理员','景区运营人员','县领导','游客'];
export const tenants=['慈利县文旅主管部门','非遗保护中心','试点景区运营组'];
export const now=()=>new Date().toISOString();
const id=prefix=>prefix+'-'+crypto.randomUUID().slice(0,8);
const requireRule=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:409})};
export function seed(modules){
 const state={version:1,revision:0,createdAt:now(),configs:{},records:{},audit:[],jobs:[],conversations:[],visits:[],rentals:[],usage:{tokens:2486000,videoSeconds:19200,speechSeconds:111600,quota:10000000},points:[{id:'P01',name:'龙灯展示点',radius:30,lat:29.42,lng:111.12,script:'板板龙灯的形制、表演与传承故事，连接着慈利的乡土记忆。',group:'标准',language:'中文'}]};
 for(const m of modules)state.records[m.id]=Array.from({length:5},(_,i)=>({id:`CL-${m.id.replace('.','')}-${i+1}`,title:['板板龙灯专题资料','非遗影像数字档案','文旅知识补充资料','口述史采集成果','器物三维展示模型'][i],tenant:tenants[i%3],status:i===2?'待复核':'已完成',owner:['编辑A','审核员B','维护员C'][i%3],updatedAt:now(),version:`v1.${i}.0`,category:['非遗文化','景区景点','文旅通用'][i%3]}));
 state.users=[{id:'U01',name:'管理员A',role:'管理员',tenant:tenants[0],status:'启用',phone:'138****3200'},{id:'U02',name:'编辑A',role:'内容编辑',tenant:tenants[0],status:'启用',phone:'138****3201'},{id:'U03',name:'审核员B',role:'审核员',tenant:tenants[0],status:'启用',phone:'138****3202'}];
 state.contents=[{id:'C01',title:'板板龙灯 · 春节宣传短片',tenant:tenants[0],owner:'编辑A',type:'视频',status:'草稿',script:'镜头01：山水开篇。镜头02：龙灯器物。镜头03：技艺与表演。镜头04：文旅邀约。',aiReviewed:false,approved:false,explicit:true,implicit:true,duration:60,updatedAt:now()},{id:'C02',title:'走进慈利 · 数字人讲解',tenant:tenants[0],owner:'编辑A',type:'数字人口播',status:'待终审',script:'你好，欢迎来到慈利线上非遗馆。让我们从板板龙灯出发，了解器物与传承的故事。',aiReviewed:true,approved:false,explicit:true,implicit:true,duration:45,updatedAt:now()}];
 state.resources=[{id:'R01',title:'板板龙灯 · 表演影像',tenant:tenants[1],owner:'非遗工作人员A',type:'视频',category:'传统表演',status:'已授权',accepted:true,reviewed:true,rightsHolder:'Demo资料权利人',rightsUntil:'2027-12-31',scope:'展馆展示、AI讲解、内容创作',fingerprint:'sha256:demo-7f2e8a31',updatedAt:now()},{id:'R02',title:'板板龙灯 · 器物数字档案',tenant:tenants[1],owner:'非遗工作人员A',type:'3D',category:'传统技艺',status:'待验收',accepted:false,reviewed:false,rightsUntil:null,scope:'',updatedAt:now()},{id:'R03',title:'历史采集影像 · 到期示例',tenant:tenants[1],type:'视频',status:'授权过期',accepted:true,reviewed:true,rightsUntil:'2025-01-01',scope:'展馆展示',updatedAt:now()}];
 state.knowledge=[{id:'K01',title:'板板龙灯简介',tenant:tenants[0],category:'非遗文化',text:'板板龙灯是本Demo的非遗展示主题。你可以在专题展厅查看器物、表演影像和传承故事。正式知识须以县方核验资料为准。',source:'县方审校资料（Demo）',status:'已发布',reviewed:true,indexed:true,version:'v1.2.0',updatedAt:now()},{id:'K02',title:'龙灯器物与表演',tenant:tenants[0],category:'非遗文化',text:'通过器物数字档案，可以了解龙灯的构成、纹样与表演场景。该回答为演示知识，不代替正式非遗资料。',source:'非遗器物数字档案（Demo）',status:'已发布',reviewed:true,indexed:true,version:'v1.2.0',updatedAt:now()}];
 state.halls=[{id:'H01',title:'板板龙灯专题展厅',tenant:tenants[1],description:'一灯一故事，一城一传承。',resources:['R01'],status:'已上线',sort:1,guide:'慈利数字人讲解员',updatedAt:now()}];
 state.devices=Array.from({length:8},(_,i)=>({id:`G${String(i+1).padStart(3,'0')}`,title:`AI眼镜 ${i+1}`,tenant:tenants[2],battery:86-i*7,online:i!==6,status:'可租借',firmware:'v1.0.0',knowledgeVersion:'v1.2.0',updatedAt:now()}));
 state.accounts=[{id:'A01',platform:'抖音',title:'慈利文旅 · Demo',tenant:tenants[0],authorized:true},{id:'A02',platform:'视频号',title:'慈利非遗 · Demo',tenant:tenants[0],authorized:true},{id:'A03',platform:'快手',title:'慈利文旅 · Demo',tenant:tenants[0],authorized:true}];
 state.packages=[{id:'PK01',title:'板板龙灯离线知识包',version:'v1.2.0',knowledge:['K01','K02'],tenant:tenants[2],status:'已下发',updatedAt:now()}];
 state.reports=[];state.exhibitions=[];
 state.audit.push({id:'LOG-SEED',action:'初始化演示数据',role:'系统',tenant:'系统',time:now(),detail:'所有素材、账号、知识与数字为Demo示例'});
 return state;
}
export const collectionFor=mod=>({ '1.1':'users','2.3':'knowledge','2.4':'knowledge','4.1':'contents','4.4':'contents','4.5':'contents','5.2':'packages','5.3':'devices','6.1':'resources','6.3':'resources','6.5':'halls','1.5':'reports' }[mod]||null);
export function visible(state,actor){
 const s=structuredClone(state);const all=actor.role==='管理员'||actor.role==='县领导';
 for(const key of ['users','contents','resources','knowledge','devices','accounts','packages','rentals','reports'])s[key]=s[key].filter(x=>all||(actor.role==='游客'?(key==='resources'?authorized(x):key==='knowledge'?x.reviewed&&x.status==='已发布':false):x.tenant===actor.tenant));
 if(actor.role==='游客'){s.halls=s.halls.filter(x=>x.status==='已上线'&&x.resources.every(rid=>state.resources.some(r=>r.id===rid&&authorized(r)&&r.scope.includes('展馆'))));s.audit=[];s.configs={};s.records={};s.jobs=[];s.conversations=[];s.usage={};s.reports=[];s.users=[];s.points=state.points;}
 else{for(const key of Object.keys(s.records))s.records[key]=s.records[key].filter(x=>all||x.tenant===actor.tenant);s.audit=s.audit.filter(x=>all||x.tenant===actor.tenant);s.conversations=s.conversations.filter(x=>all||x.tenant===actor.tenant);s.jobs=s.jobs.filter(x=>all||x.tenant===actor.tenant);s.halls=s.halls.filter(x=>all||x.tenant===actor.tenant)}
 return s;
}
export const authorized=r=>r.accepted&&r.reviewed&&r.rightsUntil&&new Date(r.rightsUntil+'T23:59:59Z')>new Date();
export function metrics(s){return {visits:12840+s.visits.length,contents:86+s.contents.filter(c=>c.status==='已发布').length,rentals:1286+s.rentals.length,assets:4328+s.resources.length-3,questions:6280+s.conversations.length,knowledge:s.knowledge.length,devices:s.devices.length,online:s.devices.filter(d=>d.online).length,rented:s.devices.filter(d=>d.status==='租借中').length,lowBattery:s.devices.filter(d=>d.battery<20).length,approved:s.contents.filter(c=>c.approved).length,pending:s.contents.filter(c=>c.status==='待终审').length};}
function permitted(role,action){
 if(role==='管理员')return true;
 if(['visit','ask','saveVisitorWork','glassesEvent'].includes(action))return true;
 if(['generate','finishJob','saveContent','submitReview','archiveContent','publishContent','saveConfig','create','update','import','export','report','evaluate','retry','login'].includes(action)&&['内容编辑','数据管理员','非遗工作人员','景区运营人员'].includes(role))return true;
 if(['reviewContent','preReview','saveConfig','update','export','report','reviewKnowledge'].includes(action)&&role==='审核员')return true;
 if(['acceptResource','authorizeResource','publishHall','saveConfig','create','update','import','export','saveHall'].includes(action)&&role==='非遗工作人员')return true;
 if(['reviewKnowledge','indexKnowledge','publishKnowledge','evaluate'].includes(action)&&role==='数据管理员')return true;
 if(['rent','return','upgrade','package','deployPackage','savePoint'].includes(action)&&role==='景区运营人员')return true;
 return role==='县领导'&&['export','report'].includes(action);
}
export function apply(s,input,actor){
 const {action,data={}}=input;requireRule(permitted(actor.role,action),'当前演示角色没有此操作权限，请切换适合的角色');
 const find=(key,recordId)=>{const item=s[key].find(x=>x.id===recordId);requireRule(item,'记录不存在');requireRule(actor.role==='管理员'||actor.role==='县领导'||actor.role==='游客'||item.tenant===actor.tenant,'当前单位不可操作其他单位的数据');return item};
 let result={};
 if(action==='reset')throw new Error('reset由服务端单独处理');
 if(action==='saveConfig'){s.configs[actor.tenant+':'+data.mod+':'+(data.page||'')]=structuredClone(data.fields||{});result={message:'配置已保存并记录版本'};}
 else if(action==='create'){
  const mod=data.mod;requireRule(typeof mod==='string'&&Object.hasOwn(s.records,mod),'模块不存在');const key=collectionFor(mod);const title=String(data.title||data.fields?.['名称']||data.fields?.['项目名称']||data.fields?.['标题']||'新建演示记录').slice(0,160);requireRule(title.trim(),'请输入名称');
  const record={id:id('CL'),title,tenant:actor.tenant,owner:actor.role,status:'草稿',updatedAt:now(),version:'v1.0.0',fields:data.fields||{}};
  if(key==='resources')Object.assign(record,{accepted:false,reviewed:false,rightsUntil:null,type:data.type||'图片',scope:''});
  if(key==='contents')Object.assign(record,{type:data.type||'视频',approved:false,aiReviewed:false,explicit:true,implicit:true,script:'待编辑文稿',duration:60});
  if(key==='knowledge')Object.assign(record,{reviewed:false,indexed:false,text:data.text||'待审校内容',source:'手工创建（Demo）'});
  if(key==='devices')Object.assign(record,{battery:100,online:true,status:'可租借',firmware:'v1.0.0',knowledgeVersion:'v1.2.0'});
  if(key==='halls')Object.assign(record,{resources:[],status:'草稿',sort:s.halls.length+1});
  if(key==='users')Object.assign(record,{name:title,role:data.role||'内容编辑',status:'启用',phone:'138****0000'});
  (key?s[key]:s.records[mod]).unshift(record);result={message:'记录已创建',record};
 }
 else if(action==='update'){
  const mod=data.mod;requireRule(Object.hasOwn(s.records,mod),'模块不存在');const key=collectionFor(mod);const r=key?find(key,data.id):s.records[mod].find(x=>x.id===data.id);requireRule(r,'记录不存在');requireRule(actor.role==='管理员'||r.tenant===actor.tenant,'当前单位不可编辑此记录');
  r.title=String(data.title||r.title).slice(0,160);if(r.name)r.name=r.title;r.fields={...r.fields,...data.fields};
  if(key==='knowledge'&&typeof data.text==='string'&&r.text!==data.text){r.text=data.text.slice(0,20000);r.reviewed=false;r.indexed=false;r.status='待审校';}
  if(key==='users'&&['启用','停用'].includes(data.status))r.status=data.status;
  r.updatedAt=now();result={message:'记录已更新',record:r};
 }
 else if(action==='generate'){
  const job={id:id('JOB'),title:String(data.title||'非遗创作').slice(0,160),page:data.page,type:data.type||'视频',prompt:String(data.prompt||'板板龙灯宣传内容').slice(0,4000),tenant:actor.tenant,status:'生成中',progress:0,createdAt:now(),error:false};s.jobs.unshift(job);result={message:'模拟生成任务已加入队列，不调用付费服务',job};
 }
 else if(action==='finishJob'){
  const job=find('jobs',data.id);if(job.status==='已完成')return {message:'任务已完成',job};requireRule(job.status==='生成中','任务状态无法完成');job.status='已完成';job.progress=100;
  const content={id:id('C'),title:job.title,type:job.type,tenant:job.tenant,owner:actor.role,status:'草稿',aiReviewed:false,approved:false,explicit:true,implicit:true,script:`【模拟AI生成】\n${job.prompt}\n\n镜头01 · 山水慈利（15秒）\n旁白：一灯一故事，一城一传承。\n镜头02 · 非遗器物（15秒）\n镜头03 · 传承与技艺（15秒）\n镜头04 · 走进慈利（15秒）\n资料来源：已审校非遗知识。`,duration:60,updatedAt:now()};s.contents.unshift(content);job.contentId=content.id;s.usage.tokens+=1200;result={message:'模拟生成完成，作品已保存为草稿',content,job};
 }
 else if(action==='saveContent'){const c=find('contents',data.id);requireRule(c.status!=='已发布','已发布内容请新建版本');c.script=String(data.script||c.script).slice(0,20000);c.title=String(data.title||c.title).slice(0,160);c.explicit=data.explicit!==false;c.implicit=data.implicit!==false;c.approved=false;c.aiReviewed=false;c.status='草稿';c.updatedAt=now();result={message:'草稿已保存，修改后需要重新审核',content:c};}
 else if(action==='preReview'||action==='submitReview'){
  const c=find('contents',data.id);requireRule(c.status!=='已发布','已发布内容不能重复提交');requireRule(c.script.trim(),'文稿不能为空');requireRule(c.explicit&&c.implicit,'请添加显式AIGC标识与隐式元数据标识');c.aiReviewed=true;c.status=action==='submitReview'?'待终审':'AI预审通过';c.updatedAt=now();result={message:action==='submitReview'?'AI预审通过，已提交人工终审':'模拟AI预审通过',content:c};
 }
 else if(action==='reviewContent'){
  const c=find('contents',data.id);requireRule(c.aiReviewed&&c.status==='待终审','须完成AI预审并提交终审');requireRule(String(data.reason||'').trim(),'请填写审核意见');c.approved=data.decision==='approve';c.status=c.approved?'审核通过':'已驳回';c.reviewReason=String(data.reason).slice(0,2000);c.updatedAt=now();result={message:c.approved?'人工终审通过，可进入发布':'已驳回，返回草稿修改',content:c};
 }
 else if(action==='publishContent'){
  const c=find('contents',data.id);requireRule(c.approved&&c.aiReviewed&&c.explicit&&c.implicit,'发布被阻止：须通过AI预审、人工终审及AIGC标识检查');const account=find('accounts',data.accountId||s.accounts[0].id);requireRule(account.authorized,'账号未授权');
  if(c.status==='已发布')return {message:'作品已发布，无需重复发布',content:c};
  const scheduled=data.scheduledAt?new Date(data.scheduledAt):null;requireRule(!scheduled||Number.isFinite(scheduled.getTime())&&scheduled>new Date(),'定时发布时间必须在未来');
  c.status=scheduled?'待定时发布':'已发布';c.platform=account.platform;c.scheduledAt=scheduled?.toISOString()||null;c.publishedAt=scheduled?null:now();c.updatedAt=now();
  if(!scheduled)archive(s,c);result={message:scheduled?'模拟发布排期已保存':'模拟发布成功，作品自动归档至资源库',content:c};
 }
 else if(action==='archiveContent'){const c=find('contents',data.id);requireRule(c.status==='已发布','仅可归档已发布成片');archive(s,c);result={message:'成片已归档'};}
 else if(action==='import'){
  requireRule(Object.hasOwn(s.records,data.mod),'模块不存在');const items=Array.isArray(data.items)?data.items.slice(0,1000):[];requireRule(items.length,'请选择有效的CSV/JSON数据');const key=collectionFor(data.mod)||(['2.2','2.5'].includes(data.mod)?'knowledge':null);
  for(const item of items){const r={id:id('IMP'),title:String(item.title||item.name||item['名称']||item['标题']||'导入资料').slice(0,160),text:String(item.text||item['正文']||'导入内容，待人工审校'),source:'本地文件导入（Demo）',tenant:actor.tenant,status:'待审校',reviewed:false,indexed:false,version:'v1.0.0',updatedAt:now(),fields:item};(key?s[key]:s.records[data.mod]).push(r)}
  result={message:`已导入${items.length}条，待校验与人工审校`,count:items.length};
 }
 else if(action==='reviewKnowledge'){const k=find('knowledge',data.id);k.reviewed=data.decision!=='reject';k.status=k.reviewed?'已审校':'已驳回';k.updatedAt=now();result={message:'知识审校状态已更新',knowledge:k};}
 else if(action==='publishKnowledge'){const k=find('knowledge',data.id);requireRule(k.reviewed,'知识须人工审校后发布');k.status='已发布';k.updatedAt=now();result={message:'知识已审校发布，待构建索引',knowledge:k};}
 else if(action==='indexKnowledge'){let n=0;for(const k of s.knowledge.filter(k=>k.status==='已发布'&&(actor.role==='管理员'||k.tenant===actor.tenant))){k.indexed=true;n++}result={message:`已模拟构建${n}条知识索引`};}
 else if(action==='acceptResource'){const r=find('resources',data.id);r.accepted=true;r.reviewed=true;r.status='待确权';r.updatedAt=now();result={message:'成果验收通过，等待确权与授权',resource:r};}
 else if(action==='authorizeResource'){const r=find('resources',data.id);requireRule(r.accepted,'须先完成成果验收');requireRule(String(data.holder||'').trim(),'请填写权利人');requireRule(new Date(data.until+'T23:59:59Z')>new Date(),'授权期限必须有效');requireRule(String(data.scope||'').trim(),'请填写授权范围');r.rightsHolder=String(data.holder);r.rightsUntil=data.until;r.scope=String(data.scope);r.fingerprint='sha256:'+crypto.createHash('sha256').update(r.id+r.title).digest('hex');r.status='已授权';r.updatedAt=now();result={message:'模拟确权与授权登记完成',resource:r};}
 else if(action==='saveHall'){let h=data.id?find('halls',data.id):null;if(!h){h={id:id('H'),tenant:actor.tenant,status:'草稿',sort:s.halls.length+1};s.halls.push(h)}h.title=String(data.title||'新建专题展厅').slice(0,160);h.description=String(data.description||'非遗展厅');h.resources=Array.isArray(data.resources)?data.resources:[];h.status='草稿';h.updatedAt=now();result={message:'展厅草稿已保存，预览后发布',hall:h};}
 else if(action==='publishHall'){const h=find('halls',data.id);requireRule(data.previewed,'须先预览确认');requireRule(h.resources.length,'展厅需要至少一个展品');for(const rid of h.resources){const r=s.resources.find(x=>x.id===rid);requireRule(r&&authorized(r)&&r.scope.includes('展馆'),'展品未验收、未审校、未授权、授权过期或授权范围不包含展馆，不能上线')}h.status='已上线';h.updatedAt=now();result={message:'展厅已上线，H5与Web同步可见',hall:h};}
 else if(action==='rent'){const d=find('devices',data.deviceId);requireRule(d.online&&d.battery>=20&&d.status==='可租借','设备离线、低电量或已租出，无法租借');const amount=Number(data.deposit);requireRule(Number.isFinite(amount)&&amount>=0,'押金记录必须为非负金额');const r={id:id('RENT'),deviceId:d.id,tenant:actor.tenant,visitor:String(data.visitor||'游客Demo').slice(0,80),deposit:amount,status:'租借中',createdAt:now(),operator:actor.role};s.rentals.unshift(r);d.status='租借中';result={message:'租借已登记，押金仅记账不收款',rental:r};}
 else if(action==='return'){const r=find('rentals',data.id);requireRule(r.status==='租借中','此租借记录已归还');r.status='已归还';r.returnedAt=now();r.refund=Number(data.refund??r.deposit);requireRule(Number.isFinite(r.refund)&&r.refund>=0&&r.refund<=r.deposit,'退还押金不得超过登记金额');r.exception=String(data.exception||'');s.devices.find(d=>d.id===r.deviceId).status=r.exception?'异常待处理':'可租借';result={message:'设备已归还，押金退还记录已保存',rental:r};}
 else if(action==='upgrade'){const d=find('devices',data.id);requireRule(d.online,'离线设备无法远程升级');d.firmware=data.version||'v1.1.0';d.updatedAt=now();result={message:'固件升级模拟完成',device:d};}
 else if(action==='package'){const list=s.knowledge.filter(k=>k.reviewed&&k.status==='已发布');requireRule(list.length,'没有可用的审校知识');const pack={id:id('PK'),title:'板板龙灯离线知识包',version:'v1.'+(s.packages.length+2)+'.0',knowledge:list.map(k=>k.id),tenant:actor.tenant,status:'待下发',updatedAt:now()};s.packages.unshift(pack);result={message:'离线知识包已打包',package:pack};}
 else if(action==='deployPackage'){const p=find('packages',data.id);for(const d of s.devices.filter(d=>d.online&&(actor.role==='管理员'||d.tenant===actor.tenant)))d.knowledgeVersion=p.version;p.status='已下发';result={message:'知识包已模拟下发至在线设备',package:p};}
 else if(action==='savePoint'){const point={...s.points[0],...data,id:s.points[0].id};requireRule(Number(point.radius)>0,'触发半径必须大于0');s.points[0]=point;result={message:'讲解点位已保存',point};}
 else if(action==='ask'){
  const question=String(data.question||'').trim().slice(0,1000);requireRule(question,'请输入问题');const deny=/政治敏感|隐私|身份证|银行卡|辱骂|违法/.test(question);const matched=!deny&&/板板|龙灯|非遗|器物|传承|慈利|你好|故事/.test(question);const list=s.knowledge.filter(k=>k.reviewed&&k.indexed&&k.status==='已发布');const k=list.find(x=>question.includes('器物')?x.title.includes('器物'):x.title.includes('龙灯'))||list[0];
  const answer=deny?'该问题超出讲解服务的安全范围，我可以继续为你介绍慈利非遗。':!matched||!k?data.offline?'本地知识暂无答案，请联网后重试或咨询工作人员。':'已审校知识中暂未找到答案，请咨询工作人员。':k.text;
  const chat={id:id('QA'),question,answer,source:matched&&!deny&&k?k.source:null,knowledgeId:matched&&!deny&&k?k.id:null,version:k?.version,tenant:actor.tenant,offline:!!data.offline,feedback:null,createdAt:now()};s.conversations.unshift(chat);if(!data.offline)s.usage.tokens+=Math.ceil(question.length+answer.length);result={message:'模拟知识检索完成',chat};
 }
 else if(action==='visit'){s.visits.push({id:id('VIS'),hallId:data.hallId||'H01',time:now()});result={message:'展馆访问已记录'};}
 else if(action==='saveVisitorWork'){const work={id:id('WORK'),title:String(data.title||'我的非遗纪念海报'),type:data.type||'海报',tenant:actor.tenant,status:'已生成',aigc:true,createdAt:now()};s.exhibitions.push(work);result={message:'模拟纪念作品已生成，带AI标识',work};}
 else if(action==='glassesEvent'){result={message:'眼镜状态已切换',state:data.state};}
 else if(action==='evaluate'){const report={id:id('EVAL'),title:'慈利非遗问答评测报告',tenant:actor.tenant,accuracy:'95.2%（演示样例）',samples:300,status:'已完成',updatedAt:now()};s.reports.unshift(report);result={message:'模拟评测完成，报告可导出',report};}
 else if(action==='report'){const report={id:id('REP'),title:data.title||'慈利文旅运营月报',tenant:actor.tenant,period:'2026-10',metrics:metrics(s),status:'已生成',updatedAt:now()};s.reports.unshift(report);result={message:'报表已生成',report};}
 else if(action==='export'){result={message:'导出操作已记录'};}
 else if(action==='retry'){const job=find('jobs',data.id);job.status='生成中';job.progress=0;result={message:'模拟任务已重新加入队列',job};}
 else if(action==='login'){result={message:'已进入模拟工作账号'};}
 else throw Object.assign(new Error('不支持的操作'),{status:400});
 s.revision++;s.audit.unshift({id:id('LOG'),action,role:actor.role,tenant:actor.tenant,time:now(),detail:result.message||action,objectId:data.id||result.record?.id||result.content?.id||''});return result;
}
function archive(s,c){if(s.resources.some(r=>r.contentId===c.id))return;s.resources.unshift({id:id('ARCH'),contentId:c.id,title:c.title,type:c.type,tenant:c.tenant,status:'已授权',accepted:true,reviewed:true,rightsUntil:'2030-12-31',rightsHolder:'慈利县Demo项目',scope:'展馆展示、内容创作',fingerprint:'sha256:demo-'+c.id,updatedAt:now()});}
export function tick(s){let changed=false;for(const c of s.contents){if(c.status==='待定时发布'&&new Date(c.scheduledAt)<=new Date()){c.status='已发布';c.publishedAt=now();archive(s,c);changed=true;s.audit.unshift({id:id('LOG'),action:'定时发布完成',role:'模拟调度器',tenant:c.tenant,time:now(),detail:c.title})}}if(changed)s.revision++;return changed;}
