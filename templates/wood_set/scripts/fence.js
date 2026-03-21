import { world, system, BlockPermutation, BlockTypes } from "@minecraft/server";

const stairList = new Set ([
      "minecraft:acacia_stairs",
      "minecraft:oak_stairs",
      "minecraft:dark_oak_stairs",
      "minecraft:pale_oak_stairs",
      "minecraft:birch_stairs",
      "minecraft:cherry_stairs",
      "minecraft:jungle_stairs",
      "minecraft:spruce_stairs",
      "minecraft:mangrove_stairs",
      "minecraft:bamboo_stairs",
      "minecraft:bamboo_mosaic_stairs",
      "minecraft:crimson_stairs",
      "minecraft:warped_stairs",
      "minecraft:normal_stone_stairs",
      "minecraft:end_stone_stairs",
      "minecraft:stone_stairs",
      "minecraft:smooth_stone_stairs",
      "minecraft:cobblestone_stairs",
      "minecraft:smooth_sandstone_stairs",
      "minecraft:sandstone_stairs",
      "minecraft:cut_sandstone_stairs",
      "minecraft:granite_stairs",
      "minecraft:polished_granite_stairs",
      "minecraft:diorite_stairs",
      "minecraft:polished_diorite_stairs",
      "minecraft:mud_brick_stairs",
      "minecraft:purpur_stairs",
      "minecraft:tuff_stairs",
      "minecraft:tuff_brick_stairs",
      "minecraft:polished_tuff_stairs",
      "minecraft:andesite_stairs",
      "minecraft:polished_andesite_stairs",
      "minecraft:smooth_red_sandstone_stairs",
      "minecraft:red_sandstone_stairs",
      "minecraft:cut_red_sandstone_stairs",
      "minecraft:mossy_cobblestone_stairs",
      "minecraft:mossy_stone_brick_stairs",
      "minecraft:stone_brick_stairs",
      "minecraft:nether_brick_stairs",
      "minecraft:red_nether_brick_stairs",
      "minecraft:blackstone_stairs",
      "minecraft:polished_blackstone_stairs",
      "minecraft:polished_blackstone_brick_stairs",
      "minecraft:end_stone_brick_stairs",
      "minecraft:quartz_stairs",
      "minecraft:smooth_quartz_stairs",
      "minecraft:prismarine_stairs",
      "minecraft:prismarine_bricks_stairs",
      "minecraft:resin_brick_stairs",
      "minecraft:brick_stairs",
      "minecraft:dark_prismarine_stairs",
      "minecraft:cobbled_deepslate_stairs",
      "minecraft:deepslate_stairs",
      "minecraft:polished_deepslate_stairs",
      "minecraft:deepslate_brick_stairs",
      "minecraft:deepslate_tile_stairs",
      "minecraft:cut_copper_stairs",
      "minecraft:weathered_cut_copper_stairs",
      "minecraft:oxidized_cut_copper_stairs",
      "minecraft:exposed_cut_copper_stairs",
      "minecraft:waxed_cut_copper_stairs",
      "minecraft:waxed_weathered_cut_copper_stairs",
      "minecraft:waxed_oxidized_cut_copper_stairs",
      "minecraft:waxed_exposed_cut_copper_stairs",
]);

const dirArray = [
  "west",
  "east",
  "north",
  "south"
]

// Define an array of block types to exclude from connections
export const ignoreList = new Set ([
      "minecraft:acacia_button",
      "minecraft:acacia_door",
      "minecraft:acacia_pressure_plate",
      "minecraft:acacia_stairs",
      "minecraft:acacia_slab",
      "minecraft:acacia_hanging_sign",
      "minecraft:acacia_leaves",
      "minecraft:acacia_trapdoor",
      "minecraft:acacia_sapling",
      "minecraft:oak_button",
      "minecraft:oak_door",
      "minecraft:oak_pressure_plate",
      "minecraft:oak_stairs",
      "minecraft:oak_slab",
      "minecraft:oak_hanging_sign",
      "minecraft:oak_leaves",
      "minecraft:oak_trapdoor",
      "minecraft:oak_sapling",
      "minecraft:dark_oak_button",
      "minecraft:dark_oak_door",
      "minecraft:dark_oak_pressure_plate",
      "minecraft:dark_oak_stairs",
      "minecraft:dark_oak_slab",
      "minecraft:dark_oak_hanging_sign",
      "minecraft:dark_oak_leaves",
      "minecraft:dark_oak_trapdoor",
      "minecraft:dark_oak_sapling",
      "minecraft:birch_button",
      "minecraft:birch_door",
      "minecraft:birch_pressure_plate",
      "minecraft:birch_stairs",
      "minecraft:birch_slab",
      "minecraft:birch_hanging_sign",
      "minecraft:birch_leaves",
      "minecraft:birch_trapdoor",
      "minecraft:birch_sapling",
      "minecraft:cherry_button",
      "minecraft:cherry_door",
      "minecraft:cherry_pressure_plate",
      "minecraft:cherry_stairs",
      "minecraft:cherry_slab",
      "minecraft:cherry_hanging_sign",
      "minecraft:cherry_leaves",
      "minecraft:cherry_trapdoor",
      "minecraft:cherry_sapling",
      "minecraft:jungle_button",
      "minecraft:jungle_door",
      "minecraft:jungle_pressure_plate",
      "minecraft:jungle_stairs",
      "minecraft:jungle_slab",
      "minecraft:jungle_hanging_sign",
      "minecraft:jungle_leaves",
      "minecraft:jungle_trapdoor",
      "minecraft:jungle_sapling",
      "minecraft:spruce_button",
      "minecraft:spruce_door",
      "minecraft:spruce_pressure_plate",
      "minecraft:spruce_stairs",
      "minecraft:spruce_slab",
      "minecraft:spruce_hanging_sign",
      "minecraft:spruce_leaves",
      "minecraft:spruce_trapdoor",
      "minecraft:spruce_sapling",
      "minecraft:pale_oak_button",
      "minecraft:pale_oak_door",
      "minecraft:pale_oak_pressure_plate",
      "minecraft:pale_oak_stairs",
      "minecraft:pale_oak_slab",
      "minecraft:pale_oak_hanging_sign",
      "minecraft:pale_oak_leaves",
      "minecraft:pale_oak_trapdoor",
      "minecraft:pale_oak_sapling",
      "minecraft:mangrove_button",
      "minecraft:mangrove_door",
      "minecraft:mangrove_pressure_plate",
      "minecraft:mangrove_stairs",
      "minecraft:mangrove_slab",
      "minecraft:mangrove_hanging_sign",
      "minecraft:mangrove_leaves",
      "minecraft:mangrove_trapdoor",
      "minecraft:mangrove_sapling",
      "minecraft:bamboo_button",
      "minecraft:bamboo_door",
      "minecraft:bamboo_pressure_plate",
      "minecraft:bamboo_stairs",
      "minecraft:bamboo_slab",
      "minecraft:bamboo_mosaic_stairs",
      "minecraft:bamboo_mosaic_slab",
      "minecraft:bamboo_hanging_sign",
      "minecraft:bamboo_leaves",
      "minecraft:bamboo_trapdoor",
      "minecraft:bamboo_sapling",
      // nether wood
      "minecraft:warped_button",
      "minecraft:warped_door",
      "minecraft:warped_pressure_plate",
      "minecraft:warped_stairs",
      "minecraft:warped_slab",
      "minecraft:warped_hanging_sign",
      "minecraft:warped_leaves",
      "minecraft:warped_trapdoor",
      "minecraft:warped_sapling",
      "minecraft:crimson_button",
      "minecraft:crimson_door",
      "minecraft:crimson_pressure_plate",
      "minecraft:crimson_stairs",
      "minecraft:crimson_slab",
      "minecraft:crimson_hanging_sign",
      "minecraft:crimson_leaves",
      "minecraft:crimson_trapdoor",
      "minecraft:crimson_sapling",
      // chests
      "minecraft:chest",
      "minecraft:trapped_chest",
      "minecraft:ender_chest",
      // shulker boxes
      "minecraft:white_shulker_box",
      "minecraft:orange_shulker_box",
      "minecraft:magenta_shulker_box",
      "minecraft:light_blue_shulker_box",
      "minecraft:yellow_shulker_box",
      "minecraft:lime_shulker_box",
      "minecraft:pink_shulker_box",
      "minecraft:gray_shulker_box",
      "minecraft:silver_shulker_box",
      "minecraft:cyan_shulker_box",
      "minecraft:undyed_shulker_box",
      "minecraft:blue_shulker_box",
      "minecraft:brown_shulker_box",
      "minecraft:green_shulker_box",
      "minecraft:red_shulker_box",
      "minecraft:black_shulker_box",
      // plants
      "minecraft:dandelion",
      "minecraft:poppy",
      "minecraft:blue_orchid",
      "minecraft:allium",
      "minecraft:azure_bluet",
      "minecraft:red_tulip",
      "minecraft:orange_tulip",
      "minecraft:white_tulip",
      "minecraft:pink_tulip",
      "minecraft:oxeye_daisy",
      "minecraft:eyeblossom",
      "minecraft:closed_eyeblossom",
      "minecraft:sunflower",
      "minecraft:lilac",
      "minecraft:rose_bush",
      "minecraft:peony",
      "minecraft:cornflower",
      "minecraft:lily_of_the_valley",
      "minecraft:wither_rose",
      "minecraft:torchflower",
      "minecraft:pitcher_plant",
      "minecraft:grass",
      "minecraft:tall_grass",
      "minecraft:tall_dry_grass",
      "minecraft:short_dry_grass",
      "minecraft:firefly_bush",
      "minecraft:fern",
      "minecraft:large_fern",
      "minecraft:deadbush",
      "minecraft:short_grass",
      "minecraft:sweet_berry_bush",
      "minecraft:seagrass",
      "minecraft:kelp",
      "minecraft:tall_seagrass",
      "minecraft:azalea",
      "minecraft:flowering_azalea",
      "minecraft:cocoa",
      "minecraft:reeds",
      // carpets
      "minecraft:white_carpet",
      "minecraft:orange_carpet",
      "minecraft:magenta_carpet",
      "minecraft:light_blue_carpet",
      "minecraft:yellow_carpet",
      "minecraft:lime_carpet",
      "minecraft:pink_carpet",
      "minecraft:gray_carpet",
      "minecraft:light_gray_carpet",
      "minecraft:cyan_carpet",
      "minecraft:purple_carpet",
      "minecraft:blue_carpet",
      "minecraft:brown_carpet",
      "minecraft:green_carpet",
      "minecraft:red_carpet",
      "minecraft:black_carpet",
      "minecraft:moss_carpet",
      "minecraft:pale_moss_carpet",
      "minecraft:pale_hanging_moss",
      // Regular Copper
      "minecraft:copper_slab",
      "minecraft:copper_trapdoor",
      "minecraft:copper_door",
      "minecraft:copper_button",
      "minecraft:copper_stairs",
      // Weathered Copper
      "minecraft:weathered_copper_slab",
      "minecraft:weathered_copper_trapdoor",
      "minecraft:weathered_copper_door",
      "minecraft:weathered_copper_button",
      "minecraft:weathered_copper_stairs",
      // Oxidized Copper
      "minecraft:oxidized_copper_slab",
      "minecraft:oxidized_copper_trapdoor",
      "minecraft:oxidized_copper_door",
      "minecraft:oxidized_copper_button",
      "minecraft:oxidized_copper_stairs",
      // Exposed Copper 
      "minecraft:exposed_copper_slab",
      "minecraft:exposed_copper_trapdoor",
      "minecraft:exposed_copper_door",
      "minecraft:exposed_copper_button",
      "minecraft:exposed_copper_stairs",
      // Waxed Copper Variants
      "minecraft:waxed_copper_slab",
      "minecraft:waxed_copper_trapdoor",
      "minecraft:waxed_copper_door",
      "minecraft:waxed_copper_button",
      "minecraft:waxed_copper_stairs",
      "minecraft:waxed_weathered_copper_slab",
      "minecraft:waxed_weathered_copper_trapdoor",
      "minecraft:waxed_weathered_copper_door",
      "minecraft:waxed_weathered_copper_button",
      "minecraft:waxed_weathered_copper_stairs",
      "minecraft:waxed_oxidized_copper_slab",
      "minecraft:waxed_oxidized_copper_trapdoor",
      "minecraft:waxed_oxidized_copper_door",
      "minecraft:waxed_oxidized_copper_button",
      "minecraft:waxed_oxidized_copper_stairs",
      "minecraft:waxed_exposed_copper_slab",
      "minecraft:waxed_exposed_copper_trapdoor",
      "minecraft:waxed_exposed_copper_door",
      "minecraft:waxed_exposed_copper_button",
      "minecraft:waxed_exposed_copper_stairs",
      // beds      
      "minecraft:white_bed",
      "minecraft:orange_bed",
      "minecraft:magenta_bed",
      "minecraft:light_blue_bed",
      "minecraft:yellow_bed",
      "minecraft:lime_bed",
      "minecraft:pink_bed",
      "minecraft:gray_bed",
      "minecraft:light_gray_bed",
      "minecraft:cyan_bed",
      "minecraft:purple_bed",
      "minecraft:blue_bed",
      "minecraft:brown_bed",
      "minecraft:green_bed",
      "minecraft:red_bed",
      "minecraft:black_bed",
      // rest of slab types
      "minecraft:stone_slab",
      "minecraft:smooth_stone_slab",
      "minecraft:cobblestone_slab",
      "minecraft:smooth_sandstone_slab",
      "minecraft:sandstone_slab",
      "minecraft:cut_sandstone_slab",
      "minecraft:granite_slab",
      "minecraft:polished_granite_slab",
      "minecraft:diorite_slab",
      "minecraft:polished_diorite_slab",
      "minecraft:andesite_slab",
      "minecraft:polished_andesite_slab",
      "minecraft:red_sandstone_slab",
      "minecraft:cut_red_sandstone_slab",
      "minecraft:mossy_cobblestone_slab",
      "minecraft:mossy_stone_brick_slab",
      "minecraft:stone_brick_slab",
      "minecraft:nether_brick_slab",
      "minecraft:red_nether_brick_slab",
      "minecraft:blackstone_slab",
      "minecraft:polished_blackstone_slab",
      "minecraft:polished_blackstone_brick_slab",
      "minecraft:end_stone_brick_slab",
      "minecraft:quartz_slab",
      "minecraft:smooth_quartz_slab",
      "minecraft:prismarine_slab",
      "minecraft:prismarine_brick_slab",
      "minecraft:dark_prismarine_slab",
      "minecraft:deepslate_slab",
      "minecraft:polished_deepslate_slab",
      "minecraft:deepslate_brick_slab",
      "minecraft:deepslate_tile_slab",
      // rest of stair types
      "minecraft:stone_stairs",
      "minecraft:smooth_stone_stairs",
      "minecraft:cobblestone_stairs",
      "minecraft:smooth_sandstone_stairs",
      "minecraft:sandstone_stairs",
      "minecraft:cut_sandstone_stairs",
      "minecraft:granite_stairs",
      "minecraft:polished_granite_stairs",
      "minecraft:diorite_stairs",
      "minecraft:polished_diorite_stairs",
      "minecraft:andesite_stairs",
      "minecraft:polished_andesite_stairs",
      "minecraft:red_sandstone_stairs",
      "minecraft:cut_red_sandstone_stairs",
      "minecraft:mossy_cobblestone_stairs",
      "minecraft:mossy_stone_brick_stairs",
      "minecraft:stone_brick_stairs",
      "minecraft:nether_brick_stairs",
      "minecraft:red_nether_brick_stairs",
      "minecraft:blackstone_stairs",
      "minecraft:polished_blackstone_stairs",
      "minecraft:polished_blackstone_brick_stairs",
      "minecraft:end_stone_brick_stairs",
      "minecraft:quartz_stairs",
      "minecraft:smooth_quartz_stairs",
      "minecraft:prismarine_stairs",
      "minecraft:prismarine_brick_stairs",
      "minecraft:dark_prismarine_stairs",
      "minecraft:deepslate_stairs",
      "minecraft:polished_deepslate_stairs",
      "minecraft:deepslate_brick_stairs",
      "minecraft:deepslate_tile_stairs",
      // nether plants, ladder, rails
      "minecraft:nether_wart",
      "minecraft:crimson_roots",
      "minecraft:warped_roots",
      "minecraft:nether_sprouts",
      "minecraft:weeping_vines",
      "minecraft:twisting_vines",
      "minecraft:crimson_fungus",
      "minecraft:warped_fungus",
      "minecraft:ladder",
      "minecraft:vine",
      "minecraft:weeping_vines",
      "minecraft:twisting_vines",
      "minecraft:rail",
      "minecraft:powered_rail",
      "minecraft:detector_rail",
      "minecraft:activator_rail",
      // light sources
      "minecraft:torch",
      "minecraft:soul_torch",
      "minecraft:redstone_torch",
      "minecraft:campfire",
      "minecraft:soul_campfire",
      "minecraft:fire",
      "minecraft:lantern",
      "minecraft:soul_lantern",
      "minecraft:candle",
      "minecraft:white_candle",
      "minecraft:orange_candle",
      "minecraft:magenta_candle",
      "minecraft:light_blue_candle",
      "minecraft:yellow_candle",
      "minecraft:lime_candle",
      "minecraft:pink_candle",
      "minecraft:gray_candle",
      "minecraft:light_gray_candle",
      "minecraft:cyan_candle",
      "minecraft:purple_candle",
      "minecraft:blue_candle",
      "minecraft:brown_candle",
      "minecraft:green_candle",
      "minecraft:red_candle",
      "minecraft:black_candle",
      // rest of pressure plates
      "maca_templ:jacaranda_pressure_plate",
      "maca_templ:redwood_pressure_plate",
      "maca_templ:osage_pressure_plate",
      "maca_templ:palm_pressure_plate",
      "maca_templ:fresh_banana_pressure_plate",
      "maca_templ:dried_banana_pressure_plate",
      "minecraft:stone_pressure_plate",
      "minecraft:polished_blackstone_pressure_plate",
      "minecraft:light_weighted_pressure_plate",
      "minecraft:heavy_weighted_pressure_plate",
      // other stuff in items category
      "minecraft:leaf_litter",
      "minecraft:scaffolding",
      "minecraft:anvil",
      "minecraft:grindstone",
      "minecraft:lectern",
      "minecraft:enchanting_table",
      "minecraft:brewing_stand",
      "minecraft:flower_pot",
      "minecraft:cobweb",
      "minecraft:bell",
      "minecraft:sea_pickle",
      "minecraft:glow_frame",
      "minecraft:frame",
      "minecraft:snow_layer"

    // Add other block types you want to exclude
]);


//add back in directions
export class Gate_Manager {
    static update_Gate_States(Gate) {
        let north = undefined;
        try {
            north = Gate.north(1);
        } catch { }
        let south = undefined;
        try {
            south = Gate.south(1);
        } catch { }
        let east = undefined;
        try {
            east = Gate.east(1);
        } catch { }
        let west = undefined;
        try {
            west = Gate.west(1);
        } catch { }
        const blocks = [
            { block: north, side: "north" },
            { block: south, side: "south" },
            { block: east, side: "east" },
            { block: west, side: "west" },
        ];
        let inWall = false
        for (const blockData of blocks) {
            if (blockData.block != undefined) {       
                const dir = Gate.permutation.getState("minecraft:cardinal_direction")          
                if (blockData.block.hasTag("maca_templ:is_wall") || (blockData.block.typeId.includes("minecraft:") && blockData.block.typeId.includes("wall") && dir !== blockData.side && blockData.side !== oppositeDir(dir))) {
                    inWall = true
                }
              }
        }
        if (inWall && !Gate.permutation.getState("maca_templ:in_wall_bit")) {
          Gate.setPermutation(Gate.permutation.withState("maca_templ:in_wall_bit", true));
        }
        if (Gate.permutation.getState("maca_templ:in_wall_bit") == true && !inWall) {
          Gate.setPermutation(Gate.permutation.withState("maca_templ:in_wall_bit", false));
        }  
    }
    static updateGatesAround(Block) {
        let north = undefined;
        try {
            north = Block.north(1);
        } catch { }
        let south = undefined;
        try {
            south = Block.south(1);
        } catch { }
        let east = undefined;
        try {
            east = Block.east(1);
        } catch { }
        let west = undefined;
        try {
            west = Block.west(1);
        } catch { }
        const blocks = [Block, north, south, east, west];
        for (const block of blocks) {
            if (block != undefined) {
                if (block.hasTag("maca_templ:is_gate")) {
                    this.update_Gate_States(block);
                }
                
            }
        }
    }
}

export const GateInteract = {
    onPlayerInteract(e) {
        // Destructure event data for easier access
        const { block, player } = e;

        if (player.isSneaking) return;

        // Toggle the 'maca_templ:open' state between false and true and determine the sound effect to play
        const currentState = block.permutation.getState('maca_templ:open');
        const newOpenState = !currentState;
        const sound = newOpenState ? 'open.fence_gate' : 'close.fence_gate';
        const newCardinalDirection = block.permutation.getState('minecraft:cardinal_direction');
        const direction = newOpenState ? isPlayerInFront(player.location, block.location, newCardinalDirection) : false;

        // Update the block's permutation with the new states
        const newPermutation = BlockPermutation.resolve(block.typeId, {
            ...block.permutation.getAllStates(),
            'maca_templ:open': newOpenState,
            'minecraft:cardinal_direction': newCardinalDirection,
            'maca_templ:direction': direction,
            "maca_templ:powered": false
        });

        // Apply the new permutation and play the sound
        block.setPermutation(newPermutation);
        block.dimension.playSound(sound, block.location);
    },
    onRedstoneUpdate(e) {
      const {block, dimension, powerLevel} = e;
      // Toggle the 'maca_templ:open' state between false and true and determine the sound effect to play
      const currentState = block.permutation.getState('maca_templ:open');
      const sound = 'open.fence_gate';

      // Update the block's permutation with the new states
      const newPermutation = BlockPermutation.resolve(block.typeId, {
          ...block.permutation.getAllStates(),
          'maca_templ:open': true,
          "maca_templ:powered": true
      });

      // Apply the new permutation and play the sound
      block.setPermutation(newPermutation);
      if (currentState) return;
      dimension.playSound(sound, block.location);
    }
};


export const gatePower = {
  onTick(e) {
      const {block, dimension} = e;
      const pwr = block.getRedstonePower();
      if (pwr > 0) return;
      // Update the block's permutation with the new states
      const newPermutation = BlockPermutation.resolve(block.typeId, {
          ...block.permutation.getAllStates(),
          'maca_templ:open': false,
          "maca_templ:powered": false
      });

      // Apply the new permutation and play the sound
      block.setPermutation(newPermutation);
      dimension.playSound('close.fence_gate', block.location);
  }
}

function generateStructureName(blockTypeId) {
  // Remove the namespace and quotation marks, and keep the full name of the block - be sure your structure files are named the same as their block identifier
  const blockNamePart = blockTypeId.replace(/^maca_templ:/, "");
  return blockNamePart;
}

function getBlockStatesAndDirection(player, selectedItem, face) {
  const blockPermutation = BlockPermutation.resolve(selectedItem.typeId);
  const blockStates = blockPermutation.getAllStates();
  let stateName = null;
  let stateValue = null;

  // Prioritize block states in a specific order
  const statePriority = [
    "minecraft:vertical_half",
    "minecraft:block_face",
    "minecraft:cardinal_direction",
    "pillar_axis",
    "facing_direction",
  ];
  for (const state of statePriority) {
    if (blockStates[state] !== undefined) {
      stateName = state;
      if (state === "pillar_axis") {
        // Determine pillar_axis based on face
        if (["North", "South"].includes(face)) {
          stateValue = "z";
        } else if (["East", "West"].includes(face)) {
          stateValue = "x";
        } else {
          stateValue = "y";
        }
      } else if (state === "minecraft:cardinal_direction") {
        // Calculate direction based on player's rotation
        const rotation = player.getRotation();
        const rad = (rotation.y * Math.PI) / 180;
        const directionX = -Math.sin(rad);
        const directionZ = Math.cos(rad);

        // Determine cardinal direction based on calculated direction
        if (Math.abs(directionX) > Math.abs(directionZ)) {
          stateValue = directionX > 0 ? "east" : "west";
        } else {
          stateValue = directionZ > 0 ? "south" : "north";
        }
      } else if (state === "facing_direction") {
        // Calculate direction based on player's rotation
        const rotation = player.getRotation();
        const rad = (rotation.y * Math.PI) / 180;
        const directionX = -Math.sin(rad);
        const directionZ = Math.cos(rad);

        // Determine cardinal direction based on calculated direction
        if (Math.abs(directionX) > Math.abs(directionZ)) {
          stateValue = directionX > 0 ? 2 : 3;
        } else {
          stateValue = directionZ > 0 ? 0 : 1;
        }
      } else if (state === "minecraft:block_face") {
        // Determine block_face based on face
        stateValue = face.toLowerCase();
      } else if (state === "minecraft:vertical_half") {
        // Use getBlockFromViewDirection to get the exact hit location on the block face
        const raycastOptions = {
          maxDistance: 5, // Adjust as needed
          includePassableBlocks: false,
        };

        const raycastHit = player.getBlockFromViewDirection(raycastOptions);

        if (raycastHit) {
          const faceLocation = raycastHit.faceLocation;

          if (face === "Up" || face === "Down") {
            stateValue = face === "Up" ? "bottom" : "top";
          } else {
            // For side faces, use the y-coordinate of the faceLocation
            stateValue = faceLocation.y > 0.5 ? "top" : "bottom";
          }
        } else {
          // Fallback to default behavior if raycast fails
          if (face === "Up") {
            stateValue = "bottom";
          } else if (face === "Down") {
            stateValue = "top";
          } else {
            stateValue = "bottom"; // Default to bottom for non-slab blocks
          }
        }
      } else {
        stateValue = blockStates[state];
      }
      break;
    }
  }

  return { stateName, stateValue };
};

// Set block fence tag here
const fenceTag = 'maca_templ:is_fence'

export class Fence_Manager {
    static update_Fence_States(Fence) {
        let north = undefined;
        try {
            north = Fence.north(1);
        } catch { }
        let south = undefined;
        try {
            south = Fence.south(1);
        } catch { }
        let east = undefined;
        try {
            east = Fence.east(1);
        } catch { }
        let west = undefined;
        try {
            west = Fence.west(1);
        } catch { }
        const blocks = [
            { block: north, side: "north" },
            { block: south, side: "south" },
            { block: east, side: "east" },
            { block: west, side: "west" },
        ];

        // Set post state
        Fence.setPermutation(Fence.permutation.withState("maca_templ:post", 1));

        for (const blockData of blocks) {
            if (blockData.block != undefined) {
              if (stairList.has(blockData.block.typeId) || blockData.block.hasTag("maca_templ:is_stair")) {
                const perm = blockData.block.hasTag("maca_templ:is_stair") ? blockData.block.permutation.getState("minecraft:cardinal_direction") : blockData.block.permutation.getState("weirdo_direction");
                const dirCheck = blockData.block.hasTag("maca_templ:is_stair") ? oppositeDir(perm) === blockData.side : dirArray[perm] === blockData.side;
                if (dirCheck) Fence.setPermutation(Fence.permutation.withState("maca_templ:connect_" + blockData.side, 1));
                continue;
              } else if (!(ignoreList.has(blockData.block.typeId) || blockData.block.isLiquid || blockData.block.isAir || blockData.block.typeId.includes("button") || blockData.block.hasTag("maca_templ:no_connect") && !(blockData.block.hasTag("maca_templ:is_fence") || blockData.block.hasTag("maca_templ:is_gate"))) && !blockData.block.hasTag("maca_templ:inventory_wall")) {
                  Fence.setPermutation(Fence.permutation.withState("maca_templ:connect_" + blockData.side, 1));
              } else if (Fence.hasTag("maca_templ:inventory_wall") && blockData.block.hasTag("maca_templ:inventory_wall")) {
                    Fence.setPermutation(Fence.permutation.withState("maca_templ:connect_" + blockData.side, 1));
            } else {
                  Fence.setPermutation(Fence.permutation.withState("maca_templ:connect_" + blockData.side, 0));
              }
          }
        }
    }

    static updateFencesAround(Block) {
        let north = undefined;
        try {
            north = Block.north(1);
        } catch { }
        let south = undefined;
        try {
            south = Block.south(1);
        } catch { }
        let east = undefined;
        try {
            east = Block.east(1);
        } catch { }
        let west = undefined;
        try {
            west = Block.west(1);
        } catch { }
        const blocks = [Block, north, south, east, west];
        for (const block of blocks) {
            if (block != undefined) {
                if (block.hasTag(fenceTag)) {
                  this.update_Fence_States(block);                  
                }
            }
        }
    }
}

export function oppositeDir(face) {
    switch(face.toLowerCase()) {
        case "north": return "south";
        case "south": return "north";
        case "east":  return "west";
        case "west":  return "east";
        default:      return null; // or throw error if invalid input
    }
}

function isPlayerInFront(playerLoc, blockLoc, blockDir) {
  const centerX = blockLoc.x + 0.5;
  const centerZ = blockLoc.z + 0.5;
  const dx = playerLoc.x - centerX;
  const dz = playerLoc.z - centerZ;

  const dirLower = blockDir.toLowerCase();
  switch (dirLower) {
    case "north":
      return dz < 0;  // Player to the north (lower Z)
    case "south":
      return dz > 0;  // Player to the south (higher Z)
    case "east":
      return dx < 0;  // Player to the west (lower X)
    case "west":
      return dx > 0;  // Player to the east (higher X)
    default:
      throw new Error(`Invalid blockDir: ${blockDir}`);
  }
}

export {
    generateStructureName,
    getBlockStatesAndDirection
};