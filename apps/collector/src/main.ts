import {tenants} from '../../../packages/shared/src/index';import {CollectorRuntime} from './runtime';import {collectorServer} from './server';
const tenantId=process.env.COLLECTOR_ID??process.argv[2]??'blr-02';
const tenant=tenants.find(t=>t.collectorId===tenantId);if(!tenant)throw new Error(`Pass blr-02 or fra-01, or set COLLECTOR_ID (got ${tenantId})`);
const port=Number(process.env.PORT??tenant.port);const host=process.env.HOST??'0.0.0.0';
const c=new CollectorRuntime(tenant),app=collectorServer(c);await app.listen({port,host});c.start();console.log(`Collector ${tenant.collectorId} ready on ${host}:${port}; raw telemetry is local only.`);
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{void app.close().then(()=>process.exit(0));});
