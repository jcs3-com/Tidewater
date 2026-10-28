import {execFileSync} from 'node:child_process';
// Build-time only. The public marker lets production be checked against GitHub.
function commit() {
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try { return execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(); }
  catch { return 'unavailable'; }
}
export const release = {version:'3.2.0', commit:commit()};
