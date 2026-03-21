export class redstoneManager {
    static powered(block) {
        const pos = block.location;
        const dim = block.dimension;
        let powered = false;
        const directions = [
            { x: 1, y: 0, z: 0 },
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: 1 },
            { x: 0, y: 0, z: -1 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: -1, z: 0 }
          ];
            for (const direction of directions){
                const neighborPos = {
                    x: pos.x + direction.x,
                    y: pos.y + direction.y,
                    z: pos.z + direction.z
                };
                try {
                    const neighborBlock = dim.getBlock(neighborPos);
                    if (!neighborBlock) continue;
                    const currentPower = neighborBlock.getRedstonePower();
        
                    const blockType = neighborBlock.typeId;
                    // Skip certain cases for above and below
                    if ((blockType === "minecraft:redstone_wire" || blockType === "minecraft:powered_repeater" || blockType === "minecraft:powered_comparator") && direction.y === -1) continue;
                    if ((blockType === "minecraft:powered_repeater" || blockType === "minecraft:powered_comparator") && direction.y === 1) continue;

                    // Special component checks, skips directional redstone components
                    let isValid = true;
                    switch(blockType) {
                        case "minecraft:powered_repeater":
                        case "minecraft:powered_comparator": {
                            const facing = getCardinalDirection(neighborBlock);
                            isValid = directionsMatch(direction, reverseDirection(facing));
                            break;
                        }
                        case "minecraft:observer": {
                            const facing = getFacingDirection(neighborBlock);
                            isValid = directionsMatch(direction, reverseDirection(facing));
                            break;
                        }
                    }

                    if (isValid && currentPower > 0) {
                        powered = true
                        return powered;
                    }
                } catch{}
            }
    }
}

// Helper functions for the redstone event listener
function getCardinalDirection(block) {
    const states = block.permutation.getAllStates();
    return states["minecraft:cardinal_direction"] || "north";
}

// Helper functions for the redstone event listener
function getFacingDirection(block) {
    const states = block.permutation.getAllStates();
    return states["minecraft:facing_direction"] || "north";
}

function directionsMatch(dir1, dir2) {
    if (typeof dir2 === "string") {
        const dirMap = {
            "east": { x: -1, y: 0, z: 0 },
            "west": { x: 1, y: 0, z: 0 },
            "south": { x: 0, y: 0, z: -1 },
            "north": { x: 0, y: 0, z: 1 },
            "up": { x: 0, y: 1, z: 0 },
            "down": { x: 0, y: -1, z: 0 }
        };
        dir2 = dirMap[dir2.toLowerCase()] || dirMap.north;
    }
    return dir1.x === dir2.x && dir1.y === dir2.y && dir1.z === dir2.z;
}

function reverseDirection(dir) {
    if (typeof dir === "string") {
        const reverseMap = {
            "east": "west",
            "west": "east",
            "north": "south",
            "south": "north",
            "up": "down",
            "down": "up"
        };
        return reverseMap[dir] || dir;
    }
    return { x: -dir.x, y: -dir.y, z: -dir.z };
}