# 🔐 Security Guide for HY3N

## Exposed Secret Fixed: Google Maps API Key

### What Was Fixed

The `VITE_GOOGLE_MAPS_API_KEY` was exposed to the frontend, making it visible to anyone in browser dev tools.

**Changes Made:**
1. ✅ Created `getGoogleMapsRoute` backend function to proxy Google Maps Directions API calls
2. ✅ Updated `GoogleTrackingMap.js` to use the backend proxy instead of direct API calls
3. ✅ Removed API key from frontend Google Maps SDK loading

### Next Steps: Secure Your Google Maps API Key

#### 1. Rename the Secret (IMPORTANT)

Go to **Dashboard → Settings → Environment Variables** and:

1. **Delete** `VITE_GOOGLE_MAPS_API_KEY`
2. **Add** `GOOGLE_MAPS_API_KEY` (without the `VITE_` prefix)
   - This ensures the key is only available server-side, not bundled into frontend code

#### 2. Restrict the Key in Google Cloud Console

Visit: https://console.cloud.google.com/apis/credentials

**For each API key:**

##### A. Application Restrictions
Choose one based on your deployment:

- **Websites (HTTP referrers)**: Add your domains
  - `https://your-domain.com/*`
  - `https://*.your-domain.com/*`
  - Add Base44 preview domain if using

- **Android apps**: Add your app's package name + SHA-1 signing certificate
  - Package name: `com.hy3n.app` (or your actual package)
  - SHA-1: Get from Google Play Console or your keystore

- **iOS apps**: Add your app's bundle ID
  - Bundle ID: `com.hy3n.app` (or your actual bundle ID)

##### B. API Restrictions
Select **"Restrict key"** and enable ONLY these APIs:

- ✅ **Maps JavaScript API** (for displaying maps)
- ✅ **Directions API** (for route calculation - used by backend)
- ✅ **Places API** (if using location search)
- ✅ **Geocoding API** (if converting addresses to coordinates)

**DO NOT enable:**
- ❌ Admin SDK APIs
- ❌ Billing APIs
- ❌ Any unrelated APIs

#### 3. Monitor Usage

Visit: https://console.cloud.google.com/apis/dashboard

- Set up **budget alerts** to get notified of unusual usage
- Review **API usage reports** weekly
- Check **error rates** for potential abuse

### Best Practices

1. **One key per environment**: Use separate keys for development, staging, and production
2. **Rotate keys regularly**: Change API keys every 90 days
3. **Never commit keys**: Keep secrets in environment variables only
4. **Use least privilege**: Only enable APIs that are actually needed
5. **Monitor quotas**: Set up billing alerts to catch abuse early

### Other Secrets Status

✅ **TWILIO_AUTH_TOKEN** - Server-side only (secure)
✅ **TWILIO_FROM_PHONE** - Server-side only (secure)
✅ **TWILIO_ACCOUNT_SID** - Server-side only (secure)
✅ **SOS_EMERGENCY_PHONE** - Server-side only (secure)
⚠️ **GOOGLE_MAPS_API_KEY** - Was exposed, now fixed with backend proxy

### Backend Functions Security Update

All backend functions now have proper authentication:

- ✅ `applyReferralCredit` - Requires authentication
- ✅ `autoMatchRides` - Admin-only (scheduled task)
- ✅ `generateInviteCode` - Requires authentication
- ✅ `getGoogleMapsRoute` - **NEW** - Requires authentication
- ✅ `getSurgePricing` - Requires authentication
- ✅ `onNewMessage` - Automation/service role
- ✅ `onRideCompleted` - Automation/service role
- ✅ `processCardPayment` - Requires authentication
- ✅ `processMoMoPayment` - Requires authentication
- ✅ `processMoMoWithdrawal` - Requires authentication
- ✅ `sendMessageNotification` - Automation/service role
- ✅ `triggerSOS` - Requires authentication

---

**Questions?** Check Google's official guide: https://developers.google.com/maps/api-security-best-practices