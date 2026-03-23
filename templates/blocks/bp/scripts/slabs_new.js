import { world, system, ItemStack } from "@minecraft/server";
import {getRelevantEnchantments, applyDurabilityDamage} from "./block_utils"

const slabTag = "maca_templ:is_slab"

let lastBrokenBlockType = null;
let lastBrokenBlockIsDouble = false;
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const { block, dimension, player } = event;
      if (block.hasTag(slabTag) && block.hasTag("maca_templ:is_double_slab")) {
        
        const { hasSilkTouch } = getRelevantEnchantments(selectedItem);
        if (!hasSilkTouch) return;
        lastBrokenBlockType = block.typeId.replace("_double", "");
        lastBrokenBlockIsDouble = true
        eventData.cancel = true
        system.runTimeout(() => {
            applyDurabilityDamage(
                player,
                selectedItem,
                inventory,
                player.selectedSlotIndex
            );
            slabDrop(block, dimension, player);
            
        }, 1);
    } 
});

function slabDrop(block, dimension, player) {
    if (player.getGameMode() === "Creative") return;
  
    if (lastBrokenBlockType) {
        block.setType("air")
        let dropItem;
  
        if (lastBrokenBlockIsDouble) {
            dropItem = new ItemStack(lastBrokenBlockType, 2);
        } 
        if (dropItem) {
            dimension.spawnItem(dropItem, block.location);
        }
        lastBrokenBlockType = null;
        lastBrokenBlockIsDouble = false;
    } 
  }

const ABslabs = {
  Up: (block) => block.above(),
  Down: (block) => block.below(),
  target: { Up: (block) => block.below(), Down: (block) => block.above() },
};
const conditions = {
  Up: (VerticalHalf) => VerticalHalf == "bottom",
  Down: (VerticalHalf) => VerticalHalf == "top",
};
const DWorUP = new Set(["Up", "Down"]);
const TRANSFORMSLAB = (block, player, item) =>
  system.run(() => {
    //block?.setPermutation(block?.permutation.withState("maca_templ:double", true));
    block.setType(`${block.typeId}_double`);
    const sound = block?.hasTag("maca_templ:glass_slab") ? "random.glass" : block?.hasTag("maca_templ:wool_slab") ? "use.cloth" : "use.stone";
    block.dimension.playSound(sound, block.location, {
      volume: 0.7,
      pitch: 0.8,
    });

    if (player.getGameMode() === "Creative") return;
    if (item.amount <= 1) item = undefined;
    else item.amount -= 1;
    player
      .getComponent("minecraft:inventory")
      .container?.setItem(player.selectedSlotIndex, item);
  });
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
  const { block, blockFace: face, player, itemStack: item, isFirstEvent } = e;
  if (!isFirstEvent) return;
  if (!item || !item?.hasTag(slabTag)) return;
  if (
    block.hasTag(slabTag) &&
    item.typeId == block.typeId &&
    DWorUP.has(face)
  ) {
    if (
        block.dimension.getEntities({ location: block.center(), maxDistance: 0.5 })
        .length > 0
    )
        return;
    const verticalHalf = block?.permutation.getState("minecraft:vertical_half");
    if (conditions[face]?.(verticalHalf)) {
      e.cancel = true;
      TRANSFORMSLAB(block, player, item);
      return;
    }
  }
  const slab = block[face.toLowerCase()]?.() ?? ABslabs[face]?.(block);
  if (
    block.dimension.getEntities({ location: slab.center(), maxDistance: 0.5 })
      .length > 0
  )
    return;
  if (!slab?.hasTag(slabTag) || item.typeId !== slab?.typeId) return;
  TRANSFORMSLAB(slab, player, item);
});