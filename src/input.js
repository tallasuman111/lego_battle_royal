// Unified Input Manager for Keyboard/Mouse, Touch Screen, and Gamepad Controller support
export class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, rawX: 0, rawY: 0, clicked: false };
        
        // Normalized movement vectors (-1 to 1)
        this.moveX = 0;
        this.moveY = 0;

        // Normalized aiming/shooting direction vector (-1 to 1)
        this.aimX = 0;
        this.aimY = 0;
        this.aimAngle = 0; // Radians
        this.isAiming = false; // Mouse aim is always true, gamepad/touch aim when active
        this.isFiring = false;

        // Action flags (cleared after reading, or held down)
        this.actions = {
            shoot: false,
            reload: false,
            interact: false,
            heal: false,
            eject: false,
            weapon1: false,
            weapon2: false,
            weapon3: false,
            touchActive: false // Flag to show touch UI
        };

        // Touch Joystick State
        this.moveJoy = { active: false, startX: 0, startY: 0, x: 0, y: 0, identifier: null };
        this.aimJoy = { active: false, startX: 0, startY: 0, x: 0, y: 0, identifier: null };
        this.maxJoyRadius = 50; // Pixels

        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);

        this.initKeyboardMouse();
        this.initTouchControls();
    }

    triggerDeviceSwitch(type) {
        if (this.director) {
            if (this.director.deviceType !== type) {
                this.director.setDeviceType(type);
            }
        } else if (window.director) {
            if (window.director.deviceType !== type) {
                window.director.setDeviceType(type);
            }
        }
    }

    initKeyboardMouse() {
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
        window.addEventListener('mousemove', this.boundMouseMove);
        window.addEventListener('mousedown', this.boundMouseDown);
        window.addEventListener('mouseup', this.boundMouseUp);
        
        // Prevent default actions for standard gaming keys (arrow keys, space)
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        // Quick trigger actions
        if (e.code === 'KeyR') this.actions.reload = true;
        if (e.code === 'KeyE' || e.code === 'KeyF') this.actions.interact = true;
        if (e.code === 'Space') {
            this.actions.heal = true;
            this.actions.eject = true;
        }
        if (e.code === 'Digit1') this.actions.weapon1 = true;
        if (e.code === 'Digit2') this.actions.weapon2 = true;
        if (e.code === 'Digit3') this.actions.weapon3 = true;
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    handleMouseMove(e) {
        this.mouse.rawX = e.clientX;
        this.mouse.rawY = e.clientY;
    }

    handleMouseDown(e) {
        if (e.button === 0) {
            this.mouse.clicked = true;
            this.isFiring = true;
        }
    }

    handleMouseUp(e) {
        if (e.button === 0) {
            this.mouse.clicked = false;
            this.isFiring = false;
        }
    }

    // Touch Support with custom analog joysticks
    initTouchControls() {
        const joyMove = document.getElementById('joystick-move');
        const joyAim = document.getElementById('joystick-aim');
        
        if (!joyMove || !joyAim) return;

        // Auto-detect touch capability
        const showTouchUI = () => {
            this.actions.touchActive = true;
            document.getElementById('touch-controls').classList.add('active');
        };

        window.addEventListener('touchstart', showTouchUI, { once: true });

        // Left Joystick (Movement)
        joyMove.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.targetTouches[0];
            const rect = joyMove.getBoundingClientRect();
            this.moveJoy.active = true;
            this.moveJoy.startX = rect.left + rect.width / 2;
            this.moveJoy.startY = rect.top + rect.height / 2;
            this.moveJoy.identifier = touch.identifier;
        });

        joyMove.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.moveJoy.active) return;
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                if (touch.identifier === this.moveJoy.identifier) {
                    const dx = touch.clientX - this.moveJoy.startX;
                    const dy = touch.clientY - this.moveJoy.startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist === 0) {
                        this.moveJoy.x = 0;
                        this.moveJoy.y = 0;
                    } else {
                        const angle = Math.atan2(dy, dx);
                        const clampedDist = Math.min(dist, this.maxJoyRadius);
                        this.moveJoy.x = (Math.cos(angle) * clampedDist) / this.maxJoyRadius;
                        this.moveJoy.y = (Math.sin(angle) * clampedDist) / this.maxJoyRadius;
                    }

                    // Move virtual knob visually
                    const knob = document.getElementById('joystick-move-knob');
                    if (knob) {
                        knob.style.transform = `translate(${this.moveJoy.x * this.maxJoyRadius}px, ${this.moveJoy.y * this.maxJoyRadius}px)`;
                    }
                }
            }
        });

        const resetMoveJoy = () => {
            this.moveJoy.active = false;
            this.moveJoy.x = 0;
            this.moveJoy.y = 0;
            const knob = document.getElementById('joystick-move-knob');
            if (knob) knob.style.transform = 'translate(0px, 0px)';
        };

        joyMove.addEventListener('touchend', resetMoveJoy);
        joyMove.addEventListener('touchcancel', resetMoveJoy);

        // Right Joystick (Aim & Auto-Shoot)
        joyAim.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.targetTouches[0];
            const rect = joyAim.getBoundingClientRect();
            this.aimJoy.active = true;
            this.aimJoy.startX = rect.left + rect.width / 2;
            this.aimJoy.startY = rect.top + rect.height / 2;
            this.aimJoy.identifier = touch.identifier;
            this.isFiring = true;
        });

        joyAim.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.aimJoy.active) return;
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                if (touch.identifier === this.aimJoy.identifier) {
                    const dx = touch.clientX - this.aimJoy.startX;
                    const dy = touch.clientY - this.aimJoy.startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 5) {
                        const screenAngle = Math.atan2(dy, dx);
                        const clampedDist = Math.min(dist, this.maxJoyRadius);
                        this.aimJoy.x = (Math.cos(screenAngle) * clampedDist) / this.maxJoyRadius;
                        this.aimJoy.y = (Math.sin(screenAngle) * clampedDist) / this.maxJoyRadius;
                        
                        let worldAngle = screenAngle;
                        if (this.camera && this.camera.viewMode === 'isometric') {
                            worldAngle += Math.PI / 4;
                        }
                        
                        this.aimX = Math.cos(worldAngle);
                        this.aimY = Math.sin(worldAngle);
                        this.aimAngle = worldAngle;
                        this.isAiming = true;
                        this.isFiring = true;
                    }

                    const knob = document.getElementById('joystick-aim-knob');
                    if (knob) {
                        knob.style.transform = `translate(${this.aimJoy.x * this.maxJoyRadius}px, ${this.aimJoy.y * this.maxJoyRadius}px)`;
                    }
                }
            }
        });

        const resetAimJoy = () => {
            this.aimJoy.active = false;
            this.aimJoy.x = 0;
            this.aimJoy.y = 0;
            this.isFiring = false;
            const knob = document.getElementById('joystick-aim-knob');
            if (knob) knob.style.transform = 'translate(0px, 0px)';
        };

        joyAim.addEventListener('touchend', resetAimJoy);
        joyAim.addEventListener('touchcancel', resetAimJoy);

        // Tap Buttons
        document.getElementById('t-btn-eject').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.actions.eject = true;
        });
        document.getElementById('t-btn-reload').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.actions.reload = true;
        });
        document.getElementById('t-btn-heal').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.actions.heal = true;
        });
        document.getElementById('t-btn-interact').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.actions.interact = true;
        });
    }

    updateGamepadDebugHUD(activeGamepad) {
        if (!activeGamepad) {
            const debugPanel = document.getElementById('gamepad-debug');
            if (debugPanel) debugPanel.classList.add('hidden');
            return;
        }

        const debugPanel = document.getElementById('gamepad-debug');
        if (debugPanel) {
            debugPanel.classList.remove('hidden');
            
            const debugName = document.getElementById('gamepad-name');
            if (debugName) debugName.textContent = activeGamepad.id;

            const deadzone = 0.15;
            const applyDeadzone = (val) => {
                if (Math.abs(val) < deadzone) return 0;
                return (val - Math.sign(val) * deadzone) / (1 - deadzone);
            };

            const stickLeftX = applyDeadzone(activeGamepad.axes[0]);
            const stickLeftY = applyDeadzone(activeGamepad.axes[1]);
            const debugLeft = document.getElementById('debug-left-stick');
            if (debugLeft) debugLeft.textContent = `${stickLeftX.toFixed(2)}, ${stickLeftY.toFixed(2)}`;

            let stick2 = activeGamepad.axes.length > 2 ? applyDeadzone(activeGamepad.axes[2]) : 0;
            let stick3 = activeGamepad.axes.length > 3 ? applyDeadzone(activeGamepad.axes[3]) : 0;
            let stick4 = activeGamepad.axes.length > 4 ? applyDeadzone(activeGamepad.axes[4]) : 0;
            let stick5 = activeGamepad.axes.length > 5 ? applyDeadzone(activeGamepad.axes[5]) : 0;

            let stickRightX = 0;
            let stickRightY = 0;

            // Detect if axes are triggers (resting at -1)
            const axis2IsTrigger = activeGamepad.axes.length > 2 && activeGamepad.axes[2] < -0.9;
            const axis3IsTrigger = activeGamepad.axes.length > 3 && activeGamepad.axes[3] < -0.9;
            const axis4IsTrigger = activeGamepad.axes.length > 4 && activeGamepad.axes[4] < -0.9;
            const axis5IsTrigger = activeGamepad.axes.length > 5 && activeGamepad.axes[5] < -0.9;

            if (activeGamepad.mapping === 'standard') {
                stickRightX = stick2;
                stickRightY = stick3;
            } else {
                // Dynamically assign stick axes by avoiding trigger axes
                if (axis3IsTrigger) {
                    stickRightX = stick2;
                    stickRightY = (activeGamepad.axes.length > 5 && !axis5IsTrigger) ? stick5 : (activeGamepad.axes.length > 4 && !axis4IsTrigger ? stick4 : stick3);
                } else if (axis2IsTrigger) {
                    stickRightX = stick3;
                    stickRightY = stick4;
                } else {
                    stickRightX = stick2;
                    stickRightY = stick3;
                }
            }

            const debugRight = document.getElementById('debug-right-stick');
            if (debugRight) debugRight.textContent = `${stickRightX.toFixed(2)}, ${stickRightY.toFixed(2)}`;

            const axesGrid = document.getElementById('debug-axes-grid');
            if (axesGrid) {
                axesGrid.innerHTML = '';
                for (let i = 0; i < Math.min(6, activeGamepad.axes.length); i++) {
                    const val = activeGamepad.axes[i];
                    const activeClass = Math.abs(val) > 0.15 ? 'active' : '';
                    axesGrid.innerHTML += `<div class="axis-item">A${i}: <span class="axis-val ${activeClass}">${val.toFixed(2)}</span></div>`;
                }
            }

            const buttonsGrid = document.getElementById('debug-buttons-grid');
            if (buttonsGrid) {
                buttonsGrid.innerHTML = '';
                for (let i = 0; i < Math.min(16, activeGamepad.buttons.length); i++) {
                    const btn = activeGamepad.buttons[i];
                    const isPressed = btn.pressed || btn.value > 0.5;
                    const pressedClass = isPressed ? 'pressed' : '';
                    buttonsGrid.innerHTML += `<div class="btn-indicator ${pressedClass}">${i}</div>`;
                }
            }
        }
    }

    // Standard HTML5 Gamepad controller handling
    updateGamepad(camera) {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let activeGamepad = null;
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && gamepads[i].connected) {
                activeGamepad = gamepads[i];
                break;
            }
        }

        // Hide debug panel if no gamepad connected
        if (!activeGamepad) {
            const debugPanel = document.getElementById('gamepad-debug');
            if (debugPanel) debugPanel.classList.add('hidden');
            return false;
        }

        // TV Gamepad Menu Navigation Helper: Allow A (Button 0) or Start (Button 9) to auto-click Matchmaking
        const directorObj = this.director || window.director;
        if (directorObj && directorObj.gameState === 'menu') {
            const btnA = activeGamepad.buttons[0];
            const btnStart = activeGamepad.buttons.length > 9 ? activeGamepad.buttons[9] : null;
            if ((btnA && btnA.pressed) || (btnStart && btnStart.pressed)) {
                const startBtn = document.getElementById('btn-start-game');
                if (startBtn && !startBtn.disabled) {
                    if (!this.menuClickCooldown || Date.now() - this.menuClickCooldown > 1000) {
                        this.menuClickCooldown = Date.now();
                        startBtn.click();
                    }
                }
            }
        }

        const deadzone = 0.15;
        const applyDeadzone = (val) => {
            if (Math.abs(val) < deadzone) return 0;
            return (val - Math.sign(val) * deadzone) / (1 - deadzone);
        };

        // Check if there is actual input from the gamepad to trigger TV/Gamepad mode dynamically.
        // We only check active, deadzoned movement axes and button presses, ignoring triggers at rest.
        let hasInput = false;

        // 1. Check Left Stick
        const stickLeftX = applyDeadzone(activeGamepad.axes[0]);
        const stickLeftY = applyDeadzone(activeGamepad.axes[1]);
        if (stickLeftX !== 0 || stickLeftY !== 0) {
            hasInput = true;
        }

        // 2. Check Right Stick (supports standard and alternative mapping)
        let stick2 = activeGamepad.axes.length > 2 ? applyDeadzone(activeGamepad.axes[2]) : 0;
        let stick3 = activeGamepad.axes.length > 3 ? applyDeadzone(activeGamepad.axes[3]) : 0;
        let stick4 = activeGamepad.axes.length > 4 ? applyDeadzone(activeGamepad.axes[4]) : 0;
        let stick5 = activeGamepad.axes.length > 5 ? applyDeadzone(activeGamepad.axes[5]) : 0;

        let stickRightX = 0;
        let stickRightY = 0;

        // Detect if axes are triggers (resting at -1)
        const axis2IsTrigger = activeGamepad.axes.length > 2 && activeGamepad.axes[2] < -0.9;
        const axis3IsTrigger = activeGamepad.axes.length > 3 && activeGamepad.axes[3] < -0.9;
        const axis4IsTrigger = activeGamepad.axes.length > 4 && activeGamepad.axes[4] < -0.9;
        const axis5IsTrigger = activeGamepad.axes.length > 5 && activeGamepad.axes[5] < -0.9;

        if (activeGamepad.mapping === 'standard') {
            stickRightX = stick2;
            stickRightY = stick3;
        } else {
            // Dynamically assign stick axes by avoiding trigger axes
            if (axis3IsTrigger) {
                stickRightX = stick2;
                stickRightY = (activeGamepad.axes.length > 5 && !axis5IsTrigger) ? stick5 : (activeGamepad.axes.length > 4 && !axis4IsTrigger ? stick4 : stick3);
            } else if (axis2IsTrigger) {
                stickRightX = stick3;
                stickRightY = stick4;
            } else {
                stickRightX = stick2;
                stickRightY = stick3;
            }
        }

        if (stickRightX !== 0 || stickRightY !== 0) {
            hasInput = true;
        }

        // 3. Check Buttons
        if (!hasInput) {
            for (let i = 0; i < activeGamepad.buttons.length; i++) {
                const btn = activeGamepad.buttons[i];
                if (btn.pressed || btn.value > 0.1) {
                    hasInput = true;
                    break;
                }
            }
        }

        if (hasInput) {
            this.triggerDeviceSwitch('tv');
        }

        // Always update Gamepad Debug HUD if connected
        this.updateGamepadDebugHUD(activeGamepad);

        // If no active gamepad input, yield control to keyboard/mouse (avoid device fight stutter)
        if (!hasInput) {
            return false;
        }

        this.isAiming = false;

        // Apply Left Stick - Movement
        if (stickLeftX !== 0 || stickLeftY !== 0) {
            this.moveX = stickLeftX;
            this.moveY = stickLeftY;
        }

        // Apply Right Stick - Aiming
        if (stickRightX !== 0 || stickRightY !== 0) {
            let rx = stickRightX;
            let ry = stickRightY;
            if (camera && camera.viewMode === 'isometric') {
                const rotAngle = Math.PI / 4;
                rx = stickRightX * Math.cos(rotAngle) - stickRightY * Math.sin(rotAngle);
                ry = stickRightX * Math.sin(rotAngle) + stickRightY * Math.cos(rotAngle);
            }
            this.aimX = rx;
            this.aimY = ry;
            this.aimAngle = Math.atan2(ry, rx);
            this.isAiming = true;
        }

        // Trigger shooting (RT / Button 7)
        const rt = activeGamepad.buttons[7];
        if (rt) {
            const firePressed = rt.pressed || rt.value > 0.1;
            this.isFiring = firePressed;
        }

        // Action buttons
        // A / Cross (Button 0) -> Eject / Interact
        const btnInteract = activeGamepad.buttons[0];
        if (btnInteract && (btnInteract.pressed || btnInteract.value > 0.5)) {
            this.actions.interact = true;
            this.actions.eject = true;
        }

        // Support Reload on Button 2 (Square/X) or Button 3 (Triangle/Y)
        // Check for robust button pressure threshold (> 0.5) to avoid analog trigger/drift loop
        const btnReload2 = activeGamepad.buttons[2];
        const btnReload3 = activeGamepad.buttons[3];
        const isReloadPressed = (btnReload2 && (btnReload2.pressed || btnReload2.value > 0.5)) ||
                                (btnReload3 && (btnReload3.pressed || btnReload3.value > 0.5));
        if (isReloadPressed) {
            this.actions.reload = true;
        }

        // D-pad Up (Button 12) -> Heal
        const btnHeal = activeGamepad.buttons[12];
        if (btnHeal && (btnHeal.pressed || btnHeal.value > 0.5)) {
            this.actions.heal = true;
        }

        // Weapon swapping using bumpers (LB Button 4, RB Button 5)
        // Switch weapon index by clicking bumpers
        const btnLB = activeGamepad.buttons[4];
        if (btnLB && (btnLB.pressed || btnLB.value > 0.5) && !this.wasLBPressed) {
            this.actions.bumperLeft = true;
            this.wasLBPressed = true;
        } else if (btnLB && !(btnLB.pressed || btnLB.value > 0.5)) {
            this.wasLBPressed = false;
        }

        const btnRB = activeGamepad.buttons[5];
        if (btnRB && (btnRB.pressed || btnRB.value > 0.5) && !this.wasRBPressed) {
            this.actions.bumperRight = true;
            this.wasRBPressed = true;
        } else if (btnRB && !(btnRB.pressed || btnRB.value > 0.5)) {
            this.wasRBPressed = false;
        }

        return true;
    }

    // Call inside the game loop to resolve current inputs
    update(camera, player) {
        this.camera = camera;
        // Reset movement vectors
        this.moveX = 0;
        this.moveY = 0;

        // Try Gamepad first
        const currentDevice = this.director ? this.director.deviceType : (window.director ? window.director.deviceType : 'desktop');
        const gamepadUsed = this.updateGamepad(camera);

        if (!gamepadUsed) {
            // Resolve Keyboard Movement
            if (this.keys['KeyW'] || this.keys['ArrowUp']) this.moveY = -1;
            if (this.keys['KeyS'] || this.keys['ArrowDown']) this.moveY = 1;
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.moveX = -1;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) this.moveX = 1;

            // Normalize keyboard diagonal speed
            if (this.moveX !== 0 && this.moveY !== 0) {
                const len = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
                this.moveX /= len;
                this.moveY /= len;
            }

            // Touch movement overrides keyboard if active
            if (this.moveJoy.active) {
                this.moveX = this.moveJoy.x;
                this.moveY = this.moveJoy.y;
            }

            // Resolve Aiming (Mouse vs Touch)
            if (this.aimJoy.active) {
                this.isAiming = true;
            } else if (currentDevice === 'mobile') {
                this.isAiming = false;
            } else if (player && camera) {
                // Mouse coordinates relative to player center in world space
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const viewMouseX = this.mouse.rawX - rect.left;
                    const viewMouseY = this.mouse.rawY - rect.top;

                    // Convert view coords to world coords based on camera position and canvas sizing
                    const canvasW = canvas.width;
                    const canvasH = canvas.height;
                    const scaleX = rect.width / canvasW;
                    const scaleY = rect.height / canvasH;

                    const screenX = viewMouseX / scaleX;
                    const screenY = viewMouseY / scaleY;

                    const worldMouseX = screenX + camera.x - canvasW / 2;
                    const worldMouseY = screenY + camera.y - canvasH / 2;

                    const dx = worldMouseX - player.x;
                    const dy = worldMouseY - player.y;
                    
                    this.aimAngle = Math.atan2(dy, dx);
                    this.aimX = Math.cos(this.aimAngle);
                    this.aimY = Math.sin(this.aimAngle);
                    this.isAiming = true;
                }
            }
        }
    }

    // Reset temporary action triggers
    clearActions() {
        this.actions.reload = false;
        this.actions.interact = false;
        this.actions.heal = false;
        this.actions.eject = false;
        this.actions.weapon1 = false;
        this.actions.weapon2 = false;
        this.actions.weapon3 = false;
        this.actions.bumperLeft = false;
        this.actions.bumperRight = false;
    }
}
