// Opt-in OAuth uploader. Credentials stay in GitHub Actions secrets; never log
// token responses. Always restrict writes to the established project folder.
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename,resolve} from 'node:path';
const folder='1xKyJf-y_IuJa0dP_qTcdQgEsVgZJDUve';
const required=['GOOGLE_DRIVE_CLIENT_ID','GOOGLE_DRIVE_CLIENT_SECRET','GOOGLE_DRIVE_REFRESH_TOKEN'];
if(process.env.DRIVE_SYNC_ENABLED!=='1'){console.log('Drive synchronization disabled. No upload attempted.');process.exit(0);}
if(required.some(k=>!process.env[k]))throw new Error(`Configure all required GitHub secrets: ${required.join(', ')}`);
const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:process.env.GOOGLE_DRIVE_CLIENT_ID,client_secret:process.env.GOOGLE_DRIVE_CLIENT_SECRET,refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN,grant_type:'refresh_token'})});
if(!tokenResponse.ok)throw new Error(`Google OAuth refresh failed (${tokenResponse.status}); response withheld`);
const {access_token:token}=await tokenResponse.json();
if(!token)throw new Error('Google OAuth returned no access token');
const headers={Authorization:`Bearer ${token}`};
const api='https://www.googleapis.com/drive/v3';
async function json(url,init={}){const r=await fetch(url,{...init,headers:{...headers,...init.headers}});if(!r.ok)throw new Error(`Drive request failed (${r.status}); response withheld`);return r.json();}
const target=await json(`${api}/files/${folder}?fields=id,mimeType,capabilities(canAddChildren)`);
if(target.mimeType!=='application/vnd.google-apps.folder'||!target.capabilities?.canAddChildren)throw new Error('The established Drive folder is not writable');
const dir=resolve('release-archive');
const manifest=JSON.parse(readFileSync(resolve(dir,'release-manifest.json'),'utf8'));
// Stop before upload when the source isn't actually serving on production.
const deployed=await (await fetch('https://tidewater-6ik.pages.dev/release.json',{cache:'no-store'})).json();
if(deployed.commit!==manifest.commit)throw new Error('Production commit differs from this release; no Drive upload attempted');
const docs=['TIDEWATER_RELEASE_LOG.md','TIDEWATER_SITE_DESIGN_SYSTEM.md','asset-register.md','DRIVE_SYNC.md','QA_REPORT.md'];
const files=[...readdirSync(dir).filter(f=>f.endsWith('.zip')).map(f=>resolve(dir,f)),resolve(dir,'release-manifest.json'),...docs.map(f=>resolve('docs',f))];
const synced=[];
for(const path of files){
 const name=basename(path),bytes=readFileSync(path),mime=name.endsWith('.zip')?'application/zip':name.endsWith('.json')?'application/json':'text/markdown';
 const q=`'${folder}' in parents and trashed = false and name = '${name.replaceAll("'","\\'")}'`;
 const existing=await json(`${api}/files?${new URLSearchParams({q,fields:'files(id,name)',pageSize:'100'})}`);
 if(existing.files.length>1)throw new Error(`Duplicate target name ${name}; refusing ambiguous update`);
 const id=existing.files[0]?.id;
 if(id&&name.endsWith('.zip')){
  const known=await json(`${api}/files/${id}?fields=id,md5Checksum,parents`);
  if(known.md5Checksum!==createHash('md5').update(bytes).digest('hex'))throw new Error(`Immutable archive ${name} already exists with different bytes`);
 }else{
  const boundary='tidewater-release-boundary';
  const metadata={name,...(!id?{parents:[folder]}:{})};
  const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`,bytes,`\r\n--${boundary}--\r\n`]);
  const endpoint=`https://www.googleapis.com/upload/drive/v3/files${id?'/'+id:''}?uploadType=multipart&fields=id`;
  const result=await json(endpoint,{method:id?'PATCH':'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body});
  existing.files=[{id:result.id}];
 }
 const verified=await json(`${api}/files/${existing.files[0].id}?fields=id,name,size,md5Checksum,parents,webViewLink`);
 if(!verified.parents.includes(folder)||verified.md5Checksum!==createHash('md5').update(bytes).digest('hex'))throw new Error(`Upload readback mismatch: ${name}`);
 synced.push(verified);
}
writeFileSync(resolve(dir,'drive-sync-receipt.json'),JSON.stringify({synced_at:new Date().toISOString(),last_synced_commit:manifest.commit,verified_production_commit:deployed.commit,folder_id:folder,files:synced},null,2)+'\n');
console.log(`Verified ${synced.length} files in the established Drive folder for ${manifest.commit}`);
