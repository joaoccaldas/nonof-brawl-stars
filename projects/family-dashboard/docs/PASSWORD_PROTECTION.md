# Family Dashboard — Password Protection Setup

## Goal: Private Family Dashboard with GitHub Pages

GitHub Pages is public by default. We add **Cloudflare Access** (free tier) for password protection.

## Architecture

```
User → Cloudflare (auth check) → GitHub Pages
              ↓
         Password gate
         (family-only)
```

## Setup Steps

### 1. Prerequisites
- Domain: `caldas.family` (or subdomain `dashboard.caldas.family`)
- Cloudflare account (free): https://dash.cloudflare.com

### 2. Add Domain to Cloudflare
1. Sign up / log in to Cloudflare
2. Click "Add a Site"
3. Enter your domain (e.g., `caldas.family`)
4. Follow DNS import steps
5. Change nameservers at your registrar to Cloudflare's

### 3. Create GitHub Pages Site
```bash
# In family-dashboard repo
npm run build
# Output goes to /dist

# Push to gh-pages branch or use GitHub Actions
git subtree push --prefix dist origin gh-pages
```

### 4. Configure Cloudflare Access (Zero Trust)
1. Go to Cloudflare Dashboard → Zero Trust → Access → Applications
2. Click "Add an application"
3. Select "Self-hosted"
4. Configure:
   - Application name: `Family Dashboard`
   - Session duration: `24 hours`
   - Domain: `dashboard.caldas.family` (or `family.caldas.family`)
   - Leave subdomain blank if using apex

### 5. Create Authentication Policy
1. Under "Identity providers": Select "One-time PIN" (email-based)
2. Click "Add a policy"
3. Policy name: `Family Access`
4. Action: `Allow`
5. Include: `Emails` → add family emails:
   - joao@caldas.family (you)
   - linn@caldas.family (Linn)
   - Add kids when they have email
6. Save

### 6. Configure DNS
In Cloudflare DNS:
```
Type: CNAME
Name: dashboard (or @ for apex)
Target: YOUR_USERNAME.github.io
Proxy status: Orange cloud (Proxied) ← CRITICAL
TTL: Auto
```

### 7. Enable GitHub Pages
1. Go to repo Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / (root)
4. Custom domain: `dashboard.caldas.family`
5. Enforce HTTPS: ✅

### 8. Test
- Visit `https://dashboard.caldas.family`
- Should see Cloudflare login page
- Enter family email → get one-time PIN
- Access dashboard!

## Alternative: Simple Password (Less Secure)

If Cloudflare feels like overkill, use **staticrypt**:

```bash
npm install -g staticrypt
staticrypt dist/index.html -p FAMILY_SECRET_PASSWORD -o dist/index.html
```

Deploy encrypted HTML. Anyone with password can view.

**Downside**: Single shared password, no audit trail.

## Recommended: Cloudflare Access

- Individual family member accounts
- Audit log (who accessed when)
- Works on all devices
- Free tier: 50 users, unlimited logins

## Family Onboarding

1. Send Linn the URL: `dashboard.caldas.family`
2. She enters her email → receives PIN
3. First login: bookmark, set browser to remember
4. Repeat for kids when ready

## Maintenance

- Add/remove family members in Cloudflare Access policies
- Review audit logs monthly (who accessed)
- Rotate emergency contact if needed
