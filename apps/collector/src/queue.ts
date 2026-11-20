import Database from 'better-sqlite3';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import type {EgressAuditRecord,LocalOutageQueue} from '../../../packages/shared/src/index';
export class OutageQueue implements LocalOutageQueue {
 db:Database.Database;
 constructor(path:string){if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});this.db=new Database(path);this.db.pragma('journal_mode = WAL');this.db.pragma('synchronous = FULL');this.db.exec('CREATE TABLE IF NOT EXISTS egress(payload_id TEXT PRIMARY KEY,seq INTEGER UNIQUE NOT NULL,record TEXT NOT NULL,acked_at TEXT); CREATE TABLE IF NOT EXISTS local_state(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS guard_violations(at TEXT,detail TEXT); CREATE TABLE IF NOT EXISTS raw_events(event_id TEXT PRIMARY KEY,at TEXT,event TEXT,trace TEXT); CREATE TABLE IF NOT EXISTS scenario_runs(run_id TEXT PRIMARY KEY,record TEXT); CREATE TABLE IF NOT EXISTS planted(value TEXT PRIMARY KEY);');}
 enqueue(record:EgressAuditRecord){if(!record.guard.passed)throw new Error('guard_failed');this.db.prepare('INSERT INTO egress(payload_id,seq,record) VALUES(?,?,?)').run(record.payloadId,record.seq,JSON.stringify(record));}
 records(limit=100):EgressAuditRecord[]{return (this.db.prepare('SELECT record FROM egress ORDER BY seq DESC LIMIT ?').all(limit) as {record:string}[]).map(r=>JSON.parse(r.record));}
 get(id:string):EgressAuditRecord|undefined{const row=this.db.prepare('SELECT record FROM egress WHERE payload_id=?').get(id) as {record:string}|undefined;return row?JSON.parse(row.record):undefined;}
 nextBatch(limit:number):EgressAuditRecord[]{return (this.db.prepare('SELECT record FROM egress WHERE acked_at IS NULL ORDER BY seq LIMIT ?').all(limit) as {record:string}[]).map(x=>JSON.parse(x.record));}
 save(record:EgressAuditRecord){this.db.prepare('UPDATE egress SET record=? WHERE payload_id=?').run(JSON.stringify(record),record.payloadId);}
 markAcked(id:string,at:Date){const r=this.get(id);if(!r)throw new Error('unknown record');r.ackedAt=at.toISOString();this.db.prepare('UPDATE egress SET record=?,acked_at=? WHERE payload_id=?').run(JSON.stringify(r),r.ackedAt,id);}
 depth(){return (this.db.prepare('SELECT count(*) n FROM egress WHERE acked_at IS NULL').get() as {n:number}).n;}
 oldestAgeMs(){const row=this.db.prepare('SELECT record FROM egress WHERE acked_at IS NULL ORDER BY seq LIMIT 1').get() as {record:string}|undefined;return row?Date.now()-Date.parse(JSON.parse(row.record).createdAt):0;}
 sentIds(){return (this.db.prepare('SELECT payload_id FROM egress ORDER BY seq').all() as {payload_id:string}[]).map(x=>x.payload_id);}
 state<T>(key:string,fallback:T):T{const r=this.db.prepare('SELECT value FROM local_state WHERE key=?').get(key) as {value:string}|undefined;return r?JSON.parse(r.value):fallback;}
 setState(key:string,value:unknown){this.db.prepare('INSERT INTO local_state VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,JSON.stringify(value));}
 close(){this.db.close();}
}
