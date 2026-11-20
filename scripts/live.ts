import {spawn,spawnSync,type ChildProcess} from 'node:child_process';import {mkdtempSync,createWriteStream} from 'node:fs';import {join} from 'node:path';import {createRequire} from 'node:module';
import {root,tenants} from '../packages/shared/src/index';
const require=createRequire(import.meta.url);
export const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function until<T>(fn:()=>Promise<T>,test:(v:T)=>boolean,timeout=30000):Promise<T>{const end=Date.now()+timeout;let last:unknown;while(Date.now()<end){try{const value=await fn();last=value;if(test(value))return value;}catch(e){last=e;}await delay(250);}throw new Error('Timed out: '+(last instanceof Error?last.message:JSON.stringify(last)));}
export async function json(url:string,method='GET',body?:unknown,headers:Record<string,string>={}){const response=await fetch(url,{method,headers:{'content-type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`${url} HTTP ${response.status}: ${await response.text()}`);return response.json();}
export class Live {
 dataDir:string;children=new Map<string,ChildProcess>();cookies=new Map<string,string>();
 constructor(){this.dataDir=mkdtempSync(join(root,'work','live-'));}
 launch(name:string,args:string[],cwd=root){const log=createWriteStream(join(this.dataDir,name+'.log'),{flags:'a'});const child=spawn(process.execPath,args,{cwd,env:{...process.env,DATA_DIR:this.dataDir,AUDIT_MODE:'1',NEXT_TELEMETRY_DISABLED:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout?.pipe(log);child.stderr?.pipe(log);this.children.set(name,child);return child;}
 async start(){try{const res=await fetch('http://127.0.0.1:3000/api/ready',{signal:AbortSignal.timeout(700)});if(res.ok)throw new Error('Port 3000 is in use. Stop npm run dev before isolated verification.');}catch(e){if(e instanceof Error&&e.message.includes('in use'))throw e;}
 this.launch('saas',[join(root,'node_modules/next/dist/bin/next'),'dev','--webpack',join(root,'apps/saas'),'-p','3000']);await until(()=>json('http://127.0.0.1:3000/api/ready'),v=>v.ready,45000);for(const t of tenants){this.startCollector(t.collectorId);await until(()=>json(`http://127.0.0.1:${t.port}/api/queue`),()=>true,20000);}await until(()=>this.saas('/api/metadata'),v=>v.payloads.length>0,20000);return this;}
 startCollector(id:string){this.launch(id,[require.resolve('tsx/cli'),join(root,'apps/collector/src/main.ts'),id]);}
 stopProcess(name:string){const child=this.children.get(name);if(!child?.pid)return;if(process.platform==='win32')spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});else child.kill('SIGKILL');this.children.delete(name);}
 async saas(path:string,tenantId='acme-ind',method='GET',body?:unknown){if(!this.cookies.has(tenantId)){const res=await fetch('http://127.0.0.1:3000/api/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tenantId,role:'operator'})});this.cookies.set(tenantId,res.headers.get('set-cookie')?.split(';')[0]??'');}return json('http://127.0.0.1:3000'+path,method,body,{cookie:this.cookies.get(tenantId)!});}
 collector(path:string,method='GET',body?:unknown,id='blr-02'){const t=tenants.find(t=>t.collectorId===id)!;return json(`http://127.0.0.1:${t.port}`+path,method,body);}
 stop(){for(const key of [...this.children.keys()].reverse())this.stopProcess(key);}
}
export async function withLive<T>(fn:(live:Live)=>Promise<T>){const {mkdirSync}=await import('node:fs');mkdirSync(join(root,'work'),{recursive:true});const live=new Live();try{await live.start();return await fn(live);}finally{live.stop();}}
