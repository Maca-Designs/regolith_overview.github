import { world } from "@minecraft/server";
import {applyDurabilityDamage} from "./block_utils"

const miningComponent = {
  onMineBlock(event) {
    const { source: player, itemStack } = event;
    if (player.getGameMode() === "Creative") return;
    const inventory = player.getComponent("inventory");
    const selectedItem = inventory.container.getItem(player.selectedSlotIndex);
    if (itemStack.hasTag("maca_ve:is_tool")) {
        applyDurabilityDamage(
            player,
            selectedItem,
            inventory,
            player.selectedSlotIndex
        );
        return;
    };
  },
};

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    const item = event.itemStack;
    const block = event.block;
    if (!item || item == undefined) return;
    if ((item.hasTag("maca_ve:is_tool") && item.hasTag("minecraft:is_axe")) && ( block.typeId.includes("log") || block.typeId.includes("wood")) && !block.typeId.includes("stripped")) {
        const inventory = player.getComponent("inventory")
        system.run(() => {
            applyDurabilityDamage(player, item, inventory, player.selectedSlotIndex);
        });
    }
});