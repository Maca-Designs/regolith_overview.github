import { DisplaySlotId, EntityCanPowerJumpComponent, EntityEquippableComponent, EntityInventoryComponent, EntityProjectileComponent, EquipmentSlot, GameMode, ItemDurabilityComponent, ItemEnchantableComponent, system, world } from "@minecraft/server";
import { CustomTridents, waitTicks } from "./data";
import { TridentManager } from "./manager";
let Rain = undefined;

world.afterEvents.weatherChange.subscribe((e) => {
    const {dimension, newWeather, previousWeather} = e;
    if (previousWeather === "Rain") {
        Rain = undefined
    } else if (newWeather === "Thunder" || newWeather === "Rain") {
        Rain = true
    } else if (newWeather === "Clear") {
        Rain = undefined
    }
});
world.afterEvents.itemReleaseUse.subscribe((data) => {
    const { source, useDuration } = data;
    if (!data.itemStack)
        return;
    const mainhand = source.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!mainhand)
        return;
    const item = mainhand.getItem();
    if (item?.typeId != data.itemStack.typeId)
        return;
    const tridentData = CustomTridents[0];
    if (!tridentData)
        return;
    if (-useDuration + 19999980 < 13)
        return;
    const enchComp = item.getComponent(ItemEnchantableComponent.componentId);
    if (tridentData.riptide && enchComp?.hasEnchantment("riptide")) {
        const level = enchComp.getEnchantment("riptide")?.level;
        if (level === undefined)
            return;
        const riptide = tridentData.riptide;
        if (TridentManager.isInEnvironment(riptide.environment, source)) {
            const viewDir = source.getViewDirection();
            const knockbackVal = (((Math.abs(viewDir.x) + Math.abs(viewDir.z)) * 1.5) * (riptide.velocity + ((riptide.velocity / 6) * level)))
            source.applyKnockback({x: viewDir.x* knockbackVal, z: viewDir.z* knockbackVal}, viewDir.y * (riptide.velocity + ((riptide.velocity / 6) * level)));
              
            if (riptide.sound) {
                source.dimension.playSound(riptide.sound.ids[level - 1], source.location);
            }
            if (riptide.onRiptide)
                riptide.onRiptide(source, level);
            return;
        }
    }
    const durComp = item.getComponent(ItemDurabilityComponent.componentId);
    if (!tridentData.projectile || durComp?.damage == durComp?.maxDurability)
        return;
    const projectileData = tridentData.projectile;
    const headLoc = source.getHeadLocation();
    const projectile = source.dimension.spawnEntity(item?.typeId.replace("throwing", "thrown"), { x: headLoc.x, y: 200, z: headLoc.z });
    projectile.teleport(headLoc);
    const rot = source.getRotation();
    projectile.setProperty("maca_templ:trident_pitch", rot.x);
    if (rot.x < 10) {
        system.runTimeout(() => {
            function gradualPitchAdjust() {
                const raycastResult = source.dimension.getBlockFromRay(projectile.location, { x: 0, y: -1, z: 0 }, { maxDistance: 100 });
                try {
                    const distanceToGround = projectile.location.y - raycastResult.block.location.y;
                    let currentPitch = projectile.getProperty("maca_templ:trident_pitch") ?? rot.x;
                    const boost = rot.x < -40 ? 3 : 1;
                    const velocityY = projectile.getVelocity().y * boost;
                    
        
                    // Only start adjusting if falling
                    if (velocityY < 0) {
                        // The faster it's falling, the faster the pitch increases
                        const pitchIncrement = Math.min(Math.abs(velocityY) * 15, rot.x < -40 ? 15 : 10); // Up to 10 degrees per check
                        currentPitch = Math.min(currentPitch + pitchIncrement, 90);
                        projectile.setProperty("maca_templ:trident_pitch", currentPitch);
                    }
        
                    // Stop if close to ground or already at 90°
                    if (distanceToGround < 5 || currentPitch >= 90) {
                        projectile.setProperty("maca_templ:trident_pitch", Math.min(currentPitch, 90));
                        return;
                    }
        
                    // Continue checking every 2 ticks
                    system.runTimeout(gradualPitchAdjust, 2);
                } catch {
                    // try again after its had a chance to fall back down a bit
                    system.runTimeout(gradualPitchAdjust, 5);
                }
            }
            gradualPitchAdjust();
        }, 10);
    }    
    projectile.setDynamicProperty("item", JSON.stringify(TridentManager.getTridentItem(item)));
    if (source.getGameMode() != "Creative")
        mainhand.setItem();
    projectile.setDynamicProperty("ownerID", source.id);
    const projectileComp = projectile.getComponent(EntityProjectileComponent.componentId);
    if (enchComp?.getEnchantments()[0])
        projectile.setProperty('maca_templ:enchanted', true);
    if (!projectileComp)
        return;
    projectileComp.owner = source;
    const viewDir = source.getViewDirection();
    projectileComp.shoot({ x: viewDir.x * projectileData.thrownVelocity, y: viewDir.y * projectileData.thrownVelocity, z: viewDir.z * projectileData.thrownVelocity });
    
    projectile.setRotation({x: rot.x, y: rot.y})
    
    const sound = projectileData.thrownSound;
    if (!sound)
        return;
    source.dimension.playSound(sound.id, source.location, { volume: sound.volume, pitch: sound.pitch });
});
world.afterEvents.projectileHitBlock.subscribe((data) => {
    const { projectile } = data;
    const block = data.getBlockHit().block
    system.runTimeout(() => {
        if (!projectile || !projectile.isValid)
            return;
        let itemData = projectile.getDynamicProperty("item");
        if (!itemData)
            return;
        itemData = JSON.parse(itemData);
        if (!itemData.enchantments)
            return;
        const channeling = itemData.enchantments.find((f) => f.id == "enchant.channeling");
        if(channeling && block.typeId.includes("lightning_rod") && Rain) {
            const loc = block.location
            projectile.runCommand(`summon lightning_bolt ${loc.x} ${loc.y} ${loc.z}`)
        }
        const loyalty = itemData.enchantments.find((f) => f.id == "enchant.loyalty");
        if (!loyalty)
            return;
        projectile.triggerEvent("maca_templ:returning");
    }, waitTicks);
});
world.afterEvents.projectileHitEntity.subscribe((data) => {
    const { projectile } = data;
    system.runTimeout(() => {
        if (!projectile || !projectile.isValid)
            return;
        let itemData = projectile.getDynamicProperty("item");
        if (!itemData)
            return;
        itemData = JSON.parse(itemData);
        if (itemData.durabilityDamage === undefined)
            return;
        if (!TridentManager.reduceDurability(itemData))
            return;
        itemData.durabilityDamage += 1;
        projectile.setDynamicProperty("item", JSON.stringify(itemData));
        if (!itemData.enchantments)
            return;
        const channeling = itemData.enchantments.find((f) => f.id == "enchant.channeling");
        if(channeling && Rain) {
            const loc = projectile.location
            projectile.runCommand(`summon lightning_bolt ${loc.x} ${loc.y} ${loc.z}`)
        }
        const loyalty = itemData.enchantments.find((f) => f.id == "enchant.loyalty");
        if (!loyalty)
            return;
        projectile.triggerEvent("maca_templ:returning");
    }, waitTicks);
});
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (!player || !player.isValid)
            continue;
        const { x, y, z } = player.location;
        const tridents = player.dimension.getEntities({ location: { x: x, y: y + 1, z: z }, maxDistance: 2, excludeTypes: ["minecraft:player", "minecraft:item", "minecraft:zombie", "minecraft:skeleton", "minecraft:chicken"] });
        const inv = player.getComponent(EntityInventoryComponent.componentId);
        if (!inv.container || inv.container.emptySlotsCount == 0)
            continue;
        const container = inv.container;
        for (let i = 0; i < tridents.length; i++) {
            if (!tridents[i] || !tridents[i].isValid)
                continue;
            if (container.emptySlotsCount <= 0)
                continue;
            const found = tridents[i].typeId.includes("maca_ve:") && tridents[i].typeId.includes("thrown_spear");
            if (!found)
                continue;
            const tridentEntity = tridents[i];
            if (!TridentManager.canPickUp(tridentEntity))
                continue;
            const ownerID = tridentEntity.getDynamicProperty("ownerID");
            if (!ownerID)
                continue;
            if (ownerID != player.id)
                continue;
            const itemData = tridentEntity.getDynamicProperty("item");
            if (!itemData)
                continue;
            const gameMode = player.getGameMode();
            if (gameMode != "Creative" && gameMode != "Spectator") {
                const item = TridentManager.getItem(JSON.parse(itemData));
                container.addItem(item);
            }
            player.dimension.playSound("random.pop", tridentEntity.location, { pitch: 1 + Math.random(), volume: 0.5 });
            tridentEntity.remove();
        }
    }
}, 15);
system.afterEvents.scriptEventReceive.subscribe((data) => {
    if (data.id != "maca_templ:spear_return" && data.id != "maca_templ:spear_tick")
        return;
    const tridentEntity = data.sourceEntity;
    if (!tridentEntity || !tridentEntity.isValid)
        return;
    const tridentData = CustomTridents[0];
    if (!tridentData)
        return;
    if (data.id == "maca_templ:spear_return") {
        let itemData = tridentEntity.getDynamicProperty("item");
        if (!itemData)
            return;
        itemData = JSON.parse(itemData);
        if (!itemData.enchantments)
            return;
        const loyalty = itemData.enchantments.find((f) => f.id == "enchant.loyalty");
        if (!loyalty)
            return;
        const ownerID = tridentEntity.getDynamicProperty("ownerID");
        if (!ownerID)
            return;
        const owner = TridentManager.getOwner(ownerID);
        if (!owner)
            return;
        if (!tridentEntity || !tridentEntity.isValid || !owner || !owner.isValid)
            return;
        const loc = tridentEntity.location;
        let velocity = tridentData.projectile?.returnSpeed;
        if (velocity === undefined)
            velocity = 1;
        if (!loyalty)
            return;
        velocity *= 1 + (loyalty.lvl * 0.25);
        const ownerLoc = owner.location;
        tridentEntity.teleport(loc, { facingLocation: { x: ownerLoc.x, y: ownerLoc.y + 1, z: ownerLoc.z } });
        const viewDir = tridentEntity.getViewDirection();
        tridentEntity.teleport({ x: loc.x + viewDir.x + (viewDir.x * velocity), y: loc.y + viewDir.y + (viewDir.y * velocity), z: loc.z + (viewDir.z * velocity) });
        {
            if (tridentEntity.getDynamicProperty("returning"))
                return;
            tridentEntity.setDynamicProperty("returning", true);
            if (tridentData.projectile?.onReturn)
                tridentData.projectile.onReturn(tridentEntity, tridentEntity.dimension, owner, loyalty.lvl);
            if (tridentData.projectile?.returnSound) {
                const sound = tridentData.projectile.returnSound;
                if (owner.typeId == "minecraft:player")
                    owner.playSound(sound.id, { volume: sound.volume, pitch: sound.pitch });
            }
        }
    }
    else if (tridentEntity.location.y < -64) {
        tridentEntity.runCommand("scriptevent maca_templ:spear_return");
    }
    return;
});
