import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";

//use tag "2Tall" for blocks that start as 1 block and grow to 2, not needed for normal 2 tall flowers for instance
//use tag "growing_block" if the block has more than one stage of growth
//if growing block is harvestable (like berries for instance) add tag "harvestable"
//use tag "spreading_block" if for instance a bonemealed flower should try to spread like vanilla - avoid combining growing and spreading

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("maca_templ:floraInteractComponent", floraInteractComponent);
    blockComponentRegistry.registerCustomComponent("maca_templ:floraRandomTickComponent", floraRandomTickComponent);
    blockComponentRegistry.registerCustomComponent("maca_templ:place2TallComponent", twoTallPlacement);
});

const twoTallPlacement = {
    onPlace(e){
        const {block, dimension} = e;
        const aboveBlock = block.above();
        if (!aboveBlock.isAir) {
            system.run(() =>{
                if (!block.permutation.getState("maca_templ:top")) {
                    block.setType("air");
                    dimension.playSound("break.big_dripleaf", block.location);
                    const drop = new ItemStack(block.typeId, 1)
                    dimension.spawnItem(drop, block.location)
                }
            })
            
        } else if (!block.permutation.getState("maca_templ:top")) {
          const perm = BlockPermutation.resolve(block.typeId, {
            "maca_templ:top", true
          });
          aboveBlock.setPermutation(perm);
        }
    }
}

const floraRandomTickComponent = {
  onRandomTick(e) {
    const { block, dimension, params } = e;
    try {
      if (block.hasTag("maca_templ:2Tall") && block.hasTag("maca_templ:growing_block")) {
        const above = block.above()
        if (above.typeId !== "minecraft:air" || above.typeId === block.typeId) return;
        above.setType(block.typeId);
        const newAbove = block.above();
        block.setPermutation(block.permutation.withState("maca_templ:growth_stage", 1));
        newAbove.setPermutation(newAbove.permutation.withState("maca_templ:growth_stage", 2));
      } else if (!block.hasTag("maca_templ:is_vine")) {
        if (Math.random() < 0.35) {
          const currentStage = getGrowthStage(block, params.state_name);
          const newStage = Math.min(params.max_stage, currentStage + 1)
          block.setPermutation(block.permutation.withState(params.state_name, newStage));
        }
      } else if (block.hasTag("maca_templ:is_vine")) {
        handleVineGrowth(block, false);
      } 
    } catch {}
  }
};

const floraInteractComponent = {
  onPlayerInteract(eventData) {
    const { player, block, dimension, face, params } = eventData;
    const equipment = player.getComponent("equippable");
    const selectedItem = equipment.getEquipment("Mainhand");
    let blockPermutation;
    try {
      blockPermutation = BlockPermutation?.resolve(selectedItem.typeId);
    } catch {
      blockPermutation = false
    };

    if (block.hasTag("maca_templ:harvestable") && getGrowthStage(block, params.state_name) === params.max_stage) {
      harvest(block, params.drop)
      return;
    } 
    if (selectedItem?.typeId === "minecraft:shears") {
        if (face == "Up" && !block.hasTag("maca_templ:is_vine")) {
          if (!block.hasTag("maca_templ:growing_block")) return;
          block.setPermutation(block.permutation.withState("maca_templ:sheared", true));
          player.playSound("mob.sheep.shear", { pitch: 1.0, volume: 1.0 })
        } else if (face == "Down") {
          if (!block.hasTag("maca_templ:is_vine") && !block.hasTag("maca_templ:growing_block")) return;
          block.setPermutation(block.permutation.withState("maca_templ:sheared", true));
          player.playSound("mob.sheep.shear", { pitch: 1.0, volume: 1.0 });
        }
        return;
    }

    if (selectedItem?.typeId === "minecraft:bone_meal") {

      if (block.hasTag("maca_templ:spreading_block")) {
        handleFlowerSpread(block);
        applyBonemealEffect(block, dimension, player, equipment, selectedItem);
        return;
      }
      
      if (!block || !block.hasTag("maca_templ:growing_block")) return;
        
      // Get the current growth stage
      const currentStage = getGrowthStage(block, params.state_name);
      if (block.permutation.getState("maca_templ:sheared")) {
          block.setPermutation(block.permutation.withState("maca_templ:sheared", false));
      }

      // 45% chance to advance the stage
      if (Math.random() < 0.45) {
        const newStage = Math.min(params.max_stage, currentStage + 1)

        // Apply bonemeal effect
        applyBonemeal(block, dimension, player, equipment, selectedItem, newStage, params.max_stage);
      } else {
        // Bonemeal was used but didn't advance the stage
        applyBonemealEffect(block, dimension, player, equipment, selectedItem);
      }
      return;
    } else if (selectedItem?.hasTag("maca_templ:is_vine") && face === "Down") {
      if (block.below().isAir) handleVineGrowth(block, true)
    } 
  }
};

function getGrowthStage(block, state) {
  return block.permutation.getState(state) || 0;
}

function applyBonemealEffect(block, dimension, player, inventory, selectedItem) {
  try {
    dimension.spawnParticle("minecraft:crop_growth_emitter", block.center());
  } catch (error) {
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

function applyBonemeal(block, dimension, player, equipment, selectedItem, newStage, maxStage) {
  applyBonemealEffect(block, dimension, player, equipment, selectedItem);
  if (block.hasTag("maca_templ:is_vine") && currentStage != maxStage) {
    handleVineGrowth(block,true)
    return;
  }
  
  // Set the new growth stage
  block.setPermutation(block.permutation.withState("maca_templ:growth_stage", newStage));

  if (block.hasTag("maca_templ:2Tall") && block.hasTag("maca_templ:growing_block")) {
    const above = block.above()
    if (above.typeId !== "minecraft:air" || above.typeId === block.typeId) return;
    above.setType(block.typeId);
    const newAbove = block.above();
    block.setPermutation(block.permutation.withState("maca_templ:growth_stage", 1));
    newAbove.setPermutation(newAbove.permutation.withState("maca_templ:growth_stage", 2));
  }
}

function harvest(block, params) {
  const data = dropQty(params);
  system.runTimeout(() => {
    block.dimension.spawnItem(new ItemStack(data.drop, data.qty), block.location);
    if (data.drop) {
      let newStage = params.base_stage; // needed sometimes for when you do not want to reset all the way back to 0, like a vine might have a tip, main and harvestable state and you may want to go back to 1
      block.setPermutation(block.permutation.withState("maca_templ:growth_stage", newStage));
    }
  },1);
};

function dropQty(params) {
  let qty = 0
  const baseQTY = params.harvest.qty;
  const drop = params.harvest.item;
  qty = Math.round(baseQTY * Math.max(0.5, (Math.random() + 0.5))) //0.5x - 1.5x multiplier from base drop qty
  return {qty, drop};
}

export function handleVineGrowth(block, bonemealed) {
  const blockBelow = block.below();
  let state = block.permutation.getState("maca_templ:growth_stage");
  if (state == 1) return;
  if (blockBelow?.typeId !== "minecraft:air") return;
    const chance = Math.random()*10
  if (!bonemealed) {
    if (chance >0.2) return;
  }
  blockBelow.setType(block.typeId)
  const newBlock = block.below();
  try{
    block.setPermutation(block.permutation.withState("maca_templ:growth_stage", 1))
    const face = block.permutation.getState("minecraft:block_face")
    newBlock.setPermutation(newBlock.permutation.withState("minecraft:block_face", face))
    const isHanging = vineCheck(newBlock, face)
    if (!isHanging) return;
    newBlock.setPermutation(newBlock.permutation.withState("maca_templ:hanging", 1).withState("minecraft:block_face", "down"))
  } catch {}
}

function vineCheck(block, dir) {
  let isAir = false
  switch(dir) {
    case "north":
      isAir = block.south().isAir
      break;
    case "south":
      isAir = block.north().isAir
      break;
    case "east":
      isAir = block.west().isAir
      break;
    case "west":
      isAir = block.east().isAir
      break;
  }
  return isAir;
}

function handleFlowerSpread(block) {
  const dim = block.dimension;
  const groundBlock = block.below();
  const flowerCount = Math.floor(Math.random() * 4) + 2; // 2-5 flowers

  const x = block.location.x;
  const y = block.location.y;
  const z = block.location.z;

  for (let tries = 0; tries < 8; tries++) {
    if (flowerCount <= 0) break;

    const dx = Math.floor(Math.random() * 5) - 1;
    const dz = Math.floor(Math.random() * 5) - 1;
    if (dx === 0 && dz === 0) continue; // skip the block itself

    const targetPos = { x: x + dx, y, z: z + dz };
    const targetBlock = dim.getBlock(targetPos);

    if (targetBlock && ["minecraft:grass", "minecraft:air"].includes(targetBlock.typeId) && ["minecraft:grass_block", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:dirt_with_roots", "minecraft:podzol"].includes(targetBlock.below().typeId)) {
      try {
        dim.setBlock(block.typeId, targetPos);
        flowerCount--;
      } catch(e) {
      }
    }
  }
}