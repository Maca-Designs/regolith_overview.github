import { Block, world, system } from "@minecraft/server";

const stairTag = "maca_templ:is_stair";

world.afterEvents.playerPlaceBlock.subscribe((data) => {
    const block = data.block
    stair_Manager.updateStairsAround(block);
});

world.afterEvents.blockExplode.subscribe((event) => {
    const { explodedBlockPermutation: perm, dimension, block } = event;
    const north = block.north();
    const east = block.east();
    const south = block.south();
    const west = block.west();
    if (!north.hasTag(stairTag) && !east.hasTag(stairTag) && !south.hasTag(stairTag) && !west.hasTag(stairTag) && !perm.hasTag(stairTag)) return;
    system.runTimeout(() => {
        stair_Manager.updateStairsAround(block)
    }, 1);
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { block, dimension, player } = event;
    const north = block.north();
    const east = block.east();
    const south = block.south();
    const west = block.west();
    if (!north.hasTag(stairTag) && !east.hasTag(stairTag) && !south.hasTag(stairTag) && !west.hasTag(stairTag) && !perm.hasTag(stairTag)) return;
    system.runTimeout(() => {
        stair_Manager.updateStairsAround(block)
    }, 1);
});

export class stair_Manager {
  static update_Stair_States(stair, Break) {
    if (Break) {
        stair.setPermutation(stair.permutation
            .withState(`maca_templ:connect`, 'no')
        )
    }
    const StartState = stair.permutation.getState(`maca_templ:connect`);
    if (StartState != "no")return;
    const direction = stair.permutation.getState(
      "minecraft:cardinal_direction"
    );
    let north = undefined;
    try {
      north = stair.north(1);
    } catch {}
    let south = undefined;
    try {
      south = stair.south(1);
    } catch {}
    let east = undefined;
    try {
      east = stair.east(1);
    } catch {}
    let west = undefined;
    try {
      west = stair.west(1);
    } catch {}
    const blocks = [
      { block: north, side: "n" },
      { block: south, side: "s" },
      { block: east, side: "e" },
      { block: west, side: "w" },
    ];
    let connectedSides = 0
    let connectionStates = [];
        for (const blockData of blocks) {
            if (blockData.block != undefined) {
              const vanilla = blockData.block.permutation.getState("weirdo_direction") != undefined && blockData.block.typeId.includes("stair");
                if (blockData.block.hasTag(stairTag) || vanilla) {
                    const perm = !vanilla ? blockData.block.permutation.getState("minecraft:cardinal_direction") : blockData.block.permutation.getState("weirdo_direction");
                    const vert = !vanilla ? blockData.block.permutation.getState("minecraft:vertical_half") : blockData.block.permutation.getState("upside_down_bit") == true ? "top" : "bottom";
                    const blockVert = stair.permutation.getState("minecraft:vertical_half");
                    if (vert !== blockVert && blockVert != undefined) continue;
                    connectedSides++;
                    const adjacentDirections = getAdjacent(perm, blockData.side, direction) //returns ne, nw, se, sw or false if shouldn’t change.
                    if (adjacentDirections != false) {
                        stair.setPermutation(stair.permutation.withState(`maca_templ:connect`, adjacentDirections));
                        return;
                    }
                    connectionStates.push(blockData.side)
                    const acceptedStates = new Set (["nw", "sw", "ne", "se"]);
                    if (adjacentDirections != false && connectedSides >= 2) {
                        const newState = connectionStates[0]+connectionStates[1];
                        if (acceptedStates.has(newState)) {
                            stair.setPermutation(stair.permutation
                                .withState(`maca_templ:connect`, newState)
                            )
                            return;
                        }
                    }
                }
            }
        }
    
  }
  static updateStairsAround(Block, Break) {
    let north = undefined;
    try {
      north = Block.north(1);
    } catch {}
    let south = undefined;
    try {
      south = Block.south(1);
    } catch {}
    let east = undefined;
    try {
      east = Block.east(1);
    } catch {}
    let west = undefined;
    try {
      west = Block.west(1);
    } catch {}
    const blocks = [Block, north, south, east, west];
    for (const block of blocks) {
      if (block != undefined) {
        if (block.hasTag(stairTag)) {
          this.update_Stair_States(block, Break);
        }
      }
    }
  }
}

function getAdjacent(neighborPerm, neighborSide, stairPerm){
  if (typeof neighborPerm != "string") {
    switch (neighborPerm) {
      case 0:
        neighborPerm = "east"
        break;
      case 1:
        neighborPerm = "west"
        break
      case 2:
        neighborPerm = "south"
        break;
      case 3:
        neighborPerm = "north"
        break;
    }
  }
    let result = false;
    switch (stairPerm) {
        case "north":
            if (neighborPerm === "east" && neighborSide == "n") {
                result = "ne"
            } else if (neighborPerm === "west" && neighborSide == "n") {
                result = "nw"
            } else if (neighborPerm === "west" && neighborSide == "s") {
                result = "se"
            } else if (neighborPerm === "east" && neighborSide == "s") {
                result = "sw"
            }
            break;
        case "east":
            if (neighborPerm === "south" && neighborSide == "e") {
                result = "se"
            } else if (neighborPerm === "north" && neighborSide == "e") {
                result = "ne"
            } else if (neighborPerm === "north" && neighborSide == "w") {
                result = "sw"
            } else if (neighborPerm === "south" && neighborSide == "w") {
                result = "nw"
            }
            break;
        case "south":
            if (neighborPerm === "east" && neighborSide == "n") {
                result = "nw"
            } else if (neighborPerm === "west" && neighborSide == "n") {
                result = "ne"
            } else if (neighborPerm === "west" && neighborSide == "s") {
                result = "sw"
            } else if (neighborPerm === "east" && neighborSide == "s") {
                result = "se"
            }
            break;
        case "west":
            if (neighborPerm === "south" && neighborSide == "e") {
                result = "ne"
            } else if (neighborPerm === "north" && neighborSide == "e") {
                result = "se"
            } else if (neighborPerm === "north" && neighborSide == "w") {
                result = "nw"
            } else if (neighborPerm === "south" && neighborSide == "w") {
                result = "sw"
            }
            break;
    }
    return result;
}