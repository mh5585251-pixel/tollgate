import {spawnSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';
const npm=process.env.npm_execpath;
if(!npm)throw new Error('Invoke with npm exec tsx scripts/gate.ts M<n>');
const milestone=process.argv[2]??'manual';
appendFileSync('VERIFICATION.md',`\n## ${milestone} — ${new Date().toISOString()}\n`);
for(const task of ['typecheck','lint','test','verify:all']){
 const r=spawnSync(process.execPath,[npm,'run',task],{encoding:'utf8',env:process.env});
 const output=(r.stdout??'')+(r.stderr??'');process.stdout.write(output);
 appendFileSync('VERIFICATION.md',`\n### npm run ${task}\n\n\`\`\`text\n${output.replace(/\u001b\[[0-9;]*m/g,'')}\nexit=${r.status}\n\`\`\`\n`);
 if(r.status!==0)process.exit(r.status??1);
}
