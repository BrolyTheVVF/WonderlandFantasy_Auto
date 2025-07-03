# 📋 Changelog

All notable changes to this project will be documented in this file.

### 🔮 Upcoming Features / Changes / Fixes
- Path finding inside maps
- Path finding between maps
- Add auto quest
- Better targetting choice: Add LoS check, prioritize ennemies that are already attacking you, even more if they attack from distance and are chief
- In the setting, be able to toggle base attacks
- Add the little auto floating on top of the head (local only)

---

## [2025-07-03.001]

### 💾 Improvements
- Fix a game's memory leak with sprite clips (SYS_MemLeak.js)


## [2025-06-29.005]

### ✅ Fixes
- Yet another try to fix UI breaking in some browser (take 2155465465416)


## [2025-06-29.004]

### ✅ Fixes
- Try and prevent some JS external file to be cached between version updates


## [2025-06-29.003]

### ✅ Fixes
- Try and prevent some CSS injection to break game's UI in some cases


## [2025-06-29.002]

### ✅ Fixes
- Some event where not properly overwritten when the bot loaded in some cases


## [2025-06-29.001]

### 💾 Improvements
- Rolled back the skill change


## [2025-06-28.002]

### 💾 Improvements
- Reworked the whole skill casting process to locally force colldown and not wait server response, preventing the client to spam skill casting request


## [2025-06-28.001]

### ➕ Added
- Added the possibility to load additional scrip files to keep better code, but also give more options like adding path finding
- Added some more css debuging like readding starts on upgraded gears


## [2025-06-27.001]

### ➕ Added
- Added an option to auto sell crafted gears when bag is almost full or crafting is done


## [2025-06-26.001]

### ✅ Fixes
- Now should properly uses skills that target the player itself like magic shield, heal ect


## [2025-06-25.001]

### ✅ Fixes
- Now should properly refresh the page and auto select the character when the game crashes or when you loose connection to the server


## [2025-06-23.001]

### ➕ Added
- When taking damages with no target, auto lock the source if it's not a player, and attack it if the bot was in resting mode


## [2025-06-21.002]

### 💾 Improvements
- Fixed the soul gathering forcing blue orb when picking yellow ones
- When in group, added range to item pickups so that the player doesn't take everything

### ➕ Added
- When auto is ON, now pickup online time reward


## [2025-06-21.001]

### 💾 Improvements
- Delay after using a potion has been reduced again and should be in a much better state now between waiting for lag and not waisting too much time

### ➕ Added
- Auto relog on the character when auto is ON and the connection in interupted


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
