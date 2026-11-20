import {createReadStream} from 'node:fs';
import {createInterface} from 'node:readline';
import type {Readable} from 'node:stream';
import {config,metricName,sha256,type RawTelemetryEvent,type Tenant} from '../../shared/src/index';
import {mulberry32} from './prng';
export {mulberry32};
export const scenarioIds=['secret_in_log','saas_outage_replay','failed_logins','latency_spike','cpu_anomaly','multi_alert_incident','dup_out_of_order','remediation_flow'] as const;
export type ScenarioId=typeof scenarioIds[number];
export const seed=Number(process.env.SIM_SEED??1337);
const baselines={cpu_pct:35,mem_pct:48,disk_pct:54,bw_mbps:22,latency_ms:40,loss_pct:0.1,conn_up:1};
export function generate(tenant:Tenant,tick:number,at:string,simSeed=seed):RawTelemetryEvent[]{const random=mulberry32(simSeed+tick*7919+(tenant.collectorId==='blr-02'?0:97));return ['gw-02','srv-01','db-01'].map((host,i)=>({eventId:`${tenant.collectorId}-${tick}-${i}`,kind:'metric',observedAt:at,sourceTz:tenant.sourceTz,source:{host,ip:`10.20.${i}.4`,deviceType:i===0?'gateway':'server'},fields:Object.fromEntries(Object.entries(baselines).map(([k,v])=>[k,k==='conn_up'?v:Number((v+(random()-0.5)*(k==='loss_pct'?0.02:0.8)).toFixed(4))])),tags:{}}));}
export function plantedValues(runId:string):string[]{const n=sha256(runId).slice(0,8);return [`TG-CANARY-${n}`,`sk-demo-${n}-AbC9xY7qP4nR2mK8`, `eyJhbGciOiJIUzI1NiJ9.${n}payload.signature${n}`,`person-${n}@example.test`,`203.0.113.42`,`2001:db8:85a3::8a2e:370:7334`,`4111 1111 1111 1111`,`pass-${n}-Strong9!`,`user-${n}`,`p9Q8n7F6r5T4v3X2w1Z0${n}`,`AKIA${n.toUpperCase()}ABCD1234`,`https://private.example.test/${n}`];}
export function inject(id:ScenarioId,tenant:Tenant,runId:string,at:string):RawTelemetryEvent[]{const base=generate(tenant,Number.parseInt(sha256(runId).slice(0,6),16),at);const secret=plantedValues(runId);if(id==='secret_in_log')return [{...base[0],kind:'syslog',eventId:runId,rawLine:`api_key=${secret[1]} Bearer ${secret[2]} email=${secret[3]} ${secret[0]} ip=${secret[4]} ipv6=${secret[5]} card=${secret[6]} password=${secret[7]} user=${secret[8]} token=${secret[9]} aws=${secret[10]} url=${secret[11]}`,fields:{api_key:secret[1],email:secret[3],ip:secret[4],password:secret[7]},tags:{planted:'secret'}}];
 if(id==='failed_logins')return Array.from({length:8},(_,i)=>({...base[1],eventId:`${runId}-${i}`,kind:'auth' as const,rawLine:`auth failed username=${secret[8]} ip=${secret[4]}`,fields:{success:false,username:secret[8],ip:secret[4]},tags:{planted:'pii' as const}}));
 if(id==='latency_spike')base[0].fields.latency_ms=190;
 if(id==='cpu_anomaly')base[1].fields.cpu_pct=88;
 if(id==='multi_alert_incident'){base[0].fields.latency_ms=190;base[1].fields.loss_pct=4;return [...base,...inject('failed_logins',tenant,runId,at)];}
 return base.map((e,i)=>({...e,eventId:`${runId}-${i}`}));}

export interface OrganizerMapping {fields:{eventId?:string;kind?:string;observedAt?:string;sourceTz?:string;host:string;ip?:string;deviceType?:string;rawLine?:string};metrics:Partial<Record<string,string>>;auth?:{success:string;username?:string;ip?:string}}
function get(row:unknown,path?:string):unknown{return path?.split('.').reduce((v:any,k)=>v?.[k],row);}
/** Mapping is configuration, never an inferred organizer schema. Invalid rows fail explicitly. */
export class OrganizerStreamAdapter {
 constructor(readonly mapping:OrganizerMapping=config('organizer.mapping'),readonly now:()=>Date=()=>new Date()){}
 normalize(row:unknown):RawTelemetryEvent{const f=this.mapping.fields;const host=get(row,f.host);if(typeof host!=='string'||!host)throw new Error('organizer: configured host field is missing');const observed=get(row,f.observedAt);const at=typeof observed==='string'?new Date(observed):this.now();if(!Number.isFinite(at.getTime()))throw new Error('organizer: invalid timestamp');const fields:RawTelemetryEvent['fields']={};for(const [metric,path]of Object.entries(this.mapping.metrics)){metricName.parse(metric);const value=get(row,path);if(typeof value!=='number'||!Number.isFinite(value))throw new Error(`organizer: invalid ${metric}`);fields[metric]=value;}if(this.mapping.auth){for(const [k,path]of Object.entries(this.mapping.auth)){const v=get(row,path);if(['string','number','boolean'].includes(typeof v))fields[k]=v as string|number|boolean;}}const rawLine=get(row,f.rawLine);const kind=get(row,f.kind)??'metric';if(!['metric','syslog','auth','flow','snmp','app'].includes(String(kind)))throw new Error('organizer: invalid kind');return {eventId:String(get(row,f.eventId)??sha256(JSON.stringify(row)).slice(0,24)),kind:kind as RawTelemetryEvent['kind'],observedAt:at.toISOString(),sourceTz:String(get(row,f.sourceTz)??'UTC'),source:{host,ip:get(row,f.ip) as string|undefined,deviceType:String(get(row,f.deviceType)??'unknown')},rawLine:typeof rawLine==='string'?rawLine:undefined,fields,tags:{}};}
 async *jsonl(stream:Readable):AsyncGenerator<RawTelemetryEvent>{for await(const line of createInterface({input:stream,crlfDelay:Infinity})){if(line.trim())yield this.normalize(JSON.parse(line));}}
 file(path:string){return this.jsonl(createReadStream(path));}
 stdin(){return this.jsonl(process.stdin);}
 async *sse(url:string,signal?:AbortSignal):AsyncGenerator<RawTelemetryEvent>{const response=await fetch(url,{signal});if(!response.ok||!response.body)throw new Error(`organizer SSE ${response.status}`);const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true}).replace(/\r\n/g,'\n');let end;while((end=buffer.indexOf('\n\n'))>=0){const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);const data=frame.split('\n').filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trimStart()).join('\n');if(data)yield this.normalize(JSON.parse(data));}}}
}
