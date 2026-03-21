import { world, system, DimensionTypes, ItemStack, BlockPermutation, Player} from '@minecraft/server';
import { redstoneManager } from './redstone_manager';
//converts the dimensionID to a Y value
function dimensionToHeight(dimension) {
    const heights = [
        {
            id: DimensionTypes.overworld,
            maxHeight: 320,
        },
        {
            id: DimensionTypes.nether,
            maxHeight: 128
        },
        {
            id: DimensionTypes.theEnd,
            maxHeight: 256
        }
    ];
    const data = heights.find((f)=>f.id == dimension);
    if (data != undefined) {
        //return the Y value
        return data.maxHeight;
    } else return undefined;
}
const blockComps = [
    //define the block component
    {
        //the id of the block component
        id: "maca_templ:door",
        //the code of the block component
        code: {
            //on interact with door
            onPlayerInteract: (data)=>{
                //interact with the door
                doorManager.interactWithDoor(data.block);
            },
            //on place door
            onPlace: (data) => {
                const { block, dimension } = data;
                const loc = block.location;

                // If the placed block is already the top of the door, it does nothing.

                // If the world's maximum height is reached, do nothing
                if (loc.y + 1 >= dimensionToHeight(dimension.id)) return;

                // Take the block above
                let blockAbove;
                try {
                    blockAbove = dimension.getBlock({ x: loc.x, y: loc.y + 1, z: loc.z });
                } catch {}

                if (blockAbove && blockAbove.permutation.getState('maca_templ:upper_block') === true) {
                    return; // Avoid duplicating the top of the door
                }
                
                // If the block above is valid and is air or liquid, place the top of the door
                if (blockAbove && (blockAbove.isAir || blockAbove.isLiquid || blockAbove.typeId === "maca_templ:fence_inventory") && block.permutation.getState('maca_templ:upper_block') === false) {
                // Prevents duplication and places the door correctly
                doorManager.placeDoor(block, blockAbove);
                }
            },
            onRedstoneUpdate: (data) => {
                const { block, powerLevel } = data;
                // Verificação de estado da porta
                const isOpen = block.permutation.getState("maca_templ:open");
                const hasRedstone = powerLevel > 0;

                if (hasRedstone) {
                    block.setPermutation(block.permutation.withState("maca_templ:powered", true));
                    if (!isOpen) doorManager.interactWithDoor(block);
                }
            }
        }
    },
    {
        //the id of the block component
        id: "maca_templ:door_pwr",
        //the code of the block component
        code: {
            onTick: (data) => {
                const { block } = data;
                // Verificação de estado da porta
                const isOpen = block.permutation.getState("maca_templ:open");
                const isPowered = block.permutation.getState("maca_templ:powered");
                const hasRedstone = redstoneManager.powered(block) || block.getRedstonePower() > 0;

                if (!hasRedstone && isOpen && isPowered) {
                    block.setPermutation(block.permutation.withState("maca_templ:powered", !isPowered));
                    doorManager.interactWithDoor(data.block);
                }
            }
        }
    }
];

function spawnItemAnywhere(item, location, dimension) {
    //spawn the item at y100
    const itemEntity = dimension.spawnItem(item, {
        x: location.x,
        y: 100,
        z: location.z
    });
    //tp the item to the specified location
    itemEntity.teleport(location);
    //return the itemEntity
    return itemEntity;
}
class doorManager {
    //interact with a door block
    static interactWithDoor(block) {
        const dim = block.dimension;
        const loc = block.location;
        const topHalf = block.permutation.getState("maca_templ:upper_block");
        const open = block.permutation.getState("maca_templ:open");
        let doorPart = undefined;
        let adjacentDoor = undefined;
    
        // Get the top/bottom half of the door
        if (topHalf == false) {
            try {
                doorPart = block.above(1);
            } catch {}
        } else {
            try {
                doorPart = block.below(1);
            } catch {}
        }
    
        // Check for adjacent doors in all four directions
        const directions = ["North", "South", "East", "West"];
        for (const direction of directions) {
            let adjacentBlockPos;
            switch (direction) {
                case "North":
                    adjacentBlockPos = { x: block.location.x, y: block.location.y, z: block.location.z - 1 };
                    break;
                case "South":
                    adjacentBlockPos = { x: block.location.x, y: block.location.y, z: block.location.z + 1 };
                    break;
                case "East":
                    adjacentBlockPos = { x: block.location.x + 1, y: block.location.y, z: block.location.z };
                    break;
                case "West":
                    adjacentBlockPos = { x: block.location.x - 1, y: block.location.y, z: block.location.z };
                    break;
            }
    
            try {
                const adjacentBlock = dim.getBlock(adjacentBlockPos);
                if (adjacentBlock.typeId === block.typeId) {
                    adjacentDoor = adjacentBlock;
                    break; // Exit the loop once we find an adjacent door
                }
            } catch (error) {
            }
        }
    
        if (doorPart != undefined) {
            const data = this.doors.find((f) => f.id == block.typeId);
            let bool = !open;
    
            // Play sound
            if (bool) {
                if (data != undefined && data.openSound != undefined) {
                    dim.playSound(data.openSound.id, loc, {
                        pitch: data.openSound.pitch,
                        volume: data.openSound.volume
                    });
                }
            } else {
                if (data != undefined && data.closeSound != undefined) {
                    dim.playSound(data.closeSound.id, loc, {
                        pitch: data.closeSound.pitch,
                        volume: data.closeSound.volume
                    });
                }
            }
    
            const blocksToUpdate = [block, doorPart];
    
            // If there's an adjacent door, add it and its other half to the update list
            if (adjacentDoor != undefined) {
                blocksToUpdate.push(adjacentDoor);
                const adjacentDoorPart = adjacentDoor.permutation.getState("maca_templ:upper_block") ? 
                    adjacentDoor.below(1) : adjacentDoor.above(1);
                if (adjacentDoorPart != undefined) {
                    blocksToUpdate.push(adjacentDoorPart);
                }
            }
    
            // Update all relevant blocks
            for (const door of blocksToUpdate) {
                try {
                    door.setPermutation(door.permutation.withState("maca_templ:open", bool));
                } catch {}
            }
        }
    }
    static breakDoor(blockID, block, topHalf, player) {
        //does this stuff a tick later
        system.runTimeout(()=>{
            let doorPart = undefined;
            if (topHalf == false) {
                try {
                    doorPart = block.above(1);
                } catch  {}
            } else try {
                doorPart = block.below(1);
            } catch  {}
            //sets the doorPart to air
            if (doorPart != undefined && doorPart.hasTag(this.doorTag)) doorPart.setPermutation(BlockPermutation.resolve("minecraft:air"));
            //gets the door data
            const data = this.doors.find((f)=>f.id == blockID);
            if (data == undefined) return;
            const item = new ItemStack(data.itemID, 1);
            const loc = block.location;
            // Checks if the player is in creative mode before spawning the item
        if (!player || player.getGameMode() !== "Creative") {
            // If not in creative, spawns the item at the location of the broken door
            spawnItemAnywhere(item, {
                x: loc.x + 0.5,
                y: loc.y + 0.5,
                z: loc.z + 0.5
            }, block.dimension) //spawns the item
            ;
            }
            block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air destroy`);
            ;
        });
    }
    static placeDoor(block, aboveBlock) {
        system.runTimeout(() => {
            let reversed = false;
            const facing = block.permutation.getState("minecraft:cardinal_direction");
            let adjacentDoor = null;
            let adjacentDirection = null;
    
            const checkAndUpdateAdjacentDoor = (direction) => {
                let otherBlock;
                switch(direction) {
                    case "north": otherBlock = block.dimension.getBlock({ x: block.location.x, y: block.location.y, z: block.location.z - 1 }); break;
                    case "south": otherBlock = block.dimension.getBlock({ x: block.location.x, y: block.location.y, z: block.location.z + 1 }); break;
                    case "east": otherBlock = block.dimension.getBlock({ x: block.location.x + 1, y: block.location.y, z: block.location.z }); break;
                    case "west": otherBlock = block.dimension.getBlock({ x: block.location.x - 1, y: block.location.y, z: block.location.z }); break;
                }
    
                if (otherBlock.typeId.includes("door")) {
                    const otherfacing = otherBlock.permutation.getState("minecraft:cardinal_direction");
                    
                    adjacentDoor = otherBlock;
                    adjacentDirection = direction;
                    
                    // Determine if the door should be reversed based on facing and adjacent direction
                    reversed = shouldReverseDoor(facing, direction);
                    return true;
                }
                return false;
            };
    
            const shouldReverseDoor = (facing, adjacentDirection) => {
                switch(facing) {
                    case "north": return adjacentDirection !== "east";
                    case "south": return adjacentDirection !== "west";
                    case "east": return adjacentDirection !== "south";
                    case "west": return adjacentDirection !== "north";
                    default: return true;
                }
            };
    
            // Check all four directions
            ["north", "south", "east", "west"].forEach(direction => {
                try {
                    if (checkAndUpdateAdjacentDoor(direction)) {
                    }
                } catch (error) {
                }
            });

            const entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
            if (entity instanceof Player) {
                reversed = true
            }
    
            // Update the main door
            block.setPermutation(block.permutation.withState("maca_templ:reversed", reversed));
            aboveBlock.setPermutation(BlockPermutation.resolve(block.typeId));
            aboveBlock.setPermutation(aboveBlock.permutation.withState("maca_templ:upper_block", true));
            aboveBlock.setPermutation(aboveBlock.permutation
                .withState("minecraft:cardinal_direction", facing)
                .withState("maca_templ:reversed", reversed));
    
            // Update the adjacent door if found
            if (adjacentDoor) {
                const adjacentAboveBlock = block.dimension.getBlock({
                    x: adjacentDoor.location.x,
                    y: adjacentDoor.location.y + 1,
                    z: adjacentDoor.location.z
                });
                
                // The adjacent door should have the opposite 'reversed' state
                const adjacentReversed = !reversed;
                
                adjacentDoor.setPermutation(adjacentDoor.permutation
                    .withState("maca_templ:reversed", adjacentReversed));
                
                if (adjacentAboveBlock) {
                    adjacentAboveBlock.setPermutation(adjacentAboveBlock.permutation
                        .withState("maca_templ:reversed", adjacentReversed));
                }
            } 
        });
    }
}
//set the door tag
doorManager.doorTag = "maca_templ:is_door";
doorManager.doors = [
    //door data
    {
        //the typeId of the block
        id: "maca_templ:osage_door",
        //the typeId of the item
        itemID: "maca_templ:osage_door",
        //the opening sound data
        openSound: {
            id: "open.wooden_door",
            volume: 1,
            pitch: 1
        },
        //the closing sound data
        closeSound: {
            id: "close.wooden_door",
            volume: 1,
            pitch: 1
        }
    },
    {
        //the typeId of the block
        id: "maca_templ:palm_door",
        //the typeId of the item
        itemID: "maca_templ:palm_door",
        //the opening sound data
        openSound: {
            id: "open.wooden_door",
            volume: 1,
            pitch: 1
        },
        //the closing sound data
        closeSound: {
            id: "close.wooden_door",
            volume: 1,
            pitch: 1
        }
    },
    {
        //the typeId of the block
        id: "maca_templ:redwood_door",
        //the typeId of the item
        itemID: "maca_templ:redwood_door",
        //the opening sound data
        openSound: {
            id: "open.wooden_door",
            volume: 1,
            pitch: 1
        },
        //the closing sound data
        closeSound: {
            id: "close.wooden_door",
            volume: 1,
            pitch: 1
        }
    },
    {
        //the typeId of the block
        id: "maca_templ:jacaranda_door",
        //the typeId of the item
        itemID: "maca_templ:jacaranda_door",
        //the opening sound data
        openSound: {
            id: "open.wooden_door",
            volume: 1,
            pitch: 1
        },
        //the closing sound data
        closeSound: {
            id: "close.wooden_door",
            volume: 1,
            pitch: 1
        }
    },
    {
        //the typeId of the block
        id: "maca_templ:dried_banana_door",
        //the typeId of the item
        itemID: "maca_templ:dried_banana_door",
        //the opening sound data
        openSound: {
            id: "open.wooden_door",
            volume: 1,
            pitch: 1
        },
        //the closing sound data
        closeSound: {
            id: "close.wooden_door",
            volume: 1,
            pitch: 1
        }
    },
    {
        //the typeId of the block
        id: "maca_templ:fresh_banana_door",
        //the typeId of the item
        itemID: "maca_templ:fresh_banana_door",
        //the opening sound data
        openSound: {
            id: "open.wooden_door",
            volume: 1,
            pitch: 1
        },
        //the closing sound data
        closeSound: {
            id: "close.wooden_door",
            volume: 1,
            pitch: 1
        }
    }
];

world.beforeEvents.playerBreakBlock.subscribe((data)=>{
    if (data.block.hasTag(doorManager.doorTag)) {
        //if the block has the door tag, breakDoor
        data.cancel = true;
        doorManager.breakDoor(data.block.typeId, data.block, data.block.permutation.getState("maca_templ:upper_block"), data.player);
    } else try {
        const blockAbove = data.block.above(1);
        //if the above block has the door tag, breakDoor
        if (blockAbove.hasTag(doorManager.doorTag)) doorManager.breakDoor(blockAbove.typeId, blockAbove, blockAbove.permutation.getState("maca_templ:upper_block"));
    } catch  {}
});
let int = 0;
system.beforeEvents.startup.subscribe((data)=>{
    //needed to stop crashes when leaving the world
    int = int + 1;
    if (int != 1) return;
    for (const comp of blockComps){
        //registers all custom block components
        data.blockComponentRegistry.registerCustomComponent(comp.id, comp.code);
    }
});
