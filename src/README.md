# 🚗 HY3N - Ride Ghana Forward

Ghana's premium ride-hailing platform connecting riders with drivers for safe, reliable, and affordable transportation.

## 🌟 Features

### For Riders
- **Instant Booking** - Book rides with a few taps
- **Scheduled Rides** - Plan trips in advance
- **Real-time Tracking** - Track your driver live on the map
- **Multiple Payment Options** - Mobile Money, Cash, Card, Wallet
- **Ride Categories** - Standard, XL, Executive, Express Delivery
- **Split Fare** - Share costs with friends
- **SOS Emergency** - Instant emergency assistance
- **Ride History** - View all past trips
- **In-app Chat** - Message drivers securely
- **Push Notifications** - Stay updated on ride status

### For Drivers
- **Ride Requests** - Accept or decline ride requests
- **Earnings Dashboard** - Track income and performance
- **Online/Offline** - Toggle availability
- **Navigation** - Integrated turn-by-turn directions
- **Ride History** - Complete trip records
- **Withdrawal** - Cash out earnings via Mobile Money
- **Ratings** - Build your reputation
- **Scheduled Rides** - Plan ahead with bookings

### Admin Features
- **SOS Dashboard** - Monitor and respond to emergencies
- **Analytics** - Platform performance metrics
- **User Management** - Manage riders and drivers
- **Task Management** - Internal task tracking with Kanban board

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Maps**: Google Maps API
- **Backend**: Base44 Platform
- **Database**: Base44 Entities
- **Functions**: Deno Deploy
- **PWA**: Service Worker + Web App Manifest

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Base44 account

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

Required secrets (set in Base44 dashboard):
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_FROM_PHONE` - Twilio phone number
- `SOS_EMERGENCY_PHONE` - Emergency contact number
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

## 📱 PWA Features

HY3N is a Progressive Web App that can be installed on mobile devices:

1. Open the app in Chrome/Safari
2. Tap "Add to Home Screen"
3. Launch like a native app
4. Works offline (limited functionality)
5. Receives push notifications

## 🎨 Design System

### Colors
- **Gold**: `#D4AF37` (Primary brand color)
- **Green**: `#006B3F` (Success, rider actions)
- **Red**: `#CE1126` (Errors, SOS)
- **Black**: `#0A0A0A` (Background)

### Typography
- **Headings**: Outfit font family
- **Body**: Inter font family

### Icons
- Lucide React for all UI icons
- Custom SVG for brand elements

## 🔐 Security

- JWT-based authentication
- Auto-logout after 30 minutes of inactivity
- Protected routes for authenticated users
- Secure API calls with token refresh
- Error boundaries for graceful failures

## 📊 Analytics

The app tracks:
- Page views
- User actions (bookings, payments, etc.)
- Ride lifecycle events
- Error rates
- Performance metrics

View analytics in Base44 dashboard.

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## 📦 Deployment

The app is deployed on Base44 platform:

1. Push changes to main branch
2. Base44 auto-deploys
3. Monitor deployment in dashboard
4. Rollback if needed

## 🐛 Troubleshooting

### Common Issues

**App won't load**
- Clear browser cache
- Check console for errors
- Verify API keys are set

**Push notifications not working**
- Ensure HTTPS is enabled
- Check notification permissions
- Verify service worker registration

**Maps not loading**
- Check Google Maps API key
- Verify billing is enabled on Google Cloud
- Check API quotas

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For support:
- In-app: Go to Support section
- Email: support@hy3n.com.gh
- Phone: +233 XX XXX XXXX

## 🎯 Roadmap

### Q3 2026
- [ ] Multi-stop rides
- [ ] Ride pooling
- [ ] Driver incentives program
- [ ] Loyalty rewards

### Q4 2026
- [ ] Corporate accounts
- [ ] Package delivery expansion
- [ ] Voice navigation
- [ ] Advanced analytics

---

**Built with ❤️ in Ghana**
**Version**: 1.0.0
**Last Updated**: May 2026