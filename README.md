<p align="center">
  <img src="./logo.jpeg" alt="Rainy Day Logo" width="120" />
</p>

<h1 align="center">Rainy Day</h1>

<p align="center">
  <strong>Your AI-powered executive assistant that transforms chaos into clarity.</strong>
</p>

<p align="center">
  <a href="https://github.com/ferxalbs/rainy-day/releases">
    <img src="https://img.shields.io/badge/version-0.5.2-blue.svg?style=flat-square" alt="Version" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square" alt="License" />
  </a>
  <a href="https://coderabbit.ai">
    <img src="https://img.shields.io/coderabbit/prs/github/ferxalbs/rainy-day?utm_source=oss&utm_medium=github&utm_campaign=ferxalbs%2Frainy-day&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews&style=flat-square" alt="CodeRabbit reviews" />
  </a>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-community--support">Community</a>
</p>

---

## 🌧️ About Rainy Day

Rainy Day is a next-generation desktop application designed to reclaim your time. By leveraging advanced AI models (Gemini, Groq), it analyzes your inbox, calendar, and tasks to generate intelligent, actionable daily plans.

This repository contains the **Open Source Client** for Rainy Day.

### 🔮 Future Roadmap: Community Mode

We are currently building **Community Mode** — a fully self-hosted, offline-capable version where all application logic will be moved to **Rust**. This will allow users to run Rainy Day locally offering a true "Local First" experience without external dependencies.

## ✨ Key Features

### 🤖 AI Core & Planning

- **Intelligent Daily Briefing**: Starts your day with a prioritized plan derived from your actual workload.
- **Multi-Model Intelligence**: Seamlessly switches between Gemini 2.5/3.0 for deep reasoning and Groq (Llama 3.3) for instant responses.
- **Context Aware**: Understands the difference between a "quick reply" email and a "deep work" project.

### ⚡ Productivity Engine

- **Unified Inbox Zero**: Process Gmail threads with one-click actions (Reply, Task, Archive).
- **Smart Calendar**: Native Google Calendar integration with "Join Meeting" automation and smart scheduling.
- **Optimistic Task Management**: A responsive task system that syncs with Google Tasks in real-time.

### 🔒 Native & Secure

- **Local First**: Heavy caching ensures you can work offline.
- **Privacy Centric**: Your data is processed securely with enterprise-grade standards.
- **Rust Powered**: Built on Tauri v2 for a tiny footprint and blazing fast performance on macOS.

## 🛠️ Tech Stack

- **Framework**: [Tauri v2](https://tauri.app) (Rust + Web)
- **UI Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (Glassmorphism & Native aesthetics)
- **State**: Custom hook-based store with optimistic updates

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ & pnpm
- Rust (latest stable)

### Client Setup

Run the desktop application in development mode:

```bash
# Clone the repository
git clone https://github.com/ferxalbs/rainy-day.git
cd rainy-day

# Install dependencies
pnpm install

# Run Tauri development window
pnpm tauri dev
```

### 2. Development API (Backend)

We offer a hosted **Development API** for contributors who want to test the full syncing capabilities without self-hosting.

To request access:

1.  Open a **New Issue** with the label `api-access`.
2.  Briefly describe your contribution or use case.
3.  We will provide you with a unique `API_KEY` to configure your `.env` file.

_Note: This API will eventually be made public and free for all developers._

## 🤝 Community & Support

This repository is the central hub for the Rainy Day community.

- 📥 **Releases**: Download the latest official builds for macOS, Windows, and Linux from [Releases](https://github.com/ferxalbs/rainy-day/releases).
- 💬 **Discussions**: Share ideas, ask questions, and engage with other users in [GitHub Discussions](https://github.com/ferxalbs/rainy-day/discussions).
- 🐛 **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/ferxalbs/rainy-day/issues).

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<p align="center">
  Built with ❤️ for those who love clear skies and organized minds.
</p>
