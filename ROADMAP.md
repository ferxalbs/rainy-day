# Roadmap

This document outlines the future development direction for Rainy Day. Features are subject to change based on community feedback.

> **Note**: Rainy Day is a SaaS application. All data sync and AI processing happens in the cloud. Client-side Rust is used for performance optimization, not local data storage.

---

## ⚡ v0.6.0 — Performance & Calendar

### Performance Optimization
- [ ] Rust-based client caching layer
- [ ] Request deduplication & batching
- [ ] Smart data prefetching
- [ ] Component lazy loading

### Calendar & Reminders
- [ ] Recurring event support
- [ ] Event reminders & alarms
- [ ] Attachments in calendar events
- [ ] Monthly/Yearly calendar views
- [ ] Event categories & labels

---

## 🧠 v0.7.0 — Advanced AI Features

- [ ] Custom AI prompts & personalities
- [ ] Multi-day planning (weekly briefings)
- [ ] AI-powered meeting prep (summarize context before events)
- [ ] Smart email drafting suggestions
- [ ] AI-powered UI suggestions based on usage patterns

---

## 🌐 v0.8.0 — Integrations & Backend Unification

### Third-Party Integrations
- [ ] Microsoft 365 (Outlook Calendar, To Do)
- [ ] Notion integration
- [ ] Todoist sync
- [ ] Linear/Jira task import

### Backend Optimization
- [ ] Unified state management
- [ ] WebSocket for real-time updates
- [ ] Optimized Rust ↔ TypeScript communication

---

## � v1.0.0 — Production Workspace

The major milestone for a production-ready SaaS productivity workspace.

- [ ] **Native Performance**: Sub-100ms response times everywhere
- [ ] **Premium AI Models**: Advanced cloud AI features for Pro users
- [ ] **Enterprise Ready**: Team features and SSO
- [ ] **Cross-Platform Polish**: Perfect experience on macOS, Windows, Linux

---

## 💬 Community Requested

Have an idea? Open a [Feature Request](https://github.com/ferxalbs/rainy-day/issues/new?template=feature_request.md)!

- [x] i18n / Internationalization (Added in v0.5.6)
- [ ] Windows & Linux polish
- [ ] Custom notification sounds
- [ ] Widgets (macOS & iOS)
