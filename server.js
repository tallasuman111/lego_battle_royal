const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

// Create standard HTTP server that serves static game client files as well
const server = http.createServer((req, res) => {
    // Standardize URL and strip query parameters (e.g. cache-busters, wsPort, etc.)
    let filePath = '.' + req.url.split('?')[0];
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // If it's a status health check, keep it alive
                if (req.url.startsWith('/status')) {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('LEGO Battle Royale Socket Server is running!\n');
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('File Not Found\n');
                }
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error: ' + error.code + '\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Create WebSocket server attached to HTTP
const wss = new WebSocket.Server({ server });

// Keep track of matchmaking rooms
// roomId -> { id, scene, teamSize, pairCode, players: Map, hostId, bots: [], zone: {}, state: 'lobby', created: timestamp }
const rooms = new Map();

// Helper to generate IDs
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Find or create room for matchmaking
function findOrCreateRoom(scene, teamSize, pairCode) {
    // Look for existing compatible room that is in 'lobby' state and has space
    for (const [id, room] of rooms.entries()) {
        if (room.state === 'lobby' &&
            room.scene === scene &&
            room.teamSize === teamSize &&
            room.players.size < 50) {
            
            // If pairCode is provided, must match exactly.
            // If no pairCode, room must also have no pairCode.
            if (pairCode && room.pairCode === pairCode) {
                return room;
            } else if (!pairCode && !room.pairCode) {
                return room;
            }
        }
    }

    // None found, create a new room
    const roomId = 'room_' + generateId();
    const newRoom = {
        id: roomId,
        scene: scene,
        teamSize: teamSize,
        pairCode: pairCode || null,
        players: new Map(), // wsId -> player state
        hostId: null,
        bots: [],
        zone: null,
        state: 'lobby',
        created: Date.now()
    };
    rooms.set(roomId, newRoom);
    console.log(`[Lobby] Created new room ${roomId} | Scene: ${scene} | Mode: ${teamSize} | Code: ${pairCode || 'none'}`);
    return newRoom;
}

// Clean up empty rooms
function cleanRooms() {
    for (const [id, room] of rooms.entries()) {
        if (room.players.size === 0) {
            rooms.delete(id);
            console.log(`[Lobby] Cleaned up empty room ${id}`);
        }
    }
}

// Keep connection alive (Ping-Pong)
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log(`[Server] Terminating inactive connection: ${ws.id}`);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.id = 'client_' + generateId();
    ws.currentRoomId = null;

    console.log(`[Server] Client connected: ${ws.id}`);

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'join':
                    handleJoin(ws, data);
                    break;
                case 'state_sync':
                    handleStateSync(ws, data);
                    break;
                case 'host_sync':
                    handleHostSync(ws, data);
                    break;
                case 'host_loot_sync':
                    handleHostLootSync(ws, data);
                    break;
                case 'damage':
                    handleDamage(ws, data);
                    break;
                case 'bullet_spawn':
                    handleBulletSpawn(ws, data);
                    break;
                case 'elimination':
                    handleElimination(ws, data);
                    break;
                case 'start_match':
                    handleStartMatch(ws);
                    break;
                default:
                    console.log(`[Server] Unknown message type: ${data.type}`);
            }
        } catch (e) {
            console.error(`[Server] Failed to process message from ${ws.id}:`, e);
        }
    });

    ws.on('close', () => {
        console.log(`[Server] Client disconnected: ${ws.id}`);
        handleDisconnect(ws);
    });
});

wss.on('close', () => {
    clearInterval(interval);
});

// ----------------------------------------------------
// Handlers
// ----------------------------------------------------

function handleJoin(ws, data) {
    const scene = data.scene || 'grassland';
    const teamSize = data.teamSize || 'solo';
    const pairCode = data.pairCode ? data.pairCode.trim().toUpperCase() : null;
    const name = data.name || 'Minifig';
    const color = data.color || '#f5b041';

    const room = findOrCreateRoom(scene, teamSize, pairCode);
    ws.currentRoomId = room.id;

    // Build this player's initial network state
    const playerState = {
        id: ws.id,
        name: name,
        color: color,
        x: 0,
        y: 0,
        angle: 0,
        state: 'plane',
        parachuteAltitude: 250,
        health: 100,
        shield: 0,
        activeWeaponIndex: 0,
        armorLevel: 0,
        kills: 0,
        isTeammate: false
    };

    // Add to room
    room.players.set(ws.id, playerState);

    // Assign host if first player
    if (!room.hostId) {
        room.hostId = ws.id;
        console.log(`[Room ${room.id}] Designated player ${ws.id} (${name}) as Host.`);
    }

    // Duo team allocation
    let teammateId = null;
    if (teamSize === 'duo') {
        // Group players in pairs based on join order in this room
        const clientIds = Array.from(room.players.keys());
        const myIndex = clientIds.indexOf(ws.id);
        
        if (myIndex % 2 === 1) {
            // Pair with the preceding player
            teammateId = clientIds[myIndex - 1];
        } else if (myIndex + 1 < clientIds.length) {
            // Pair with the succeeding player
            teammateId = clientIds[myIndex + 1];
        }
    }

    // Confirm join to client
    ws.send(JSON.stringify({
        type: 'joined',
        id: ws.id,
        roomId: room.id,
        isHost: ws.id === room.hostId,
        teammateId: teammateId,
        scene: room.scene,
        teamSize: room.teamSize,
        pairCode: room.pairCode
    }));

    // Broadcast updated player list and teammate assignments to everyone in the room
    broadcastRoomPlayers(room);

    console.log(`[Room ${room.id}] Player joined: ${name} (${ws.id}) | Total: ${room.players.size}/50`);
}

function broadcastRoomPlayers(room) {
    const playersList = Array.from(room.players.values());

    // Send the list to every socket in the room
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.currentRoomId === room.id) {
            
            // Re-evaluate teammates from this client's perspective
            let teammateId = null;
            if (room.teamSize === 'duo') {
                const clientIds = Array.from(room.players.keys());
                const myIndex = clientIds.indexOf(client.id);
                if (myIndex % 2 === 1) {
                    teammateId = clientIds[myIndex - 1];
                } else if (myIndex + 1 < clientIds.length) {
                    teammateId = clientIds[myIndex + 1];
                }
            }

            const personalizedList = playersList.map(p => ({
                ...p,
                isTeammate: teammateId !== null && p.id === teammateId
            }));

            client.send(JSON.stringify({
                type: 'room_players',
                players: personalizedList,
                teammateId: teammateId,
                hostId: room.hostId,
                isHost: client.id === room.hostId
            }));
        }
    });
}

function handleStartMatch(ws) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || room.hostId !== ws.id) return; // Only host can trigger start

    room.state = 'in_game';
    console.log(`[Room ${room.id}] Match starting by Host action.`);

    // Broadcast match start to all in room
    broadcastToRoom(room.id, {
        type: 'match_start'
    });
}

function handleStateSync(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(ws.id);
    if (!player) return;

    // Update player parameters
    player.x = data.x;
    player.y = data.y;
    player.angle = data.angle;
    player.state = data.state;
    player.parachuteAltitude = data.parachuteAltitude;
    player.health = data.health;
    player.shield = data.shield;
    player.activeWeaponIndex = data.activeWeaponIndex;
    player.armorLevel = data.armorLevel;
    player.kills = data.kills;

    // Broadcast coordinates and status to all other clients in the room
    broadcastToRoom(room.id, {
        type: 'player_sync',
        id: ws.id,
        x: data.x,
        y: data.y,
        angle: data.angle,
        state: data.state,
        parachuteAltitude: data.parachuteAltitude,
        health: data.health,
        shield: data.shield,
        activeWeaponIndex: data.activeWeaponIndex,
        armorLevel: data.armorLevel,
        kills: data.kills
    }, ws.id); // Exclude sender
}

function handleHostSync(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || room.hostId !== ws.id) return; // Only Host can sync bots and zone

    room.bots = data.bots;
    room.zone = data.zone;

    // Broadcast bot and zone tick data to all clients in the room (excluding host)
    broadcastToRoom(room.id, {
        type: 'game_sync',
        bots: data.bots,
        zone: data.zone
    }, ws.id);
}

function handleHostLootSync(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || room.hostId !== ws.id) return; // Only Host syncs spawning and picking up of items

    // Forward loot update to all other clients
    broadcastToRoom(room.id, {
        type: 'loot_sync',
        loot: data.loot
    }, ws.id);
}

function handleDamage(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    // Broadcast damage event to all clients in the room
    broadcastToRoom(roomId, {
        type: 'damage_replicated',
        attackerId: data.attackerId,
        targetId: data.targetId,
        damage: data.damage,
        isBot: data.isBot
    });
}

function handleBulletSpawn(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    // Broadcast bullet spawn parameters to all other clients in the room
    broadcastToRoom(roomId, {
        type: 'bullet_replicated',
        id: ws.id,
        x: data.x,
        y: data.y,
        vx: data.vx,
        vy: data.vy,
        weaponId: data.weaponId
    }, ws.id);
}

function handleElimination(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    // Re-verify kills on server if needed, otherwise just broadcast the event
    broadcastToRoom(roomId, {
        type: 'elimination_replicated',
        killedId: data.killedId,
        killerId: data.killerId,
        killedName: data.killedName,
        killerName: data.killerName
    });
}

function handleDisconnect(ws) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    // Remove player
    room.players.delete(ws.id);
    console.log(`[Room ${room.id}] Player left: ${ws.id} | Remaining: ${room.players.size}`);

    // If room is empty, clear it out
    if (room.players.size === 0) {
        rooms.delete(room.id);
        console.log(`[Room ${room.id}] Room deleted because it became empty.`);
        return;
    }

    // If host disconnected, nominate a new Host
    if (room.hostId === ws.id) {
        const nextHostId = room.players.keys().next().value;
        room.hostId = nextHostId;
        console.log(`[Room ${room.id}] Host disconnected. Designated new Host: ${nextHostId}`);

        // Broadcast host change to everyone
        broadcastToRoom(room.id, {
            type: 'host_migrated',
            hostId: nextHostId
        });
    }

    // Broadcast player left
    broadcastToRoom(room.id, {
        type: 'player_left',
        id: ws.id
    });

    // Refresh player lists
    broadcastRoomPlayers(room);
}

// ----------------------------------------------------
// Core Network Broadcasting
// ----------------------------------------------------

function broadcastToRoom(roomId, dataObj, excludeId = null) {
    const messageStr = JSON.stringify(dataObj);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && 
            client.currentRoomId === roomId && 
            client.id !== excludeId) {
            client.send(messageStr);
        }
    });
}

// Start Server listening
server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`   LEGO BATTLE ROYALE SOCKET SERVER RUNNING ON PORT ${PORT} `);
    console.log(`   Connect client-side to: ws://localhost:${PORT}      `);
    console.log(`=======================================================`);
});
