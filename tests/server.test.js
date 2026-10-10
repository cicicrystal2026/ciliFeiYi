import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

test('域名访问保护、健康接口、静态文件和失败操作回滚',async()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cili-server-check-'));
 const port=18769,base=`http://127.0.0.1:${port}`;
 const child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:dir,DEMO_USER:'test',DEMO_PASSWORD:'test-only-password'},windowsHide:true,stdio:'pipe'});
 const headers={Authorization:'Basic '+Buffer.from('test:test-only-password').toString('base64')};
 try {
  let ready=false;
  for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health',{headers})).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,50))}
  assert.ok(ready,'服务未启动');
  assert.equal((await fetch(base)).status,401);
  assert.equal((await fetch(base,{headers:{Authorization:'Basic invalid'}})).status,401);
  assert.equal((await (await fetch(base+'/api/health',{headers})).json()).pages,185);
  assert.equal((await fetch(base+'/pages/124.html',{headers})).status,200);
  assert.equal((await fetch(base+'/server.js',{headers})).status,404);
  assert.equal((await fetch(base+'/.data/state.json',{headers})).status,404);
  const before=await (await fetch(base+'/api/state',{headers})).json();
  const failed=await fetch(base+'/api/action',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({action:'publishContent',data:{id:'C01'}})});
  assert.ok(failed.status>=400);
  const after=await (await fetch(base+'/api/state',{headers})).json();
  assert.equal(after.state.revision,before.state.revision);
 } finally {child.kill()}
});
