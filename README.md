

# RubberTapAI - Rubber Tree Management Application

RubberTapAI is a comprehensive mobile application built with React Native and Expo that enables rubber plantation owners and managers to efficiently manage their rubber tree operations, track measurements, monitor weather conditions, and process payments.

## Features

- 🌳 **Tree Management** - Register and track rubber tree plots with detailed information
- 📏 **Tree Measurement** - Use camera-based measurement tools to track tree health and dimensions
- 💰 **Payment Processing** - Integrated payment system for transactions and subscriptions
- 🌤️ **Weather Integration** - Real-time weather forecasts and current conditions for better planning
- 💬 **Messaging** - In-app communication system for users
- 📊 **Reports** - Generate detailed reports on tree metrics and performance
- 🏷️ **Product Management** - Track rubber products and inventory
- 🔐 **User Authentication** - Secure login and registration system
- 📍 **Location Services** - GPS-based location tracking for plots
- 🎨 **Dark/Light Theme** - Customizable app appearance

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Routing**: Expo Router (File-based routing)
- **Styling**: TailwindCSS with NativeWind
- **State Management**: React Context & Hooks
- **Backend**: Appwrite
- **Build Tool**: EAS Build

## 🎬 DEMO

Watch the application in action:

https://github.com/user-attachments/assets/1e90d04d-68ce-4f23-a761-847d1777e1ae

## Project Structure

```
src/
├── action/          # Redux-like actions
├── app/             # App navigation and screens
├── components/      # Reusable UI components
├── contexts/        # React Context providers
├── global/          # Global utilities
├── hooks/           # Custom React hooks
├── lib/             # External library integrations
├── services/        # API and service integrations
└── utils/           # Utility functions
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

## Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd RubberTapAI_Expo
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables (create `.env` file if needed)

## Getting Started

1. Start the development server

   ```bash
   npx expo start
   ```

2. Choose your development environment:
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator (macOS only)
   - Press `w` for Web
   - Scan QR code with Expo Go app on your mobile device

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Build and run on Android
- `npm run ios` - Build and run on iOS (macOS only)
- `npm run web` - Run on web
- `npm run reset-project` - Reset to a clean project state

## Building for Production

### Using EAS Build

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

### Local Build

```bash
eas local-build --platform android
```

## Key Screens

- **Authentication** - Login and registration screens
- **Dashboard** - Main landing page with quick actions
- **Camera** - Tree measurement capture interface
- **History** - View historical data for plots and trees
- **Messages** - In-app messaging interface
- **Settings** - User preferences and app configuration

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React Native)             │
│  ┌──────────────────┬──────────────────┬──────────────────┐ │
│  │  UI Components   │  Screens/Routes  │  Context API     │ │
│  │  (Reusable)      │  (File-based)    │  (State Mgmt)    │ │
│  └──────────────────┴──────────────────┴──────────────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              SERVICE LAYER (Business Logic)                  │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┤
│  │ Auth Service │ API Services │ Camera Svcs  │ Weather API  │
│  │              │              │              │              │
│  │ User Actions │ Data Fetching│ Frame Process│ Real-time    │
│  └──────────────┴──────────────┴──────────────┴──────────────┘
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              BACKEND LAYER (Appwrite)                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┤
│  │ Auth         │ Database     │ Storage      │ Real-time    │
│  │ Management   │ (Collections)│ (Files/Imgs) │ (WebSocket)  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│         EXTERNAL SERVICES & DATA SOURCES                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┤
│  │ Weather API  │ Maps/GPS     │ Payment Gway │ File Procs   │
│  │              │              │              │              │
│  │ Real-time    │ Location Data│ Transactions │ Image Comp   │
│  └──────────────┴──────────────┴──────────────┴──────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Module Architecture

```
RubberTapAI_Expo/
├── src/
│   ├── app/                    # Expo Router - Screen Navigation
│   │   ├── (auth)/             # Authentication screens
│   │   ├── (camera)/           # Camera & measurement screens
│   │   ├── (history)/          # Historical data screens
│   │   ├── (message)/          # Messaging screens
│   │   ├── (tabs)/             # Main tab navigation
│   │   └── _layout.tsx         # Root layout
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── Form Components     # Inputs, buttons, modals
│   │   ├── Layout Components   # Headers, gradients, navigation
│   │   └── Feature Components  # Domain-specific components
│   │
│   ├── contexts/               # React Context Providers
│   │   ├── AuthContext         # User authentication state
│   │   ├── LocationContext     # GPS & location state
│   │   ├── ThemeContext        # Dark/light mode state
│   │   ├── WeatherContext      # Weather data state
│   │   └── MessageContext      # Messaging state
│   │
│   ├── services/               # External Integrations
│   │   ├── weatherApi.js       # Weather service
│   │   ├── useWebsocket.ts     # Real-time messaging
│   │   ├── frameProcessor.js   # Camera frame processing
│   │   ├── colorsFrameProcessor.ts  # Color detection
│   │   └── imageCompressionUtil.ts  # Image optimization
│   │
│   ├── action/                 # Redux-style Actions
│   │   ├── userAction.ts       # User operations
│   │   ├── plotAction.ts       # Plot management
│   │   ├── leafAction.ts       # Leaf analysis
│   │   ├── productAction.ts    # Product tracking
│   │   ├── reportAction.ts     # Report generation
│   │   └── paymentAction.ts    # Payment processing
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   └── tsHooks.ts          # TypeScript hooks
│   │
│   ├── lib/                    # Third-party Integrations
│   │   └── appwrite.js         # Appwrite SDK setup
│   │
│   ├── utils/                  # Utility Functions
│   │   └── cn.ts               # Classname utilities
│   │
│   ├── global/                 # Global Utilities
│   │   └── fetchWithTimeout.ts # API utilities
│   │
│   └── contexts/               # React Context Providers
│
└── assets/
    ├── fonts/                  # Custom fonts
    └── images/                 # App images & icons
```

### Data Flow Architecture

```
USER INTERACTION
      │
      ▼
┌──────────────────────────┐
│   Screen Component       │
│  (e.g., index.tsx)       │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│  Event Handler / Hook    │
│  Action Dispatch         │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│  Action Function         │
│  (action/*.ts)           │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│  API Service             │
│  (services/*)            │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│  Appwrite Backend        │
│  (Database/Auth/Storage) │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│  Context Update          │
│  (State Management)      │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│  Component Re-render     │
│  Display Updated State   │
└──────────────────────────┘
```

## Design System

### Color Palette

#### Primary Colors

- **Primary Green**: `#10b981` - Main brand color, CTAs, active states
- **Dark Green**: `#059669` - Hover states, emphasis
- **Light Green**: `#d1fae5` - Backgrounds, light elements

#### Functional Colors

- **Success**: `#22c55e` - Positive actions, confirmations
- **Warning**: `#f59e0b` - Alerts, attention needed
- **Error**: `#ef4444` - Errors, destructive actions
- **Info**: `#3b82f6` - Information, notifications

#### Neutral Colors

- **White**: `#ffffff` - Primary background
- **Gray-900**: `#111827` - Text on light (dark mode)
- **Gray-100**: `#f3f4f6` - Light backgrounds
- **Gray-500**: `#6b7280` - Secondary text

### Typography

#### Font Families

- **Primary**: System default (optimized per platform)
- **Monospace**: Used for codes and technical content

#### Font Sizes & Weights

```
Display/Hero:   32px, Bold (600)
Heading 1:      28px, Semi-bold (600)
Heading 2:      24px, Semi-bold (600)
Heading 3:      20px, Medium (500)
Body Large:     18px, Regular (400)
Body Normal:    16px, Regular (400)
Body Small:     14px, Regular (400)
Caption:        12px, Regular (400)
```

#### Line Heights

- Display: 1.2
- Heading: 1.3
- Body: 1.5
- Caption: 1.4

### Spacing System

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

### Component Design Tokens

#### Button

- Height: 44px (accessible touch target)
- Border Radius: 8px
- Padding: 12px 16px
- Font Size: 16px, Medium weight

#### Card

- Border Radius: 12px
- Padding: 16px
- Shadow: Subtle elevation
- Background: White (light) / Gray-900 (dark)

#### Input Fields

- Height: 44px
- Border Radius: 8px
- Padding: 12px
- Border: 1px solid Gray-300
- Focus State: Blue border with shadow

#### Modal/Dialog

- Border Radius: 16px
- Overlay: Semi-transparent black (50% opacity)
- Animation: Slide up from bottom

### Icons & Imagery

- **Icon Library**: System icons and custom SVGs
- **Icon Size**: 24px (standard), 32px (large), 16px (small)
- **Image Treatment**: Rounded corners, proper aspect ratios
- **Photography**: Natural, lifestyle, plantation-focused

## Component Architecture

### Core Components Hierarchy

```
App Root
├── Providers (Theme, Auth, Location, Weather, Message)
│
├── Navigation Layer (Expo Router)
│   ├── Auth Stack
│   │   ├── Login Screen
│   │   ├── Register Screen
│   │   └── Forgot Password
│   │
│   ├── Main Stack (Tabs)
│   │   ├── Home/Dashboard
│   │   ├── Camera/Measurement
│   │   ├── History
│   │   ├── Messages
│   │   └── Settings
│   │
│   └── Modals
│       ├── Confirm/Cancel
│       ├── Search
│       └── Report
│
└── Shared Components
    ├── UI Atoms
    │   ├── AppText (Typography)
    │   ├── Button (Primary, Secondary)
    │   ├── ViewPressable (Interactive areas)
    │   └── LoadingComponent (Loaders)
    │
    ├── UI Molecules
    │   ├── HeaderNav (Navigation header)
    │   ├── HeaderBackground
    │   ├── DashboardBackground
    │   ├── BackgroundGradient
    │   └── SearchModal
    │
    └── Feature Components
        ├── TreeMeasurementGuidance
        ├── RegisterTreePlot
        ├── EditProduct
        ├── PaymentMethod
        ├── CurrentWeather
        ├── WeatherForecast
        └── RubberPrice
```

### Service Architecture

```
Services Layer
│
├── API Services
│   ├── User API (Authentication, Profile)
│   ├── Plot API (CRUD operations)
│   ├── Leaf API (Leaf measurements)
│   ├── Product API (Inventory)
│   ├── Report API (Data aggregation)
│   └── Payment API (Transactions)
│
├── External Services
│   ├── Weather Service
│   ├── Location Service (GPS)
│   ├── Camera Service (Frame processing)
│   ├── Image Service (Compression, optimization)
│   └── WebSocket Service (Real-time messaging)
│
└── Utility Services
    ├── Authentication Manager
    ├── State Management (Context)
    ├── Error Handler
    ├── Logger
    └── Cache Manager
```

### State Management Flow

```
┌─────────────────────────────────────────┐
│      React Context Providers            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ AuthContext                      │  │
│  │ - User data                      │  │
│  │ - Login state                    │  │
│  │ - Authentication token           │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ LocationContext                  │  │
│  │ - Current position               │  │
│  │ - GPS permissions                │  │
│  │ - Map data                       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ ThemeContext                     │  │
│  │ - Dark/Light mode                │  │
│  │ - Color scheme                   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ WeatherContext                   │  │
│  │ - Current weather                │  │
│  │ - Forecast data                  │  │
│  │ - Location weather               │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ MessageContext                   │  │
│  │ - Messages list                  │  │
│  │ - WebSocket connection           │  │
│  │ - Notifications                  │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
         │
         │ useContext() Hooks
         ▼
    Components consume context
```

## Configuration

- `app.json` - Expo app configuration
- `eas.json` - EAS Build configuration
- `tailwind.config.js` - TailwindCSS configuration
- `metro.config.js` - Metro bundler configuration
- `tsconfig.json` - TypeScript configuration

## Screen Flow Diagram

```
Start
 │
 ▼
Not Authenticated?
 │
 ├─── Yes ──► Auth Stack
 │            ├─► Login Screen ◄────┐
 │            ├─► Register Screen    │
 │            └─► Forgot Password    │
 │                     │             │
 │                     └─────────────┘
 │
 └─── No ──► Main App (Tabs)
              │
              ├─► Dashboard Tab ◄────────────┐
              │   ├─► View plots            │
              │   └─► Quick actions         │
              │                             │
              ├─► Camera Tab                │
              │   ├─► Tree Measurement      │
              │   └─► Payment               │
              │                             │
              ├─► History Tab               │
              │   ├─► Plot History          │
              │   └─► Tree Data             │
              │                             │
              ├─► Messages Tab              │
              │   └─► Conversations         │
              │                             │
              └─► Settings Tab ─────────────┘
                  ├─► Profile
                  ├─► Appearance
                  ├─► Notifications
                  ├─► Help & Support
                  └─► Logout
```

## API Integration Points

### Authentication

- User login/registration
- Token refresh
- Password recovery

### Data Management

- CRUD operations for plots, trees, products
- Real-time leaf measurement updates
- Report generation and export

### External Services

- **Weather API**: Current conditions and forecasts
- **Maps/GPS**: Location tracking and plot mapping
- **Payment Gateway**: Transaction processing
- **WebSocket**: Real-time messaging

### File Storage

- User profile images
- Tree/plot photographs
- Generated reports
- receipts/documents

## Contributing

Contributions are welcome! Please follow the project's coding standards and ensure all tests pass before submitting pull requests.

### Development Guidelines

- Use TypeScript for type safety
- Follow the established folder structure
- Use React Context for global state
- Keep components small and reusable
- Document complex business logic

## Support

For support and documentation:

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Appwrite Docs](https://appwrite.io/docs)

## License

This project is part of a capstone/research initiative for rubber plantation management technology.

## Author

Jacob Mary Tapere
