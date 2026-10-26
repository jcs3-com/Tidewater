import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

const root=resolve(new URL('..',import.meta.url).pathname);
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const sha=git('rev-parse','HEAD');
const version=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8')).version;
const tracked=git('ls-tree','-r','--name-only',sha).split('\n');
const allowed=/^(src\/|public\/|functions\/|worker\/|scripts\/|tests\/|seed\/|docs\/|\.github\/workflows\/|README\.md$|LAUNCH_CHECKLIST\.md$|package(?:-lock)?\.json$|astro\.config\.mjs$|playwright\.config\.mjs$|tsconfig\.json$|\.gitignore$|\.env\.example$)/;
const files=tracked.filter(p=>allowed.test(p));
const privateName=/(^|\/)(?:\.env(?:\..+)?|\.dev\.vars|credentials[^/]*|[^/]+\.(?:pem|key|p12|pfx))$/i;
const secretValue=/(?:gh[pousr]_[A-Za-z0-9]{24,}|github_pat_[A-Za-z0-9_]{40,}|AIza[A-Za-z0-9_-]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
for(const path of files){
 if(path!=='.env.example'&&privateName.test(path))throw new Error(`Refusing private file: ${path}`);
 const bytes=execFileSync('git',['show',`${sha}:${path}`],{cwd:root,maxBuffer:32*1024*1024});
 if(!/\.(?:png|jpg|jpeg|webp|woff2)$/.test(path)&&secretValue.test(bytes.toString('utf8')))throw new Error(`Possible credential in ${path}; archive stopped`);
}
const destination=resolve(process.env.RELEASE_OUTPUT_DIR||resolve(root,'release-archive'));
mkdirSync(destination,{recursive:true});
const name=`Tidewater-v${version}-${sha}.zip`;
execFileSync('git',['archive','--format=zip',`--prefix=Tidewater-${sha}/`,`--output=${resolve(destination,name)}`,sha,'--',...files],{cwd:root});
const checksum=createHash('sha256').update(readFileSync(resolve(destination,name))).digest('hex');
writeFileSync(resolve(destination,'release-manifest.json'),JSON.stringify({version,commit:sha,source:'https://github.com/jcs3-com/Tidewater',production:'https://tidewater-6ik.pages.dev/',archive:name,sha256:checksum,files:files.length,excludes:'Git history, environment files (except empty example), dependencies, build output, runtime data and credentials'},null,2)+'\n');
console.log(JSON.stringify({archive:resolve(destination,name),commit:sha,sha256:checksum,files:files.length}));
