import {createRequire} from 'node:module';import {join} from 'node:path';import {root} from '../packages/shared/src/index';
const require=createRequire(import.meta.url);const env={...process.env,AUDIT_MODE:process.env.AUDIT_MODE??'1',NEXT_TELEMETRY_DISABLED:'1'};
// concurrently is the requested three-process supervisor. Resolve binaries without relying on global npm.
const tsx=require.resolve('tsx/cli'),next=join(root,'node_modules/next/dist/bin/next');
const q=(s:string)=>'"'+s.replace(/"/g,'""')+'"';
const commands=[`${q(process.execPath)} ${q(next)} dev --webpack ${q(join(root,'apps/saas'))} -p 3000`,...['blr-02','fra-01'].map(id=>`${q(process.execPath)} ${q(tsx)} ${q(join(root,'apps/collector/src/main.ts'))} ${id}`)];
const concurrently=require('concurrently').default??require('concurrently');const result=concurrently(commands.map((command,i)=>({command,name:['saas','blr-02','fra-01'][i],env})),{killOthersOn:['failure','success'],prefix:'name'});
void result.result.catch(()=>{process.exitCode=1;});
