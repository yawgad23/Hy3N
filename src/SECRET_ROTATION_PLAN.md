# 🔐 Secret Rotation Plan for HY3N

## Exposed Secrets Identified

### 1. ⚠️ VITE_GOOGLE_MAPS_API_KEY (CRITICAL)
**Status:** EXPOSED - Visible in frontend JavaScript bundle
**Risk:** Anyone can view in browser DevTools, potentially use your quota

**Action Required:**
1. ✅ **Already Fixed:** Created `getGoogleMapsRoute` backend function
2. ⏳ **Pending:** Rename in Dashboard → Settings → Environment Variables
   - Delete: `VITE_GOOGLE_MAPS_API_KEY`
   - Add: `GOOGLE_MAPS_API_KEY` (same value, different name)
3. ⏳ **Pending:** Rotate the key in Google Cloud Console
   - Generate new API key
   - Update the `GOOGLE_MAPS_API_KEY` secret
   - Delete old key in Google Cloud Console

### 2. ⚠️ TWILIO Credentials (MEDIUM)
**Status:** Server-side only (secure)
**Risk:** Low - not exposed to frontend

**Best Practice:** Rotate every 90 days
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`

**Action:** Schedule rotation quarterly

### 3. ⚠️ SOS_EMERGENCY_PHONE (LOW)
**Status:** Server-side only (secure)
**Risk:** Low - this is just a phone number, not a secret key

**Action:** No rotation needed

---

## Immediate Actions (Do Now)

### Step 1: Secure Google Maps API Key

**A. Rename the Environment Variable**
1. Go to Dashboard → Settings → Environment Variables
2. Delete `VITE_GOOGLE_MAPS_API_KEY`
3. Add `GOOGLE_MAPS_API_KEY` with the same value

**B. Rotate the Key (Recommended)**
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create a NEW API key
3. Apply restrictions (see below)
4. Update `GOOGLE_MAPS_API_KEY` secret with new key
5. Delete the old key

**C. Apply Restrictions in Google Cloud Console**

For the new key:
- **Application Restrictions:** HTTP referrers
  - Add your production domain: `https://your-domain.com/*`
  - Add Base44 preview domain if applicable
- **API Restrictions:** Restrict key
  - ✅ Maps JavaScript API
  - ✅ Directions API
  - ❌ Disable all other APIs

### Step 2: Verify Fix

After renaming, check the browser console:
```javascript
// Should return undefined (not your API key!)
import.meta.env.VITE_GOOGLE_MAPS_API_KEY
```

---

## Ongoing Security Practices

### Quarterly Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Due |
|--------|-------------------|--------------|----------|
| GOOGLE_MAPS_API_KEY | Every 90 days | [Date] | [Date + 90] |
| TWILIO_ACCOUNT_SID | Every 90 days | [Date] | [Date + 90] |
| TWILIO_AUTH_TOKEN | Every 90 days | [Date] | [Date + 90] |
| SOS_EMERGENCY_PHONE | As needed | N/A | N/A |

### Monitoring

1. **Google Maps Usage:**
   - https://console.cloud.google.com/apis/api/maps.googleapis.com/overview
   - Set budget alerts at $50, $100, $200

2. **Twilio Usage:**
   - https://console.twilio.com/usage
   - Monitor SMS/MMS usage monthly

3. **Base44 Secrets:**
   - Review Dashboard → Settings → Environment Variables monthly
   - Ensure no new `VITE_` prefixed secrets are added

---

## Security Checklist

- [x] Backend proxy created for Google Maps API
- [ ] Rename `VITE_GOOGLE_MAPS_API_KEY` → `GOOGLE_MAPS_API_KEY`
- [ ] Generate new Google Maps API key
- [ ] Apply restrictions to new key
- [ ] Update secret with new key
- [ ] Delete old Google Maps key
- [ ] Verify no `VITE_` secrets in browser console
- [ ] Set up Google Maps budget alerts
- [ ] Schedule quarterly secret rotation reminders

---

## Emergency Response

If you suspect a key has been compromised:

1. **Immediately revoke** the key in the provider's console
2. **Generate a new key** with proper restrictions
3. **Update the secret** in Base44 Dashboard
4. **Monitor usage** for any unauthorized activity
5. **Review logs** for suspicious patterns

---

**Questions?** Refer to: https://developers.google.com/maps/api-security-best-practices