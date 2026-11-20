import {tenants} from '../../../packages/shared/src/index';import {CollectorRuntime} from './runtime';import {collectorServer} from './server';
const tenant=tenants.find(t=>t.collectorId===process.argv[2]);if(!tenant)throw new Error('Pass blr-02 or fra-01');
const c=new CollectorRuntime(tenant),app=collectorServer(c);await app.listen({port:tenant.port,host:'127.0.0.1'});c.start();console.log(`Collector ${tenant.collectorId} ready on 127.0.0.1:${tenant.port}; raw telemetry is local only.`);
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{void app.close().then(()=>process.exit(0));});
