# 📋 Changelog

All notable changes to this project will be documented in this file.

### 🔮 Upcoming Features / Changes / Fixes
- Path finding between maps
- Add auto quest
- Better targetting choice: Add LoS check, prioritize ennemies that are already attacking you, even more if they attack from distance and are chief
- In the setting, be able to toggle base attacks
- Do devil transport

---

## [2025-07-23.001]

### ✅ Fixes
- Reset the castbar when character is dead, as dying while casting would make your character stuck in casting forever


## [2025-07-19.001]

### ➕ Added
- Added the auto icon on top of the character head to better see when its active (only local, not synched with other players)


## [2025-07-15.005]

### 💾 Improvements
- Auto unlock target upon death
- Delay between 2 wave of item picking up changed from 1s to 2.5s to be less intense for the server

### ➕ Added
- Added an option to auto sell telluric items when stack are full and in auto mode


## [2025-07-15.004]

### ✅ Fixes
- Added a timeout on pathfinding search so your character don't get stuck standing still when there is an unexpected error
- Proper error handling in the path finding when there is an error loading the files for etiher the map collisions or the walking points
- Prevented a infinite refresh loop
- To fix a server sync bug with skill cooldown, all casting skills will bu forced on CD on the client to be sure the bot won't try to start casting the skill and be stuck in an infinite cast loop
- Fixed an error with pathfinding on map's that hasn't been configured yet where your character would stand still forever until your target would get in range


## [2025-07-12.011]

### ➕ Added
- Added first beta version of pathfinding inside maps (currently working in HoE and HoE Deep 70 to 90)


## [2025-07-06.001]

### ✅ Fixes
- Crafting's auto sell now properly check the config and not just allways auto sell


## [2025-07-05.001]

### 💾 Improvements
- Added a fix when player is stuck with an infinite cast bar and the bot was stuck doing nothing, now cancel the glitched cast after 10 seconds
- Added a new fix to try and reduce memory leaks


## [2025-07-03.002]

### 💾 Improvements
- Added a specific cooldown to item pickup so the bot doesn't spam the picking up every 50ms


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
