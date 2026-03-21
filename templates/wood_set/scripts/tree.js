import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";
import { applyDurabilityDamage, sapSet } from "./tree_main";
import { getBlockStatesAndDirection } from "./fence"; 
import { randomNum } from "./RandomTick"

  const foliageIgnoreList = new Set([
    "minecraft:air",
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
      "minecraft:sweet_berry_bush"
  ])

export const treeInteractComponent = {
  onPlayerInteract(eventData) {
    const { player, block, dimension, face } = eventData;
    const equipment = player.getComponent("equippable");
    const selectedItem = equipment.getEquipment("Mainhand");
    let blockPermutation;
    try {
      blockPermutation = BlockPermutation?.resolve(selectedItem.typeId);
    } catch {
      blockPermutation = false
    };

    if (selectedItem?.typeId === "minecraft:bone_meal") {
      

    if (!block || !block.hasTag("maca_templ:growing_block")) return;
      
    // Get the current growth stage
    const currentStage = getGrowthStage(block);

    // 45% chance to advance the stage
    if (Math.random() < 0.45) {
      const newStage = Math.min(2, currentStage + 1)

      // Apply bonemeal effect
      applyBonemeal(block, dimension, player, equipment, selectedItem, newStage);

      // Check if the sapling should grow into a tree
      if (newStage === 2 && block.typeId.includes("sapling")) {
        growTree(block, dimension);
      }
    } else {
      // Bonemeal was used but didn't advance the stage
      applyBonemealEffect(block, dimension, player, equipment, selectedItem);
    }
    return;
  } 
  }
};

function getGrowthStage(block) {
  // Assuming the growth state ID is "maca_templ:growth_stage"
  return block.permutation.getState("maca_templ:growth_stage") || 0;
}

function applyBonemealEffect(block, dimension, player, inventory, selectedItem) {
  try {
    dimension.spawnParticle("minecraft:crop_growth_emitter", block.center());
  } catch (error) {
    // Handle or ignore the error
  }
  dimension.playSound("item.bone_meal.use", block.center());

  // Reduce bone meal item
  if (player.getGameMode() !== "Creative") {
    if (selectedItem.amount === 1) {
      inventory.setEquipment("Mainhand", undefined);
    } else {
      selectedItem.amount -= 1;
      inventory.setEquipment("Mainhand", selectedItem);
    }
  }
}

function applyBonemeal(block, dimension, player, equipment, selectedItem, newStage) {
  applyBonemealEffect(block, dimension, player, equipment, selectedItem);
  
  // Set the new growth stage
  block.setPermutation(block.permutation.withState("maca_templ:growth_stage", newStage));

  if (block.hasTag("maca_templ:2Tall") && block.hasTag("maca_templ:growing_block")) {
    const above = block.above()
    if (above.typeId !== "minecraft:air" && above.typeId !== block.typeId) return;
    if(above.typeId === "minecraft:air"){
      above.setType(block.typeId);
      const newAbove = block.above();
      newAbove.setPermutation(newAbove.permutation.withState("maca_templ:top", true));
    } else {
      above.setPermutation(block.permutation.withState("maca_templ:growth_stage", newStage - 1));
    }
  }
}

function growTree(block, dimension) {
  const { x, y, z } = block.location;
  const anchor = has2x2Saplings(dimension, x, y, z, block.typeId);
  let baseTreeType = block.typeId.split(":")[1].replace("_sapling", "");
  const name = `maca_templ:${baseTreeType}_feature`;
  if (block.hasTag("maca_templ:2x2") && anchor != null) {
      system.run(() => {
        dimension.placeFeature(name, {x: anchor[0], y: y, z: anchor[1]});
      });
    } else {
      system.run(() => {
        try {
          dimension.placeFeature(name, block.location);
        } catch {}
      });
    }
}

function has2x2Saplings(dimension, x, y, z, saplingTypeId, remove) {
  const anchors = [
    [0, 0],   // (x, z)
    [-1, 0],  // (x-1, z)
    [0, -1],  // (x, z-1)
    [-1, -1]  // (x-1, z-1)
  ];

  for (const [dx, dz] of anchors) {
    // For each possible anchor, check the 2x2 square starting at (x+dx, y, z+dz)
    const bx = x + dx;
    const bz = z + dz;
    // Read each block in the 2x2
    const a = dimension.getBlock({ x: bx,   y, z: bz   });
    const b = dimension.getBlock({ x: bx+1, y, z: bz   });
    const c = dimension.getBlock({ x: bx,   y, z: bz+1 });
    const d = dimension.getBlock({ x: bx+1, y, z: bz+1 });

    // Check that all blocks exist and match the sapling type
    if (
      a && b && c && d &&
      a.typeId === saplingTypeId &&
      b.typeId === saplingTypeId &&
      c.typeId === saplingTypeId &&
      d.typeId === saplingTypeId
    ) {
      if (remove) {
        a.setType("air")
        b.setType("air")
        c.setType("air")
        d.setType("air")
        return;
      }
      return [bx, bz]; // Return the upper-left of the matching 2x2 cluster
    }
  }
  return null; 
}

export function stripLog(player, block, selectedItem, inventory, selectedSlotIndex) {
  const stippedLogType = `maca_templ:stripped_${block.typeId.split(":")[1]}`
  if (!stippedLogType) return;

  const currentPermutation = block.permutation;
  const blockStates = currentPermutation.getAllStates();
  const customBlockFace = blockStates["minecraft:block_face"];

  if (stippedLogType.includes('_wood')) {
    const strippedLogPermutation = BlockPermutation.resolve(
      stippedLogType
    )
    block.setPermutation(strippedLogPermutation);
  } else {
      const strippedLogPermutation = BlockPermutation.resolve(
        stippedLogType
      ).withState("minecraft:block_face", customBlockFace);
      block.setPermutation(strippedLogPermutation);
  }
  player.dimension.playSound("use.wood", block.location);
  
  // Apply durability damage for log stripping
  applyDurabilityDamage(player, selectedItem, inventory, selectedSlotIndex);
}

export {
  growTree,
  getGrowthStage
};