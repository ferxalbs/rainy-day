---
trigger: always_on
---

With each modification, the system version number will be changed and placed in the CHANGELOG divided into three parts. Each release or element added to the changelog will be divided into the following structure:

* Added

* Improvements

* Fixes

* Patches

Depending on the context, you will not be modifying a tag once you place it, which means that if you release the tag, for example, v0.1.89 with two elements in patches and improvements, and then you make improvements related to that tag, you will not modify the tag, but rather it will correspond to the tag v0.1.90. You have to be very meticulous with these elements. 


And you update the config.tauri.json, package.json, cargo.toml and README.md. And dont add the CHANGES of the server in the CHANGELOG.md root, create a own CHANGELOG for others projects in the repo dont combine the info.

And since we have production releases with each update, you have to add a corresponding entry in the RELEASE_NOTES.md file, where release notes are placed in a format that is user-friendly for end users. 