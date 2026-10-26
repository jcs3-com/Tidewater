import {release} from '../data/release';
export const GET = () => new Response(JSON.stringify(release), {
  headers: {'Content-Type':'application/json', 'Cache-Control':'no-cache'}
});
