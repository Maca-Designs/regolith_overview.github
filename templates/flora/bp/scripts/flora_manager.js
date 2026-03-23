import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";

//use tag "2Tall" if this flora should be 2 tall, add "growing_block" too if it grows into 2 tall or leave that out if its always 2 tall like a sunflower
//use tag "growing_block" if the block has more than one stage of growth
//if growing block is harvestable (like berries for instance) add tag "harvestable"
//use tag "spreading_block" if for instance a bonemealed flower should try to spread like vanilla - avoid combining growing and spreading

const growingBlockComponent = {
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
        // Get the current growth stage
        const currentStage = getGrowthStage(block);
        if (block.permutation.getState("maca_templ:sheared")) {
            block.setPermutation(block.permutation.withState("maca_templ:sheared", false));
        }

        // 45% chance to advance the stage
        if (Math.random() < 0.45) {
        const newStage = Math.min(data.maxStage, currentStage + 1)

        // Apply bonemeal effect
        applyBonemeal(block, dimension, player, equipment, selectedItem, newStage);

        // Check if the sapling should grow into a tree
        if (newStage === 2 && block.typeId.includes("sapling")) {
            const treeSize = treeSizeMap.get(block.typeId)
            growTree(block, dimension, treeSize.checkRadius, treeSize.checkHeight);
        }
        if (vineSet.has(block.typeId) && currentStage != 2){
            handleVineGrowth(block, true)
            return;
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

  if (block.typeId === "maca_templ:banana_bunch") {
    handleFruitGrowth(block, true)
    return;
  }
  if (vineSet.has(block.typeId)) {
    handleVineGrowth(block,true)
    return;
  }
  
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