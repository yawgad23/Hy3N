# Google Play Console - Asset Requirements Guide

## Required Assets for HY3N Rider App

### 1. App Icon
- **Size:** 512x512 pixels
- **Format:** PNG (no transparency)
- **File:** Use the HY3N logo
- **URL:** https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/6a5713202_ChatGPTImageMay19202602_18_57PM.png

### 2. Feature Graphic
- **Size:** 1024x500 pixels
- **Format:** PNG or JPG
- **Purpose:** Displays at the top of your store listing
- **URL:** https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/099a8d5c4_ChatGPTImageMay19202602_56_28PM.png

### 3. Screenshots (Phone)
- **Minimum:** 2 screenshots required
- **Size:** At least 320px on any side, no more than 3840px
- **Aspect ratio:** Up to 16:9
- **Format:** PNG or JPG
- **Recommended:** 1080x1920 (Full HD portrait)

**Your screenshots:**
- Register page: https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/f05c9bdda_Screenshot2026-05-19at14-37-40HY3NBase44.png
- Register page 2: https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/84d010c97_Screenshot2026-05-19at14-39-24HY3NBase44.png
- Register page 3: https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/762d04f3a_Screenshot2026-05-19at14-40-02HY3NBase44.png

### 4. Tablet Screenshots (Optional but Recommended)
- **Size:** At least 600px on any side
- **Format:** PNG or JPG
- **Upload to:** "Tablet" section in Google Play Console

---

## Store Listing Information

### App Details
- **App Name:** HY3N - Rider App
- **Package Name:** `com.hy3n.rider` (or your preferred unique identifier)
- **Short Description:** Book affordable, safe rides in Ghana
- **Full Description:** 
  ```
  HY3N Rider - Your ride, your way. Book affordable, safe rides across Ghana with real-time driver tracking, split fares, and premium transportation.

  Features:
  • Real-time driver tracking
  • Split fares with friends
  • Multiple payment options (Mobile Money, Cash, Card)
  • Scheduled rides
  • SOS emergency button
  • Loyalty rewards program
  • 24/7 support

  Safe, reliable, and affordable transportation at your fingertips.
  ```

### Category
- **Primary Category:** Maps & Navigation
- **Alternative:** Travel & Local

### Content Rating
- **Rating:** Everyone (no age restrictions)

### Contact Details
- **Email:** [Your support email]
- **Website:** [Your website URL]
- **Privacy Policy:** `https://your-domain.com/privacy` (in-app route: `/privacy`)

---

## Upload Steps

### Step 1: Create Google Play Console Account
1. Go to https://play.google.com/console
2. Sign up for a developer account
3. Pay the one-time $25 registration fee

### Step 2: Create New App
1. Click "Create app"
2. Select "App" (not Game)
3. Enter app name: "HY3N - Rider App"
4. Enter package name: `com.hy3n.rider` (must be unique, reverse domain notation)
5. Select default language: English (United States)

### Step 3: Complete Store Listing
1. **Graphics:**
   - Upload app icon (512x512)
   - Upload feature graphic (1024x500)
   - Upload phone screenshots (minimum 2)
   - Upload tablet screenshots (optional)

2. **App Details:**
   - Enter short description (80 characters max)
   - Enter full description (4000 characters max)
   - Select category: Maps & Navigation

3. **Content Rating:**
   - Complete the content rating questionnaire
   - Submit for rating

### Step 4: App Access
- Select "All or most functionality is available without signing in"
- Provide test credentials if needed (for admin review)

### Step 5: Pricing & Distribution
- **Price:** Free
- **Countries:** Select all countries or specific regions (Ghana, etc.)
- **Ads:** No ads

### Step 6: Release Production
1. Go to "Production" under "Testing and releases"
2. Click "Create new release"
3. Upload your Android App Bundle (AAB) or APK
4. Fill in release notes
5. Review and publish

---

## TWA (Trusted Web Activity) Setup

Since HY3N is a PWA, you'll need to wrap it as a TWA for Google Play:

### Option 1: Use Bubblewrap (Recommended)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-domain.com/manifest.json --package com.hy3n.rider
bubblewrap build
```

### Option 2: Use PWABuilder
1. Go to https://www.pwabuilder.com/
2. Enter your app URL: https://your-domain.com
3. Click "Build for Store"
4. Download the Android package
5. Upload to Google Play Console

### Required Files for TWA:
- `android/app/build.gradle` (app configuration)
- `android/settings.gradle` (project settings)
- `android/gradle.properties` (Gradle settings)
- Keystore file for signing (generate with `keytool`)

---

## Checklist Before Submission

- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG/JPG)
- [ ] Minimum 2 phone screenshots
- [ ] App name and descriptions written
- [ ] Privacy policy URL ready (e.g., `https://your-domain.com/privacy`)
- [ ] Contact email configured
- [ ] Content rating completed
- [ ] TWA/Android package built and signed
- [ ] Test the app thoroughly on multiple devices
- [ ] All backend functions working correctly
- [ ] Payment methods tested
- [ ] SOS button functionality verified

---

## Important Notes

1. **Review Time:** Google Play review typically takes 1-7 days
2. **Updates:** You can update your app anytime by creating a new release
3. **Testing:** Use Internal Testing track before Production release
4. **Compliance:** Ensure all features comply with Google Play policies
5. **Permissions:** Only request necessary permissions in your TWA
6. **Package Name:** Cannot be changed after first upload - choose carefully!
7. **Package Name Format:** Must be unique, use reverse domain (e.g., `com.company.appname`)

---

## Support Resources

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **TWA Documentation:** https://developer.chrome.com/docs/android/trusted-web-activity/
- **Bubblewrap GitHub:** https://github.com/GoogleChromeLabs/bubblewrap
- **PWABuilder:** https://www.pwabuilder.com/

---

**Last Updated:** May 19, 2026
**App Version:** 1.0.0