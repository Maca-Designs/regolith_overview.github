import { system, world, ItemStack } from "@minecraft/server";

const rejectBlocks = new Set([
    "minecraft:repeater",
    "minecraft:powered_comparator",
    "minecraft:unpowered_redstone_repeater",
    "minecraft:comparator",
    "minecraft:redstone_wire",
    "minecraft:redstone_torch",
    "minecraft:soul_torch",
    "minecraft:torch",
    "minecraft:copper_torch",
    "minecraft:lantern",
    "minecraft:soul_lantern",
    "minecraft:rail",
    "minecraft:activator_rail",
    "minecraft:golden_rail",
    "minecraft:detector_rail",
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
    "minecraft:copper_lantern",
    "minecraft:exposed_copper_lantern",
    "minecraft:weathered_copper_lantern",
    "minecraft:oxidized_copper_lantern",
    "minecraft:waxed_copper_lantern",
    "minecraft:waxed_exposed_copper_lantern",
    "minecraft:waxed_weathered_copper_lantern",
    "minecraft:waxed_oxidized_copper_lantern"
])

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("maca_templ:button", buttonComponent);
    blockComponentRegistry.registerCustomComponent("maca_templ:pressure_plate", pressure_plateComponent);
    blockComponentRegistry.registerCustomComponent("maca_templ:powered", poweredComponent);
});

const buttonComponent = {
    onPlayerInteract(e) {
        const {block} = e;
        block.dimension.playSound("click_on.cherry_wood_button", block.location)
        block.setPermutation(block.permutation.withState("maca_templ:pressed", 1))
    }
}

const pressure_plateComponent = {
    onStepOn(e) {
        const {block} = e;
        block.dimension.playSound("click_on.wooden_pressure_plate", block.location)
        block.setPermutation(block.permutation.withState("maca_templ:pressed", 1))
        if(block.below().typeId.includes("trapdoor")) {
            system.runTimeout(() => {
                block.dimension.spawnItem(new ItemStack(block.typeId, 1), block.center())
                block.dimension.playSound("use.wood", block.location)
                block.setType("air");
            },4)
        }
    },
    onStepOff(e) {
        const {block} = e;
        block.dimension.playSound("click_off.wooden_pressure_plate", block.location)
        block.dimension.playSound("wood.button.activate", block.location)
        block.setPermutation(block.permutation.withState("maca_templ:pressed", 0))
    }
}

const poweredComponent = {
    onTick(e) {
        const {block} = e;
        block.dimension.playSound("click_off.cherry_wood_button", block.location)
        block.dimension.playSound("wood.button.activate", block.location)
        block.setPermutation(block.permutation.withState("maca_templ:pressed", 0))
    }
}

world.afterEvents.playerBreakBlock.subscribe((e) => {
    const {block, dimension} = e;
    let north = undefined;
        try {
            north = block.north(1);
        } catch { }
        let south = undefined;
        try {
            south = block.south(1);
        } catch { }
        let east = undefined;
        try {
            east = block.east(1);
        } catch { }
        let west = undefined;
        try {
            west = block.west(1);
        } catch { }
        let above = undefined
        try {
            above = block.above(1);
        } catch { }
        let below = undefined
        try {
            below = block.below(1);
        } catch { }
        const blocks = [
            { block: north, side: "north" },
            { block: south, side: "south" },
            { block: east, side: "east" },
            { block: west, side: "west" },
            { block: above, side: "up" },
            { block: below, side: "down" }
        ];
        for (const checkBlock of blocks) {
            const name = checkBlock.block.typeId
            if (!checkBlock.block.hasTag("maca_templ:is_button") && !checkBlock.block.hasTag("maca_templ:is_pressure_plate")) continue;
            const dir = checkBlock.block.hasTag("maca_templ:is_button") ? checkBlock.block.permutation.getState("minecraft:block_face").toLowerCase() : "up";
            if (dir === checkBlock.side) {
                dimension.spawnItem(new ItemStack(name, 1), checkBlock.block.center())
                checkBlock.block.dimension.playSound("use.wood", checkBlock.block.location)
                checkBlock.block.setType("air")
            }
        }
});

world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
    const {itemStack, block, player, isFirstEvent} = e;
    if (!isFirstEvent) return;
    if (!itemStack || itemStack == undefined) return;
    if (block.typeId.includes("trapdoor")) {
        if(block.above().hasTag("maca_templ:is_button") || block.above().hasTag("maca_templ:is_pressure_plate")) {
            system.run(() => {
                block.dimension.spawnItem(new ItemStack(block.above().typeId, 1), block.above().center())
                block.dimension.playSound("use.wood", block.above().location)
                block.above().setType("air");
            })
        }
    }
    if (block.hasTag("maca_templ:is_button")) {
        if(block.below().typeId.includes("trapdoor")) {
            system.runTimeout(() => {
                block.dimension.spawnItem(new ItemStack(block.typeId, 1), block.center())
                block.dimension.playSound("use.wood", block.location)
                block.setType("air");
            },4)
        }
    }
    if ((block.typeId.includes("pressure_plate") || rejectBlocks.has(block.typeId)) && (itemStack.hasTag("maca_templ:is_button") || itemStack.hasTag("maca_templ:is_pressure_plate"))) {
        e.cancel = true;
        return;
    }
    if (!player.isSneaking) return;
    if ((block.hasTag("maca_templ:is_button") || block.hasTag("maca_templ:is_pressure_plate")) && (itemStack.typeId.includes("button") || itemStack.typeId.includes("pressure_plate") || rejectBlocks.has(itemStack.typeId))) {
        e.cancel = true;
        return;
    }
});