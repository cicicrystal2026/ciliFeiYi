import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {timingSafeEqual} from 'node:crypto';
import {seed,visible,apply,roles,tenants,metrics,tick} from './business.js';
const ROOT=path.dirname(fileURLToPath(import.meta.url));const PUBLIC=path.join(ROOT,'public');const DATA=process.env.DATA_DIR||path.join(ROOT,'.data');fs.mkdirSync(DATA,{recursive:true});
const authUser=process.env.DEMO_USER,authPassword=process.env.DEMO_PASSWORD;
if(Boolean(authUser)!==Boolean(authPassword))throw new Error('DEMO_USER 与 DEMO_PASSWORD 必须同时配置');
const expectedAuth=authUser?Buffer.from('Basic '+Buffer.from(authUser+':'+authPassword).toString('base64')):null;
const modules=JSON.parse(fs.readFileSync(path.join(PUBLIC,'requirements.json'),'utf8'));const catalog=JSON.parse(fs.readFileSync(path.join(PUBLIC,'catalog.json'),'utf8'));
const file=path.join(DATA,'state.json');let state;try{state=JSON.parse(fs.readFileSync(file,'utf8'))}catch{state=seed(modules)}
const persist=()=>{fs.writeFileSync(file+'.tmp',JSON.stringify(state,null,2));fs.renameSync(file+'.tmp',file)};persist();
const clients=new Set();function broadcast(){for(const res of clients)res.write(`data: ${JSON.stringify({revision:state.revision})}\n\n`)}
function send(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value))}
const actor=req=>({role:roles.includes(decodeURIComponent(req.headers['x-demo-role']||''))?decodeURIComponent(req.headers['x-demo-role']):'管理员',tenant:tenants.includes(decodeURIComponent(req.headers['x-demo-tenant']||''))?decodeURIComponent(req.headers['x-demo-tenant']):tenants[0]});
function body(req){return new Promise((resolve,reject)=>{let size=0,b=[];req.on('data',c=>{size+=c.length;if(size>8*1024*1024){reject(Object.assign(new Error('文件过大，Demo最多8MB'),{status:413}));req.destroy()}else b.push(c)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(b).toString()||'{}'))}catch{reject(Object.assign(new Error('无效JSON'),{status:400}))}});req.on('error',reject)})}
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.md':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{
 if(expectedAuth){const supplied=Buffer.from(req.headers.authorization||'');if(supplied.length!==expectedAuth.length||!timingSafeEqual(supplied,expectedAuth)){res.writeHead(401,{'WWW-Authenticate':'Basic realm="Cili Demo", charset="UTF-8"','Cache-Control':'no-store'});res.end('Demo access requires authentication');return}}
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});res.write('data: '+JSON.stringify({revision:state.revision})+'\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return}
 if(url.pathname==='/api/catalog')return send(res,200,{catalog,modules,roles,tenants});
 if(url.pathname==='/api/state')return send(res,200,{state:visible(state,actor(req)),metrics:metrics(state)});
 if(url.pathname==='/api/health')return send(res,200,{ok:true,demo:true,revision:state.revision,pages:catalog.length});
 if(url.pathname==='/api/action'&&req.method==='POST'){const input=await body(req);const a=actor(req);if(input.action==='reset'){if(a.role!=='管理员')return send(res,403,{error:'仅管理员可重置演示数据'});state=seed(modules);state.revision++;persist();broadcast();return send(res,200,{message:'已恢复初始演示数据',state:visible(state,a),metrics:metrics(state)})}
  const copy=structuredClone(state);const result=apply(copy,input,a);state=copy;persist();broadcast();return send(res,200,{...result,state:visible(state,a),metrics:metrics(state)})}
 if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'不支持的方法'});
 const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);const target=path.resolve(PUBLIC,'.'+relative);if(!target.startsWith(PUBLIC+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile())return send(res,404,{error:'文件不存在'});
 res.writeHead(200,{'Content-Type':MIME[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')res.end();else fs.createReadStream(target).pipe(res);
 }catch(e){send(res,e.status||500,{error:e.message})}});
const timer=setInterval(()=>{if(tick(state)){persist();broadcast()}for(const res of clients)res.write(': ping\n\n')},1500);timer.unref();
server.listen(Number(process.env.PORT||8769),process.env.HOST||'127.0.0.1',()=>console.log(`慈利全端Demo: http://${process.env.HOST||'127.0.0.1'}:${process.env.PORT||8769} · ${catalog.length}页面 · 仅模拟外部服务`));
