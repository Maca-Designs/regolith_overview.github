import { system, ItemStack, world } from '@minecraft/server';
import { growTree, getGrowthStage } from './tree';

export const randomTickComponent = {
  onRandomTick(e) {
    const { block, dimension } = e;
    try {
      if (block.hasTag("maca_templ:is_leaf")){
        if (randomNum(1,10) < 9) return;
        playParticle(block)
      }
      if (block.hasTag("maca_templ:is_sapling")) {
        handleSaplingGrowth(block, dimension);
      } 
    } catch {}
  }
};

export const decayOnTickComponent = {
  onTick(e) {
    const { block, dimension } = e;
    if (block.hasTag("maca_templ:is_leaf")) {
      if (block == undefined) return;
      handleLeafDecay(block, dimension);
    }
  }
};

function playParticle(block) {
    const loc = block.center()
    block.dimension.spawnParticle(block.typeId, loc)
    const players = block.dimension.getEntities({type: "player", location: loc, maxDistance:16})
    if (players.length < 1) return;
    block.dimension.spawnParticle(block.typeId, loc);
}

export function randomNum(min, max) {
  return Math.random() * (max - min) + min;
}

function handleSaplingGrowth(block, dimension) {
  const stage = getGrowthStage(block);
  if (stage == undefined) return;
  if (stage >= 2) return;

  const num = randomNum(0, 10);
  if (num > 1) return;
  const newStage = stage + 1;
  block.setPermutation(block.permutation.withState("maca_templ:growth_stage", newStage));

  if (newStage === 2) {
    growTree(block, dimension);
  }
}

function handleLeafDecay(block, dimension) {
  const currentTier = block.permutation.getState("maca_templ:decay_tier") || 0;
  const newDecayTier = getNewDecayTier(block, dimension, currentTier);
  if (newDecayTier === 0) {
    leafDrop(block);
  } else if (newDecayTier !== currentTier) {
    block.setPermutation(block.permutation.withState("maca_templ:decay_tier", newDecayTier));
  }
}

function getNewDecayTier(block, dimension, currentTier) {
  // Check for nearby logs first
  if (hasNearbyLog(block, dimension, 1)) {
    return currentTier;
  }

  let num = Math.random();
  // Control decay speed with this, only if no logs are nearby
  if (num <= 0.2) { // 20% chance to decay 1 stage
    return Math.max(0, currentTier - 1);

  } else { // 80% chance to decay fully
    return 0;
  }
  
}

function hasNearbyLog(block, dimension, radius) {
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const checkLocation = {
          x: block.location.x + dx,
          y: block.location.y + dy,
          z: block.location.z + dz
        };
        const checkBlock = dimension.getBlock(checkLocation);
        if (checkBlock && checkBlock.hasTag("maca_templ:is_log")) {
          return true;
        }
      }
    }
  }
  return false;
}

export function leafDrop(block) {
  const leafType = block.type.id;
  const dropLocation = block.location;
  const saplingType = `${leafType.split(_)[1]}_sapling`
  const randomValue = Math.random();

  system.runTimeout(() => {
      block.setType("air")
      if (randomValue <= 0.05) {
      // 5% chance to drop a sapling
      if (saplingType) {
          block.dimension.spawnItem(new ItemStack(saplingType, 1), dropLocation);
      }
    } else if (randomValue >= 0.95) {
      // 5% chance to drop sticks 
        block.dimension.spawnItem(new ItemStack("minecraft:stick", Math.max(1, Math.floor(Math.random()*4))), dropLocation);
    }
  },1);
}

// this function looks if there is an air block to the sides before advancing growth of the fruit
function BlockCheck(block, dim, type, directionArray) {
  const directions = directionArray;
  for (const direction of directions) {
    let adjacentBlockPos;
    switch (direction) {
      case "North":
        adjacentBlockPos = {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z - 1,
        };
        break;
      case "South":
        adjacentBlockPos = {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z + 1,
        };
        break;
      case "East":
        adjacentBlockPos = {
          x: block.location.x + 1,
          y: block.location.y,
          z: block.location.z,
        };
        break;
      case "West":
        adjacentBlockPos = {
          x: block.location.x - 1,
          y: block.location.y,
          z: block.location.z,
        };
        break;
    }

    try {
      const adjacentBlock = dim.getBlock(adjacentBlockPos);
      if (adjacentBlock === undefined) return false;
      if (adjacentBlock.typeId === type) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
    }
  }
}