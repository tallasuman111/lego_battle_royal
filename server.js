const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const { MongoClient } = require('mongodb');

// Self-contained light JSON database fallback path
const DB_FILE = path.join(__dirname, 'database.json');
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, friendships: [] }, null, 4));
}

let mongoClient = null;
let mongoDb = null;
let useMongo = false;

// Connect to MongoDB if environment variable is present
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
if (mongoUri) {
    console.log('[DB] Connecting to MongoDB...');
    mongoClient = new MongoClient(mongoUri);
    mongoClient.connect()
        .then(() => {
            console.log('[DB] MongoDB Connected Successfully!');
            mongoDb = mongoClient.db();
            useMongo = true;
        })
        .catch(err => {
            console.error('[DB] MongoDB Connection Failed! Falling back to local JSON.', err);
        });
}

const DB = {
    read() {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error('[DB] Error reading database.json, resetting.', e);
            return { users: {}, friendships: [] };
        }
    },
    write(data) {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4));
            return true;
        } catch (e) {
            console.error('[DB] Error writing database.json', e);
            return false;
        }
    },
    async getUser(username) {
        const usernameLower = username.toLowerCase();
        if (useMongo) {
            try {
                return await mongoDb.collection('users').findOne({ usernameLower }) || null;
            } catch (e) {
                console.error('[DB] MongoDB getUser error:', e);
                return null;
            }
        } else {
            const data = this.read();
            return data.users[usernameLower] || null;
        }
    },
    async saveUser(username, userObj) {
        const usernameLower = username.toLowerCase();
        userObj.usernameLower = usernameLower;
        if (useMongo) {
            try {
                const updateObj = { ...userObj };
                delete updateObj._id; // Prevent updating immutable identifier field
                await mongoDb.collection('users').replaceOne({ usernameLower }, updateObj, { upsert: true });
                return true;
            } catch (e) {
                console.error('[DB] MongoDB saveUser error:', e);
                return false;
            }
        } else {
            const data = this.read();
            data.users[usernameLower] = userObj;
            return this.write(data);
        }
    },
    async addFriendship(userA, userB, status = 'pending') {
        const aLower = userA.toLowerCase();
        const bLower = userB.toLowerCase();
        if (useMongo) {
            try {
                const exists = await mongoDb.collection('friendships').findOne({
                    $or: [
                        { userALower: aLower, userBLower: bLower },
                        { userALower: bLower, userBLower: aLower }
                    ]
                });
                if (exists) return false;
                await mongoDb.collection('friendships').insertOne({
                    userA,
                    userB,
                    userALower: aLower,
                    userBLower: bLower,
                    status
                });
                return true;
            } catch (e) {
                console.error('[DB] MongoDB addFriendship error:', e);
                return false;
            }
        } else {
            const data = this.read();
            const exists = data.friendships.some(f => 
                (f.userA.toLowerCase() === aLower && f.userB.toLowerCase() === bLower) ||
                (f.userA.toLowerCase() === bLower && f.userB.toLowerCase() === aLower)
            );
            if (exists) return false;
            data.friendships.push({ userA, userB, status });
            return this.write(data);
        }
    },
    async acceptFriendship(userA, userB) {
        const aLower = userA.toLowerCase();
        const bLower = userB.toLowerCase();
        if (useMongo) {
            try {
                const result = await mongoDb.collection('friendships').updateOne(
                    {
                        status: 'pending',
                        $or: [
                            { userALower: aLower, userBLower: bLower },
                            { userALower: bLower, userBLower: aLower }
                        ]
                    },
                    { $set: { status: 'accepted' } }
                );
                return result.modifiedCount > 0;
            } catch (e) {
                console.error('[DB] MongoDB acceptFriendship error:', e);
                return false;
            }
        } else {
            const data = this.read();
            const friendship = data.friendships.find(f => 
                (f.userA.toLowerCase() === aLower && f.userB.toLowerCase() === bLower && f.status === 'pending') ||
                (f.userA.toLowerCase() === bLower && f.userB.toLowerCase() === aLower && f.status === 'pending')
            );
            if (!friendship) return false;
            friendship.status = 'accepted';
            return this.write(data);
        }
    },
    async getFriends(username) {
        const usernameLower = username.toLowerCase();
        if (useMongo) {
            try {
                const friendships = await mongoDb.collection('friendships').find({
                    $or: [
                        { userALower: usernameLower },
                        { userBLower: usernameLower }
                    ]
                }).toArray();
                
                const friends = [];
                friendships.forEach(f => {
                    if (f.userALower === usernameLower) {
                        friends.push({ username: f.userB, status: f.status });
                    } else {
                        friends.push({ username: f.userA, status: f.status });
                    }
                });
                return friends;
            } catch (e) {
                console.error('[DB] MongoDB getFriends error:', e);
                return [];
            }
        } else {
            const data = this.read();
            const friends = [];
            data.friendships.forEach(f => {
                if (f.userA.toLowerCase() === usernameLower) {
                    friends.push({ username: f.userB, status: f.status });
                } else if (f.userB.toLowerCase() === usernameLower) {
                    friends.push({ username: f.userA, status: f.status });
                }
            });
            return friends;
        }
    }
};

// Create standard HTTP server that serves static game client files as well
const server = http.createServer((req, res) => {
    // Intercept REST APIs
    if (req.url.startsWith('/api/')) {
        const origin = req.headers.origin || '*';
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            
            try {
                const parsedBody = body ? JSON.parse(body) : {};
                
                // REGISTER API
                if (req.url === '/api/auth/register' && req.method === 'POST') {
                    const { username, password } = parsedBody;
                    if (!username || !password || username.trim().length < 3) {
                        return res.end(JSON.stringify({ success: false, error: 'Username must be at least 3 characters.' }));
                    }
                    if (await DB.getUser(username)) {
                        return res.end(JSON.stringify({ success: false, error: 'Username already taken.' }));
                    }
                    
                    const newUser = {
                        username: username,
                        passwordHash: password, // simple plaintext storage for self-containment
                        stats: { wins: 0, kills: 0, matches: 0 },
                        customization: { skin: '#f5b041', torso: 'classic', legs: 'classic' }
                    };
                    await DB.saveUser(username, newUser);
                    return res.end(JSON.stringify({ success: true, user: { username: newUser.username, stats: newUser.stats, customization: newUser.customization } }));
                }
                
                // LOGIN API
                if (req.url === '/api/auth/login' && req.method === 'POST') {
                    const { username, password } = parsedBody;
                    const user = await DB.getUser(username);
                    if (!user || user.passwordHash !== password) {
                        return res.end(JSON.stringify({ success: false, error: 'Invalid username or password.' }));
                    }
                    return res.end(JSON.stringify({ success: true, user: { username: user.username, stats: user.stats, customization: user.customization } }));
                }

                // SAVE CUSTOMIZATION / STATS API
                if (req.url === '/api/auth/customization' && req.method === 'POST') {
                    const { username, customization, stats } = parsedBody;
                    const user = await DB.getUser(username);
                    if (!user) {
                        return res.end(JSON.stringify({ success: false, error: 'User not found.' }));
                    }
                    if (customization !== undefined) {
                        user.customization = customization;
                    }
                    if (stats !== undefined) {
                        user.stats = stats;
                    }
                    await DB.saveUser(username, user);
                    return res.end(JSON.stringify({ success: true }));
                }
                
                // LOAD FRIENDS API
                if (req.url.startsWith('/api/social/friends') && req.method === 'GET') {
                    const urlObj = new URL(req.url, 'http://localhost');
                    const username = urlObj.searchParams.get('username');
                    if (!username) {
                        return res.end(JSON.stringify({ success: false, error: 'Username required.' }));
                    }
                    const friendsList = await DB.getFriends(username);
                    return res.end(JSON.stringify({ success: true, friends: friendsList }));
                }

                // ADD FRIEND API
                if (req.url === '/api/social/add-friend' && req.method === 'POST') {
                    const { username, friendName } = parsedBody;
                    if (!username || !friendName) {
                        return res.end(JSON.stringify({ success: false, error: 'Both usernames required.' }));
                    }
                    if (username.toLowerCase() === friendName.toLowerCase()) {
                        return res.end(JSON.stringify({ success: false, error: 'You cannot add yourself.' }));
                    }
                    if (!(await DB.getUser(friendName))) {
                        return res.end(JSON.stringify({ success: false, error: 'User does not exist.' }));
                    }
                    const success = await DB.addFriendship(username, friendName);
                    if (!success) {
                        return res.end(JSON.stringify({ success: false, error: 'Friendship already exists or pending.' }));
                    }
                    
                    // Dispatch real-time websocket friend request if online!
                    broadcastSocialMessage(friendName, {
                        type: 'friend_request_notify',
                        from: username
                    });
                    
                    return res.end(JSON.stringify({ success: true }));
                }

                // ACCEPT FRIEND API
                if (req.url === '/api/social/accept-friend' && req.method === 'POST') {
                    const { username, friendName } = parsedBody;
                    if (!username || !friendName) {
                        return res.end(JSON.stringify({ success: false, error: 'Both usernames required.' }));
                    }
                    const success = await DB.acceptFriendship(username, friendName);
                    if (!success) {
                        return res.end(JSON.stringify({ success: false, error: 'No pending request found.' }));
                    }
                    
                    // Dispatch real-time websocket update to both parties
                    broadcastSocialMessage(friendName, {
                        type: 'friend_accepted_notify',
                        from: username
                    });
                    broadcastSocialMessage(username, {
                        type: 'friend_accepted_notify',
                        from: friendName
                    });

                    return res.end(JSON.stringify({ success: true }));
                }
                
                // FALLBACK
                res.writeHead(404);
                return res.end(JSON.stringify({ error: 'Endpoint not found' }));
                
            } catch (e) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: 'Server JSON parse error: ' + e.message }));
            }
        });
        return;
    }

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
const rooms = new Map();

// Helper to generate IDs
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Find or create room for matchmaking
function findOrCreateRoom(scene, teamSize, pairCode, targetRoomId = null) {
    // If targetRoomId is specified, try to find it directly
    if (targetRoomId) {
        if (rooms.has(targetRoomId)) {
            const room = rooms.get(targetRoomId);
            if (room.players.size < 50) {
                return room;
            }
        } else {
            // Re-create the room with the exact targetRoomId to support seamless reconnects and invites!
            const newRoom = {
                id: targetRoomId,
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
            rooms.set(targetRoomId, newRoom);
            console.log(`[Lobby] Re-created room ${targetRoomId} | Scene: ${scene} | Mode: ${teamSize} | Code: ${pairCode || 'none'}`);
            return newRoom;
        }
    }

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

// Helper to send message to user if online
function broadcastSocialMessage(username, payload) {
    const payloadStr = JSON.stringify(payload);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && 
            client.username && 
            client.username.toLowerCase() === username.toLowerCase()) {
            client.send(payloadStr);
        }
    });
}

// Helper to broadcast status changes to friends
async function broadcastStatusToFriends(username, status) {
    const friends = await DB.getFriends(username);
    friends.forEach(f => {
        if (f.status === 'accepted') {
            broadcastSocialMessage(f.username, {
                type: 'friend_status_sync',
                username: username,
                status: status
            });
        }
    });
}

// Helper to sync friends online list to connecting user
async function syncFriendsOnlineStatuses(ws) {
    if (!ws.username) return;
    const friends = await DB.getFriends(ws.username);
    const friendsWithStatus = friends.map(f => {
        let status = 'offline';
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && 
                client.username && 
                client.username.toLowerCase() === f.username.toLowerCase()) {
                status = 'online';
                if (client.currentRoomId) {
                    const room = rooms.get(client.currentRoomId);
                    if (room && room.state === 'in_game') {
                        status = 'in-match';
                    }
                }
            }
        });
        return { username: f.username, friendshipStatus: f.status, onlineStatus: status };
    });

    ws.send(JSON.stringify({
        type: 'friends_status_list',
        friends: friendsWithStatus
    }));
}

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.id = 'client_' + generateId();
    ws.currentRoomId = null;
    ws.username = null;

    console.log(`[Server] Client connected: ${ws.id}`);

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'join':
                    await handleJoin(ws, data);
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
                case 'loot_pickup':
                    handleLootPickup(ws, data);
                    break;
                case 'loot_drop':
                    handleLootDrop(ws, data);
                    break;
                case 'return_to_lobby':
                    handleReturnToLobby(ws);
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
                    await handleStartMatch(ws, data);
                    break;
                case 'social_login':
                    ws.username = data.username;
                    console.log(`[Social] Socket ${ws.id} registered username: ${data.username}`);
                    await broadcastStatusToFriends(data.username, 'online');
                    await syncFriendsOnlineStatuses(ws);
                    break;
                case 'social_status':
                    if (ws.username) {
                        await broadcastStatusToFriends(ws.username, data.status);
                    }
                    break;
                case 'leave_room':
                    await leaveCurrentRoom(ws);
                    break;
                case 'squad_invite':
                    console.log(`[Social] Squad invite from ${data.from} to ${data.to} | Room: ${data.roomId}`);
                    let foundTarget = false;
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN && 
                            client.username && 
                            client.username.toLowerCase() === data.to.toLowerCase()) {
                            foundTarget = true;
                        }
                    });
                    console.log(`[Social] Target ${data.to} online status check: ${foundTarget}`);
                    
                    broadcastSocialMessage(data.to, {
                        type: 'squad_invite_notify',
                        from: data.from,
                        roomId: data.roomId
                    });
                    break;
                case 'squad_accept':
                    broadcastSocialMessage(data.to, {
                        type: 'squad_accept_notify',
                        from: data.from
                    });
                    break;
                default:
                    console.log(`[Server] Unknown message type: ${data.type}`);
            }
        } catch (e) {
            console.error(`[Server] Failed to process message from ${ws.id}:`, e);
        }
    });

    ws.on('close', async () => {
        console.log(`[Server] Client disconnected: ${ws.id}`);
        await leaveCurrentRoom(ws);
        if (ws.username) {
            await broadcastStatusToFriends(ws.username, 'offline');
        }
    });
});

wss.on('close', () => {
    clearInterval(interval);
});

// ----------------------------------------------------
// Handlers
// ----------------------------------------------------

async function handleJoin(ws, data) {
    await leaveCurrentRoom(ws);
    const scene = data.scene || 'grassland';
    const teamSize = data.teamSize || 'solo';
    const pairCode = data.pairCode ? data.pairCode.trim().toUpperCase() : null;
    const name = data.name || 'Minifig';
    const color = data.color || '#f5b041';
    const targetRoomId = data.targetRoomId || null;

    const room = findOrCreateRoom(scene, teamSize, pairCode, targetRoomId);
    ws.currentRoomId = room.id;

    // Clear any active cleanup timeouts if this room was empty
    if (room.cleanupTimeout) {
        clearTimeout(room.cleanupTimeout);
        room.cleanupTimeout = null;
        console.log(`[Room ${room.id}] Active cleanup cancelled because a player joined.`);
    }

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

    // Assign host if first player or if this player is the permanent Host rejoining
    const currentUsername = ws.username || null;
    if (!room.hostId) {
        if (currentUsername) {
            room.hostUsername = currentUsername;
            room.hostId = ws.id;
            console.log(`[Room ${room.id}] Designated player ${ws.id} (username: ${currentUsername}) as permanent Host.`);
        } else {
            room.hostId = ws.id;
            console.log(`[Room ${room.id}] Designated guest ${ws.id} as Host.`);
        }
    } else if (currentUsername && room.hostUsername && room.hostUsername.toLowerCase() === currentUsername.toLowerCase()) {
        if (room.state !== 'in_game') {
            room.hostId = ws.id;
            console.log(`[Room ${room.id}] Host ${currentUsername} reconnected. Restoring Host authority to socket ${ws.id}.`);
        } else {
            console.log(`[Room ${room.id}] Host ${currentUsername} reconnected but match is in-progress. Joining as client.`);
        }
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
        pairCode: room.pairCode,
        roomState: room.state,
        botCount: room.botCount,
        seed: room.seed
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

async function handleStartMatch(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || room.hostId !== ws.id) return; // Only host can trigger start

    room.state = 'in_game';
    room.botCount = data.botCount !== undefined ? data.botCount : 19;
    room.seed = data.seed !== undefined ? data.seed : Math.random();
    console.log(`[Room ${room.id}] Match starting by Host action.`);

    // Broadcast match start to all in room, passing the host's selected botCount and any other start parameters (like seed, flightAngle, etc.)
    broadcastToRoom(room.id, {
        ...data,
        type: 'match_start'
    });

    // Broadcast 'in-match' status to friends of all authenticated room players
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN && client.currentRoomId === room.id && client.username) {
            await broadcastStatusToFriends(client.username, 'in-match');
        }
    }
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
    player.survivalTime = data.survivalTime;

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
        kills: data.kills,
        survivalTime: data.survivalTime
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

function handleLootPickup(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    // Broadcast the loot pickup to all other players in the room, excluding the sender
    broadcastToRoom(roomId, {
        type: 'loot_pickup_replicated',
        itemId: data.itemId
    }, ws.id);
}

function handleLootDrop(ws, data) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    // Broadcast the dropped loot to all other players in the room, excluding the sender
    broadcastToRoom(roomId, {
        type: 'loot_drop_replicated',
        item: data.item
    }, ws.id);
}

function handleReturnToLobby(ws) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    // Reset room state from in_game to lobby
    if (room.state === 'in_game') {
        room.state = 'lobby';
        console.log(`[Room ${room.id}] Resetting room state back to 'lobby'.`);
    }

    // Refresh and broadcast the updated lobby list to everyone in the room
    broadcastRoomPlayers(room);
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
        id: data.shooterId || ws.id,
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

async function leaveCurrentRoom(ws) {
    const roomId = ws.currentRoomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (room) {
        // Remove player
        room.players.delete(ws.id);
        console.log(`[Room ${room.id}] Player left: ${ws.id} | Remaining: ${room.players.size}`);

        // If room is empty, clear it out after a grace period of 60 seconds
        if (room.players.size === 0) {
            console.log(`[Room ${room.id}] Became empty. Scheduling cleanup in 60s...`);
            room.hostId = null;
            room.hostUsername = null;
            room.cleanupTimeout = setTimeout(() => {
                rooms.delete(room.id);
                console.log(`[Room ${room.id}] Cleanup complete. Room deleted.`);
            }, 60000);
        } else {
            // If the leaving player was the host, migrate host authority to another player
            if (room.hostId === ws.id) {
                const nextHostId = room.players.keys().next().value;
                const nextHostWs = Array.from(wss.clients).find(c => c.id === nextHostId);
                
                if (nextHostWs) {
                    room.hostId = nextHostWs.id;
                    room.hostUsername = nextHostWs.username || null;
                    console.log(`[Room ${room.id}] Host migrated from ${ws.id} to new Host: ${nextHostWs.id}`);
                    
                    // Broadcast new host info
                    broadcastToRoom(room.id, {
                        type: 'host_migrated',
                        hostId: room.hostId,
                        hostUsername: room.hostUsername
                    });
                }
            }

            // Broadcast player left
            broadcastToRoom(room.id, {
                type: 'player_left',
                id: ws.id
            });

            // Refresh player lists
            broadcastRoomPlayers(room);
        }
    }

    ws.currentRoomId = null;

    if (ws.username) {
        await broadcastStatusToFriends(ws.username, 'online');
    }
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
