# 🧩 Regolith Starter Guide — Minecraft Bedrock Addon Templating

Regolith is a powerful **JSON templating engine** for Minecraft Bedrock Addon developers. It helps automate the creation of structured JSON files (entities, items, blocks, etc.) using **data-driven templates**.

For advanced usage, check out the official docs:  
👉 [Regolith JSON Templating Options](https://docs.mcdevkit.com/json-templating-engine/template-options)

---

## 📘 1. **Core Idea**

Regolith uses two main components:

- **Data files** — store JSON arrays with all your block, entity, or item info.  
- **Template files** (`.templ` / `.modl`) — generate final JSON output from data.

This approach makes your addons modular, consistent, and easy to scale.

---

## 📁 2. **Data Folder Structure**

Inside your project’s `Data` folder, create files like this:


{
  "items": [
    { "name": "iron_dagger", "damage": 4 },
    { "name": "gold_dagger", "damage": 3 }
  ],
  "mutants": [
    { "name": "creeper_mutant", "passive": false, "stats": { "health": 50 } },
    { "name": "zombie_mutant", "passive": true, "stats": { "health": 40 } }
  ]
}
Each array can be referenced by your templates to automatically generate content.

🧱 3. **Template File Basics (.templ)**
Templates control how your data gets turned into final JSON files using the $files block.

a. **Basic Generation**
json
"$files": {
  "array": "mutants",
  "fileName": "{{name}}.se"
}
➡️ Creates one output file for each mutant.

b. **Filtering Entries**
json
"$files": {
  "array": "{{mutants.filter(x => x.passive)}}",
  "fileName": "{{name}}.se"
}
➡️ Only generates files for passive mutants.

c. **Combining Arrays**
json
"$files": {
  "array": "mutants + items",
  "fileName": "{{name}}.se"
}
➡️ Processes multiple data arrays together.

⚙️ 4. **Modules and Extensions (.modl)**
Templates can extend one or more modules, allowing you to reuse behavior or definitions.

a. **Generic Extension via Data**
json
"$extend": ["{{extraModulesBP ? extraModulesBP : []}}"]
If your data contains an extraModulesBP array, each listed module is applied.

b. **Specific Extension**
json
"$extend": ["death_animBP", "{{extraModulesBP ? extraModulesBP : []}}"]
Mixes targeted and data-driven module inclusion.
You can define other arrays like extraProjectileBP for specialized entity types.

🧮 5. **Using Data in Templates**
All data references use double curly braces, including numbers and booleans:

"minecraft:health": { "value": "{{stats.health}}" }
To define a default when a value doesn’t exist, use the ?? operator:

"minecraft:health": { "value": "{{=stats.health ?? 20}}" }
If stats.health isn’t found, 20 is used instead.

🔄 6. **Conditional Properties**
Conditional syntax ensures certain sections only appear when the data exists.

Conditional Example

"{{?animations}}": {
  "{{#animations}}": {
    "{{id}}": "animation.maca_mutants.{{name}}.{{type}}"
  }
}
If animations aren’t defined, the whole section is skipped.

Example for Spawn Rules
json
"{{#spawn}}": {
  "minecraft:spawns_{{suffix}}": "{{value}}"
}
Used with:

json
"spawn": [
  { "suffix": "on_surface", "value": true },
  { "suffix": "underground", "value": true }
]

🧭 7. **Using $scope for Local Data**
$scope allows defining short, localized datasets within a single template — useful when one data file doesn’t make sense.

Example: Copper Lantern Variants

"$scope": {
  "types": [
    { "lvl": 15, "stage": "", "waxed": false },
    { "lvl": 11, "stage": "exposed_", "waxed": false },
    { "lvl": 15, "stage": "", "waxed": true }
  ]
},
"$files": {
  "array": "{{types}}",
  "fileName": "wall_{{waxed == true ? 'waxed_' : ''}}{{stage}}copper_lantern.b"
}
Generates multiple lantern blocks automatically with unique names.

🧩 8. **File Structures**
Template File (.templ)

{
  "$scope": { /* optional */ },
  "$files": {
    "array": "array_name_here",
    "fileName": "file_name_here"
  },
  "$template": {
    // Insert block, item, or entity structure here
  }
}

Module File (.modl)

{
  "$module": "module_name_here",
  "$template": {
    "minecraft:block": {
      "description": {},
      "components": {},
      "component_groups": {},
      "events": {}
    }
  }
}

Modules act as mix-ins that can be extended into multiple templates using $extend.

🧠 9. Tips and Best Practices
✅ Use conditional logic and defaults to skip redundant values.

🧹 Keep your Data folder clear and organized (blocks, entities, items).

🧩 Name modules consistently (walkBP, death_animBP, etc.).

💡 Use $scope for small, self-contained variant generation.

⚡ Save time by templating reusable behavior like AI, events, or animations.
