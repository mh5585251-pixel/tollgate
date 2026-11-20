import {thresholds,type MetricName} from './index';
export interface Baseline {n:number;mean:number;dev:number;consecutive:number;active:boolean}
/** Scores use the last accepted baseline. Candidate/active anomalies do not contaminate it. See DECISIONS.md. */
export class EwmaDetector {
 states=new Map<string,Baseline>();
 sample(source:string,metric:MetricName,x:number){const key=source+':'+metric;const s=this.states.get(key)??{n:0,mean:x,dev:0,consecutive:0,active:false};const baseline=s.mean;const score=Math.abs(x-baseline)/Math.max(1.4826*s.dev,thresholds.floor[metric]);const warm=s.n>=thresholds.warmup;let raised=false,cleared=false;
 if(warm&&score>=thresholds.raise){s.consecutive++;if(s.consecutive>=thresholds.consecutive&&!s.active){s.active=true;raised=true;}}
 else {s.consecutive=0;if(s.active&&score<thresholds.clear){s.active=false;cleared=true;}}
 if(!warm||(!s.active&&s.consecutive===0)){s.mean=0.2*x+0.8*s.mean;s.dev=0.2*Math.abs(x-s.mean)+0.8*s.dev;}
 s.n++;this.states.set(key,s);return {score,baseline,raised,cleared,active:s.active,warm};}
 dump(){return [...this.states.entries()];}load(rows:Array<[string,Baseline]>){this.states=new Map(rows);}
}
