---
trigger: always_on
---

For implementing functions, use RUST very sparingly and only when necessary. Use TS for everything else, while using pure RUST for greater security and granular control of access to the internal app to prevent hacking and security breaches. Avoid leaving traces of code; never use a dead_code label. Always clean everything up—it's all or nothing when it comes to those residual elements.