# 📋 Changelog

All notable changes to this project will be documented in this file.

### 🔮 Upcoming Features / Changes / Fixes
- Path finding inside maps
- Path finding between maps
- LoS check to better check what next target to choose (and not just raw distance to the player)
- When in sitting mode and receiving damages, go back to combat mode
- In the setting, be able to toggle base attacks
- Add some kind of delay for not in range items before picking them up

---

## [2025-06-05.001]

### ✅ Fixes
- Elite and Chief config now properly work and saves itself

### 💾 Improvements
- Delay after using a potion has been reduced


## [2025-05-31.003]

### ✅ Fixes
- Forced health and mana buff icon to replace currently missing one
- In range check now properly ignore skills that doesn't target either the ground or another entity


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
