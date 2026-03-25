import {system} from "@minecraft/server";

function applyDurabilityDamage(player, item, inventory, slotIndex) {
    if (player.getGameMode() === "Creative") return true;

    return new Promise((resolve) => {
        system.runTimeout(() => {
            const durabilityComponent = item.getComponent("minecraft:durability");
            if (durabilityComponent) {
                const { unbreakingLevel } = getRelevantEnchantments(item);
                
                if (Math.random() < 1 / (unbreakingLevel + 1)) {
                    const newDamage = durabilityComponent.damage + 1;
                    
                    if (newDamage >= durabilityComponent.maxDurability) {
                        inventory.container.setItem(slotIndex, undefined);
                        player.playSound("random.break");
                        resolve(false); // Tool has broken or about to break
                    } else {
                        durabilityComponent.damage = newDamage;
                        inventory.container.setItem(slotIndex, item);
                        resolve(true); // Tool is still usable
                    }
                } else {
                    resolve(true); // No damage applied, tool is still usable
                }
            } else {
                resolve(true); // No durability component, assume tool is still usable
            }
        }, 1);
    });
}
  
function getRelevantEnchantments(item) {
    let unbreakingLevel = 0;
    let hasSilkTouch = false;
    let fortuneLevel = 0;
  
    try {
        const enchantableComponent = item.getComponent("minecraft:enchantable");
        if (enchantableComponent) {
            const enchantments = enchantableComponent.getEnchantments();
            for (const enchant of enchantments) {
                if (enchant.type.id === "unbreaking") {
                    unbreakingLevel = enchant.level;
                } else if (enchant.type.id === "silk_touch") {
                    hasSilkTouch = true;
                } else if (enchant.type.id === "fortune") {
                    fortuneLevel = enchant.level;
                }
            }
        }
    } catch (error) {
    }
    return { unbreakingLevel, hasSilkTouch, fortuneLevel };
}

export {
    applyDurabilityDamage,
    getRelevantEnchantments
}