# Release Notes

User-friendly release notes for Rainy Day. For detailed technical changes, see [CHANGELOG.md](./CHANGELOG.md).

## Rainy Day 0.5.20 📝🧠 — "The Intelligence Layer"

_January 16, 2026_

**Note AI - Your AI-Powered Daily Briefing**

A brand new way to start your day! Note AI generates a concise daily summary from your emails, tasks, and calendar:

- **📧 Email Summary**: Key emails at a glance with who needs a reply
- **✅ Task Recap**: Your outstanding tasks organized by priority
- **📅 Meeting Notes**: Today's schedule with key details

**Fair Usage:**
- Free: 5 notes per day
- Plus: 50 notes per day
- Pro: 100 notes per day (soft cap)

**Also in this update:**
- **⚡ Performance**: New Rust-powered data pipeline for faster processing
- **🔄 Background Jobs**: Smarter memory operations that run reliably in the background
- **🎯 Unified Backend**: Cleaner, faster data loading across the app

---

## Rainy Day 0.5.15 ✅🏗️

_January 14, 2026_

**Progress Bar Fix & Code Improvements**

We fixed the progress bar issue and improved the codebase:

- **All tasks now have checkboxes**: Focus blocks, meetings, emails, and all other items can now be marked as done
- **Accurate progress tracking**: Your daily progress bar will now correctly reach 100% when you complete everything
- **Consistent behavior**: The app now works the same in development and production builds
- **Modular Code Structure**: Reorganized the daily plan view for better maintainability and stability

---

## Rainy Day 0.5.14 🎨✨

_January 14, 2026_

**The "Premium macOS" Update**

We've completely redesigned the core experience to feel even more native and high-end:

- **Stunning New Daily Plan**: The focus of your day now looks more professional than ever with refined typography and a beautiful glassmorphism aesthetic.
- **Perfect Blue Borders**: Clean, stable, and vibrant accents that guide your eyes and make the app feel alive.
- **Redesigned Reset Experience**: The "Reset System" dialog is now a beautiful, centered modal with deep blurs and a true macOS feel.
- **Micro-Aesthetics**: Smoother transitions, better shadows, and 100% responsive layouts tailored for your Mac.

---

## Rainy Day 0.5.13 🧹✨

_January 14, 2026_

**Robust Clear Plan & Deep Reset**

We've fixed the "Clear Plan" issue and made it much more powerful:

- **Works everywhere**: The "Reset Plan" button now uses a reliable native-style dialog that works perfectly on macOS
- **System-wide cleanup**: Resetting now clears all cached emails and events, ensuring the AI gets the absolute latest data for your new plan
- **Fresh generation**: All task checkmarks are reset when you clear the plan, giving you a truly fresh start
- **Extreme Speed**: Parallel processing makes large inboxes and task lists load up to 4x faster on modern multi-core processors
- **Powerful Search**: Find exactly what you need with our new regex-powered search engine—perfect for advanced users and large datasets

---

## Rainy Day 0.5.12

_January 14, 2026_

**Performance Revolution**

This update introduces our new **Rust Performance Layer** - a major upgrade that makes Rainy Day faster and more responsive than ever:

- **Lightning-Fast Caching**: Data you've seen before now loads instantly (sub-millisecond) from our new Rust-powered cache
- **Smarter API Calls**: When multiple parts of the app need the same data, we only fetch it once - saving your bandwidth and battery
- **Native Speed Processing**: Date formatting, priority calculations, and task processing now run at native Rust speeds instead of JavaScript
- **Future-Ready**: This foundation enables exciting AI and performance features in upcoming versions

**What you'll notice:**
- Smoother navigation between pages
- Faster daily plan loading
- More responsive email actions
- Reduced data usage overall

---

## Rainy Day 0.5.11 🧹⚡

_January 13, 2026_

**Performance & Plan Reset**

- **Clear Your Plan**: Not happy with today's AI plan? Use the new "Clear Plan & Start Fresh" button at the bottom to completely reset and generate a new one
- **Faster App**: Reduced background API calls by 75% for better battery life and less data usage
- **Bug Fixes**: Fixed update modal not showing release notes, and various stability improvements

---

## Rainy Day 0.5.10 🔒

_January 13, 2026_

**Fixed: Stay Logged In Forever**

A bug was causing users to be logged out after 30 days from their first login, even if they used the app every day. This is now fixed:

- **Sessions now extend automatically**: Every time you use the app, your session is extended by 30 days
- **No more surprise logouts**: As long as you use Rainy Day at least once every 30 days, you'll never have to log in again

---

## Rainy Day 0.5.9 🎯📥

_January 13, 2026_

**AI Plan & Priority Inbox Improvements**

- **Visual Clarity**: Fixed a bug where unread emails looked like they were read. Your unread messages are now bright and visible with a blue glow.
- **Stable AI Summaries**: Creating and viewing summaries is now smoother, fixing the button flicker and accidental regeneration.
- **No More Spam**: Priority Inbox excludes promotions/marketing to keep your view clean.
- **More Content**: We've doubled the number of emails loaded at startup.
- **Progress Bar Fixed**: The daily progress bar now correctly tracks your completion, reaching 100% when all visible tasks are done.
- **Instant Regeneration**: When you refresh your AI plan, the new plan appears immediately without needing to switch pages.

---

## Rainy Day 0.5.8 🔑

_January 13, 2026_

**Stay Logged In**

- **No more constant re-logins**: Your session now stays active for up to 30 days, even after closing the app or restarting your computer
- **Automatic token refresh**: The app now silently refreshes your session when needed
- **Better update notes**: The update dialog now shows actual release notes instead of generic text

---

## Rainy Day 0.5.7 🔧

_January 13, 2026_

**AI Plan Cache Fix**

- **Stale plan issue fixed**: Your daily AI plan now correctly shows today's plan, not plans from previous days
- **Smoother navigation**: Fixed issue where plans would mysteriously appear or disappear when switching between pages
- **Automatic cleanup**: Old cached plans are now automatically cleared when they're out of date

---

## Rainy Day 0.5.6 🌍

_January 12, 2026_

**Internationalization Support**

Rainy Day now speaks your language! We've added a modular language system:

- **Spanish Support**: Full Spanish translation now available
- **Auto-Detection**: App automatically detects your system language on first launch
- **Easy Switching**: Change language anytime in Settings → Language
- **Persistent**: Your language preference is saved across sessions

**Also in this update:**
- Improved Email Summary dialog with cleaner, theme-adaptive design
- Summary cache reduced to 1 hour for fresher content

---

## Rainy Day 0.5.5 ✨

_January 12, 2026_

**AI Email Summaries**

Get instant AI-powered insights for any email with a single click:

- **Priority Score**: Know at a glance how urgent an email is (1-10 scale)
- **Action Items**: Automatically extracts what you need to do, with suggested deadlines
- **Sentiment Detection**: See the email's tone instantly (urgent 🔥, friendly 😊, formal 📋, frustrated 😤)
- **Key Details**: People, companies, dates, and amounts highlighted for quick reference
- **Smart Replies**: 3 one-click reply suggestions tailored to the context
- **Thread Summaries**: Summarize entire email conversations, not just individual emails

**Limits by Plan:**
- Free: 3 summaries/day
- Plus: 25 summaries/day
- Pro: 80 summaries/day

---

## Rainy Day 0.5.4 🔌

_January 12, 2026_

**Production Connection Fix & Status Indicator**

- **Fixed**: The app now correctly connects to the backend in production builds (was only working in development)
- **New**: API connection indicator on the login screen shows if the backend is reachable
  - 🟢 Green = Connected
  - 🟡 Yellow = Checking
  - 🔴 Red = Unavailable

---

## Rainy Day 0.5.3 📊

_January 11, 2026_

**Smarter Daily Plans**

- **Quick Stats at a Glance**: See your task count, high-priority items, estimated time, and pending emails in a compact bar at the top of your daily plan
- **Progress Tracking**: A visual progress bar shows how much of your day you've completed
- **Productivity Insights**: Your AI plan now includes suggested break times, task batching recommendations, and optimal focus windows
- **Focus Mode Ready**: New quick action buttons for Focus Mode, Email Triage, and Quick Wins (coming soon!)
- **Personalized Greeting**: The app now greets you by your first name with the correct time of day

---

## Rainy Day 0.5.2 ⚡

_January 10, 2026_

**Groq Reasoning Models**

- **GPT-OSS models**: Access OpenAI's reasoning models through Groq's ultra-fast infrastructure
  - GPT-OSS 20B at 1000 tokens/sec for quick reasoning tasks
  - GPT-OSS 120B at 500 tokens/sec for deep analysis (Pro only)
- **Smoother plan regeneration**: Visual feedback with skeleton loading when refreshing your AI daily plan
- **Fixed refresh button**: The topbar refresh button now properly shows loading state

---

## Rainy Day 0.5.1 🛡️

_January 10, 2026_

**Improved Model Usage Tracking**

- **Precise usage tracking**: Your premium model usage is now tracked in a dedicated system that resets reliably on the 1st of each month
- **Smarter fallback**: If you hit your monthly limit on a premium model, the app automatically uses the free model instead of failing
- **Usage visibility**: You can now see exactly how many times you've used each model this month

---

## Rainy Day 0.5.0 🚀

_January 10, 2026_

**The AI Model Expansion Update**

- **More AI models**: Access to 8 different AI models based on your plan tier
- **Gemini 3 support**: The latest Gemini 3 Flash and Pro models with advanced reasoning
- **Thinking modes**: Control how deeply the AI reasons through problems (Minimal → High)
- **Enhanced model selector**: Models are now organized by provider with clear descriptions
- **Groq integration**: Ultra-fast inference with Llama models for Pro users
- **Fair usage limits**: Premium models (Gemini 2.5 Pro, Gemini 3 Pro, Llama 3.3 70B) have monthly caps to ensure availability for all Pro users. Limits reset on the 1st of each month.

---

## Rainy Day 0.4.9

_January 10, 2026_

- **Cleaner Settings Page**: Reorganized the settings with a new "AI Configuration" section that consolidates model selection and usage limits in one place.
- **Less Clutter**: Removed duplicate controls and unnecessary comparison tables for a simpler experience.

---

## Rainy Day 0.4.8

_January 10, 2026_

- **Solid & Reliable Pricing UI**: We've rebuilt the plan selection screen from the ground up using our core design system. It's now cleaner, faster, and perfectly aligned on every screen size.

---

## Rainy Day 0.4.7

_January 10, 2026_

- **Responsive Pricing Layout**: The upgrade modal now adapts perfectly to any window size, ensuring no text is squashed or overlapping.
- **Better Breathing Room**: Improved spacing and layout management for a cleaner, more readable plan selection experience.

---

## Rainy Day 0.4.6

_January 10, 2026_

- **Stunning New Pricing Experience**: The plan upgrade modal has been completely redesigned with a more professional, premium look.
- **Improved Visual Clarity**: Pricing cards now feature better layouts and theme-aware accents to help you choose the best plan.

---

## Rainy Day 0.4.5

_January 10, 2026_

- **Refined Actions Interface**: The "Actions" section in settings has been redesigned with premium cards and better typography.
- **Dynamic Action Styling**: Plan upgrades and update checks now adapt perfectly to your chosen theme.

---

## Rainy Day 0.4.4

_January 10, 2026_

- **True Dynamic Theming**: The AI Model selection now perfectly adapts to your chosen theme colors.
- **Improved Visual Consistency**: Fixed minor styling issues in the subscription settings.

---

## Rainy Day 0.4.3

_January 10, 2026_

- **AI Model Selection Redesign**: A much cleaner and more professional interface for switching AI models.
- **Premium Design**: Added glassmorphism and subtle blue borders for a native macOS experience.

---

## Rainy Day 0.4.2

_January 10, 2026_

- **Fixed upgrade confirmation**: After paying for Plus or Pro, a success modal now appears to confirm your upgrade.

---

## Rainy Day 0.4.1

_January 10, 2026_

- **Fixed subscription upgrade**: Clicking "Upgrade to Plus/Pro" now opens the payment page correctly.
- **Success celebration**: After upgrading, you'll see a celebration modal showing your new plan benefits.
- **Renewal date display**: See when your subscription renews right after upgrading.

---

## Rainy Day 0.4.0

_January 9, 2026_

- **Subscription plans**: Choose between Free, Plus ($4/mo), or Pro ($8/mo) plans.
- **AI model selection**: Pro users can switch between 5 different AI models.
- **Usage limits**: Free plan now limited to 5 AI plan generations per day.
- **Billing portal**: Manage your subscription and invoices directly from the app.

---

## Rainy Day 0.3.4

_January 9, 2026_

- **Daily Plan redesign**: Cleaner, more professional look with improved icons and layout.
- **Unified task view**: All your focus blocks, quick wins, and meetings now appear in a single organized list.
- **Interactive checkboxes**: Mark tasks as complete directly from the daily plan.
- **Quick actions on hover**: Archive emails, mark as read, or convert to tasks with one click.
- **Performance**: Removed duplicate elements for a smoother experience.

---

## Rainy Day 0.3.3

_January 9, 2026_

- **Create events in-app**: Add, edit, and delete calendar events without leaving the app.
- **New date/time picker**: Beautiful glassmorphism design for scheduling events.
- **Auto-update fix**: Updates now download correctly from GitHub.

---

## Rainy Day 0.3.2

_January 9, 2026_

- **Agenda improvements**: Refresh, notifications, and better calendar integration.

---

## Rainy Day 0.3.1

_January 9, 2026_

- **Update system**: Check for updates automatically or manually.
- **Task management**: Create, complete, and delete tasks from the Tasks page.

---

## Rainy Day 0.3.0

_January 9, 2026_

- **Auto-updates**: The app now updates itself automatically.
- **Multi-platform releases**: Available for macOS, Windows, and Linux.
- **macOS optimizations**: Better integration with macOS including native permissions.

---

## Rainy Day 0.2.1

_January 8, 2026_

- **Native notifications**: Get notified with system sounds when tasks are due.
- **Notification settings**: Control notifications from the settings page.
- **Test notifications**: Try out notifications before enabling them.

---

## Rainy Day 0.2.0

_January 8, 2026_

- **AI-powered daily plan**: Smart suggestions based on your emails, calendar, and tasks.
- **Task actions**: Complete and delete tasks with one click.
- **Quick task input**: Add tasks without switching pages.
- **Notification bell**: See all your notifications in one place.
- **Offline support**: Keep working even without internet.
- **Keyboard shortcuts**: Press ⌘R to refresh, ⌘N to add a task, ⌘S to sync.

---

## Rainy Day 0.1.x

_January 6-8, 2026_

- **Initial release**: Gmail, Calendar, and Tasks integration.
- **Beautiful themes**: Multiple color themes including day and night modes.
- **Command palette**: Access everything with ⌘K.
- **Secure storage**: Your tokens are safely stored in your system's keychain.
