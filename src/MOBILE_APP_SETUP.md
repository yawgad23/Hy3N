# HY3N Mobile App - Capacitor Setup Guide

## Prerequisites
```bash
npm install -g @ionic/cli
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

## Step 1: Initialize Capacitor
```bash
npx cap init
# Name: HY3N Rider
# ID: com.hy3n.rider
```

## Step 2: Build the App
```bash
npm run build
```

## Step 3: Add Platforms
```bash
npx cap add android
npx cap add ios
```

## Step 4: Sync Code
```bash
npx cap sync
```

## Step 5: Open in Native IDEs
**Android:**
```bash
npx cap open android
```
- Opens in Android Studio
- Build → Run on device/emulator
- Generate signed APK for Play Store

**iOS:**
```bash
npx cap open ios
```
- Opens in Xcode
- Sign with Apple Developer account
- Archive → Distribute for App Store

## App Store Assets

### Icons Needed:
- **Android:** 512x512 (Play Store), 192x192, 144x144, 96x96, 72x72, 48x48
- **iOS:** 1024x1024 (App Store), 180x180, 120x120, 87x87, 80x80, 60x60, 40x40, 20x20

### Splash Screens:
- **Android:** 2732x2732 (universal)
- **iOS:** 2732x2732 (universal)

## Play Store Listing
- **Title:** HY3N - Your Ride, Your Way
- **Short Description:** Book safe rides in Ghana
- **Category:** Travel & Local
- **Content Rating:** Everyone
- **Screenshots:** 2-8 images (1080x1920 recommended)

## App Store Listing
- **Name:** HY3N Ride Booking
- **Subtitle:** Safe rides in Ghana
- **Category:** Travel
- **Age Rating:** 4+
- **Screenshots:** 6.5" and 5.5" displays required

## Privacy Policy
Already available at: `/privacy`

## Contact
- **Support Email:** support@hy3n.com
- **Website:** https://hy3n.com

## Testing
1. Test on real devices (Android + iOS)
2. Test offline mode
3. Test push notifications
4. Test payment flows
5. Test GPS tracking accuracy

## Publishing Checklist
- [ ] App icons for all sizes
- [ ] Splash screens
- [ ] Screenshots for stores
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Support contact info
- [ ] App descriptions written
- [ ] Keywords for ASO
- [ ] Test on multiple devices
- [ ] Performance optimization
- [ ] Security audit complete