# 📋 Changelog

All notable changes to this project will be documented in this file.

---

## [2025-05-31.002]

### 💾 Improvements
- Player's target now properly reset when the target is the player itself or an NPC that cannot be attacked
- Added a first version of skill rotation: skill will be set to the end of the rotation every time they are used, so all skill can be used as evenly as possible
- Console logs will only show on PTR to improve live performance

### ✅ Fixes
- In range check now properly uses all selected skill ranges to be sure all skills can be performed


## [2025-05-31.001]

### ✅ Fixes
- Skill selection is now properly saved


## [2025-05-24.002]

### 💾 Improvements
- Added tooltip when hovering the skill slots


## [2025-05-24.001]

### 💾 Improvements
- Replaced the ignored skill rules by a skill choice list in the setting tab
- Change the script injection to try to inject itself every second until the character is logged in to prevent errors when it was loaded too soon


## [2025-05-21.001]

### 💾 Improvements
- Ignore skills that requires casting
- Now auto cast skills on ground on the targeted mob


## [2025-05-19.002]

### ✅ Fixes
- Player now uses **all available skills**

### 💾 Improvements
- **Settings are now saved**

### 🔮 Upcoming Features
- Ground skills support will be added soon

### ➕ Added
- New **mana rules** system
