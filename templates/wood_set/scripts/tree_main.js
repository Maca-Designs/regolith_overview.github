import { world, system } from '@minecraft/server';
import { randomTickComponent, leafDrop, decayOnTickComponent } from "./RandomTick"
import { treeInteractComponent } from './tree';
import { GateInteract, gatePower } from './fence';
import './door'
import './trapdoor'

const customComponents = {
  "maca_templ:random_tick": randomTickComponent,
  "maca_templ:interact_tree": treeInteractComponent,
  "maca_templ:gate_interact": GateInteract,
  "maca_templ:gate_pwr": gatePower,
  "maca_templ:decay_on_tick": decayOnTickComponent
};


// Use this world initialization event to register all custom components
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  for (const [componentName, componentImplementation] of Object.entries(customComponents)) {
    blockComponentRegistry.registerCustomComponent(componentName, componentImplementation);
  }
});

world.beforeEvents.playerBreakBlock.subscribe((eventData) => {
  const { block, player, dimension } = eventData;
  const inventory = player.getComponent("inventory");
  const selectedItem = inventory.container.getItem(player.selectedSlotIndex);
  const { hasSilkTouch } = getRelevantEnchantments(selectedItem);
  if (block.hasTag("maca_templ:is_log")) {
    const placed = block.permutation.getState("maca_templ:placed");
    if (placed) return;
    if (block.above().typeId === block.typeId && block.above().hasTag("maca_templ:is_log")) return;
    system.runTimeout(() => {
      setDecayState(block.location, dimension);
    },1)
  }

  if(block.hasTag("maca_templ:is_leaf") && !hasSilkTouch && selectedItem?.typeId !==  "minecraft:shears"){
    leafDrop(block);
  }
});

function checkAround(loc,dim) {
  const Block = dim.getBlock(loc)
  let above = undefined;
  try {
      above = Block.above(1);
  } catch { }
  let below = undefined;
  try {
      below = Block.below(1);
  } catch { }
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
  const blocks = [Block, above, below, north, south, east, west];
  if (!above.hasTag("maca_templ:is_log") && !below.hasTag("maca_templ:is_log")) return true;
  for (const block of blocks) {
      if (block != undefined) {
          if (block.hasTag("maca_templ:is_leaf")) {
            if (block.permutation.getState("maca_templ:placed")) return false;
            return true;
          }
      }
  }
}

export function setDecayState(loc, dim) {
  const leafAround = checkAround(loc, dim);
  if (!leafAround) return;
  
  const currentY = loc.y;
  let radius = 6;  
  let Yradius = 15; 
  let Yadjust = 8;
  
  if (currentY - 25 < -64) {
    Yradius = (currentY - 25 + 64) + Yradius;
  } else if (currentY + 10 > 340) {
    Yadjust = 10 - ((currentY + 10) - 340);
  }
  
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -Yradius; dy <= (Yradius + Yadjust); dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const checkLocation = {
          x: loc.x + dx,
          y: loc.y + dy,
          z: loc.z + dz
        };
        
        const checkBlock = dim.getBlock(checkLocation);
        if (!checkBlock || checkBlock.isAir) {
          continue;
        }
        if (!checkBlock.hasTag("maca_templ:is_leaf")) {
          continue;
        }
        if (checkBlock.permutation.getState("maca_templ:placed") == 1) {
          continue;
        }
        const distanceSq = dx*dx + dy*dy*0.3 + dz*dz; // Y weighted less
        if (distanceSq > 25) {  // Roughly ~5 block radius sphere
          continue;
        }
        
        // Set decay
        checkBlock.setPermutation(
          checkBlock.permutation.withState("maca_templ:should_decay", true)
        );
      }
    }
  }
}

function applyDurabilityDamage(player, item, inventory, slotIndex) {
  const durabilityComponent = item.getComponent("minecraft:durability");
  if (durabilityComponent) {
    const { unbreakingLevel } = getRelevantEnchantments(item);
    
    if (Math.random() < 1 / (unbreakingLevel + 1)) {
      const newDamage = durabilityComponent.damage + 1;
      if (newDamage >= durabilityComponent.maxDurability) {
        inventory.container.setItem(slotIndex, undefined);
        player.playSound("random.break");
      } else {
        durabilityComponent.damage = newDamage;
        inventory.container.setItem(slotIndex, item);
      }
    }
  }
}

function getRelevantEnchantments(item) {
  let unbreakingLevel = 0;
  let hasSilkTouch = false;

  try {
      const enchantableComponent = item.getComponent("minecraft:enchantable");
      if (enchantableComponent) {
          const enchantments = enchantableComponent.getEnchantments();
          for (const enchant of enchantments) {
              if (enchant.type.id === "unbreaking") {
                  unbreakingLevel = enchant.level;
              } else if (enchant.type.id === "silk_touch") {
                  hasSilkTouch = true;
              }
          }
      }
  } catch (error) {
  }
  return { unbreakingLevel, hasSilkTouch };
}



export {
  applyDurabilityDamage,
  getRelevantEnchantments
}