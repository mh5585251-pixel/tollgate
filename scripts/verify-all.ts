import {spawnSync} from 'node:child_process';
const npm=process.env.npm_execpath;if(!npm)throw new Error('Run using npm run verify:all');
for(const task of ['typecheck','lint','test']){const r=spawnSync(process.execPath,[npm,'run',task],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);}
console.log('FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.');
