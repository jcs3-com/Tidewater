# Release-to-Drive synchronization

## Current status — 2026-10-26

**Automatic synchronization is not active.** `.github/workflows/release-to-drive.yml` was installed in the repository through PR #1 and opts in only when repository variable `DRIVE_SYNC_ENABLED=1`. That variable is not set and the three Google OAuth secrets below are not configured, so every run is skipped. No credentials were guessed or extracted from connected apps.

The connected Google Drive app can independently upload this session's candidate documentation/archive. Those manual uploads do not configure GitHub Actions or establish continuous synchronization. See the session's `drive-sync-receipt.json` for actual uploaded IDs, checksums and source commit. Unpublished candidates must stay clearly labelled as such.

## Established destination

`37 Tidewater Advisory / 37.01 Website & Deployment`

https://drive.google.com/drive/folders/1xKyJf-y_IuJa0dP_qTcdQgEsVgZJDUve

The script hardcodes this folder to prevent accidental root-folder duplication. It preserves sharing. Documentation uses stable names; source ZIPs include the immutable Git SHA. Duplicate stable names cause a stop instead of an arbitrary overwrite.

## Exact credentials to configure

1. In a Google Cloud project, enable **Google Drive API**. Configure an OAuth consent screen for an account that can add files to the existing destination folder (the connected `james.c.simpson.iii@gmail.com` account has been used for this session's folder reads).
2. Create an OAuth 2.0 client (Desktop app for a one-time authorization utility, or Web app with its exact registered redirect URI). Use an offline authorization-code flow and request `https://www.googleapis.com/auth/drive`. This scope permits reading/updating existing files in the established folder; a narrower `drive.file` grant requires separately selecting that existing folder and each existing document for the same OAuth app. Obtain the refresh token with `access_type=offline` and consent when needed. Do not commit the code, token or client secret. External OAuth apps in Testing can issue short-lived refresh grants; use the appropriate production/internal consent configuration for unattended jobs.
3. Configure these **GitHub Actions repository secrets** on `jcs3-com/Tidewater`:
   - `GOOGLE_DRIVE_CLIENT_ID`: the OAuth client ID.
   - `GOOGLE_DRIVE_CLIENT_SECRET`: that client's secret.
   - `GOOGLE_DRIVE_REFRESH_TOKEN`: the offline refresh token for the authorized Drive account.
4. The reviewed workflow is already installed (PR #1); no further GitHub write step is needed.
5. Only after verifying the account can add children to the exact folder, set repository **variable** `DRIVE_SYNC_ENABLED=1`. This is not a secret. No separate folder variable is needed.
6. Run the workflow manually and inspect its verified receipt. Do not claim active synchronization before a successful run. Set `DRIVE_SYNC_ENABLED=0` to disable it again.

## What the workflow does

On an opted-in main push, published release or manual run: install locked dependencies, run checks/build, run browser tests, wait at most five minutes for the exact commit to appear at production `/release.json`, test actual production, create the tracked-source archive, upload/update documents and source, and verify each upload's MD5 and parent folder. The receipt records last synced commit versus the production marker. Credentials and OAuth error bodies are never logged. A failed build, different production commit, failed authentication, duplicate name or checksum mismatch stops synchronization.

The source snapshot is generated from the committed tree with an explicit file allowlist and a credential-pattern check. It excludes `.git`, actual `.env`/credential files, dependencies, build output and runtime/Airtable customer records; `.env.example` contains empty credential slots only. `npm run release:archive` produces a source ZIP and SHA-256 manifest under ignored `release-archive/`.

## Releasing the local candidate once access is restored

Use the archived Git bundle to recover `feat/tidewater-v2`, or apply the included patch onto baseline `c8dbde3138d2722ecf1e4fd2f1f01dcb914018e4`. Review and push the feature branch, open a PR to `main`, and merge after checks. The existing Cloudflare Pages check on baseline `main` succeeded for project `tidewater`; do not create a duplicate project. Verify the new check succeeds and production `/release.json` equals the intended source SHA. Test production before recording a deployment. Airtable production credentials must remain server-side; keep indexing/newsletter gates off until launch conditions are actually met.
