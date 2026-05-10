/**
 * input.js — keyboard, touch joystick, and on-screen buttons
 * Mouse aim is handled by main.js via p5.mouseMoved → setMouseAim()
 */

import { gameState } from './state.js';

export const input = {
    moveX: 0,
    moveY: 0,
    aimX: 0,
    aimY: 0,
    shooting: false,
    superActive: false
};

const keys = {};
let joystickOrigin = null;
let joystickKnob   = null;
let joystickZone   = null;

export function setMouseAim(worldX, worldY) {
    input.aimX = worldX;
    input.aimY = worldY;
}

export function setupInputHandlers() {
    joystickZone = document.getElementById('joystickZone');
    joystickKnob = document.getElementById('joystickKnob');
    const attackButton = document.getElementById('attackButton');
    const superButton  = document.getElementById('superButton');

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup',   handleKeyUp);

    if (joystickZone) {
        joystickZone.addEventListener('touchstart', handleJoystickStart, { passive: false });
        joystickZone.addEventListener('touchmove',  handleJoystickMove,  { passive: false });
        joystickZone.addEventListener('touchend',   handleJoystickEnd,   { passive: false });
    }

    if (attackButton) {
        attackButton.addEventListener('touchstart', e => { e.preventDefault(); input.shooting = true; });
        attackButton.addEventListener('touchend',   e => { e.preventDefault(); input.shooting = false; });
        attackButton.addEventListener('mousedown',  () => input.shooting = true);
        attackButton.addEventListener('mouseup',    () => input.shooting = false);
    }

    if (superButton) {
        superButton.addEventListener('touchstart', e => { e.preventDefault(); input.superActive = true; });
        superButton.addEventListener('touchend',   e => { e.preventDefault(); input.superActive = false; });
        superButton.addEventListener('mousedown',  () => input.superActive = true);
        superButton.addEventListener('mouseup',    () => input.superActive = false);
    }
}

function handleKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    if (e.code  === 'Space')            input.shooting    = true;
    if (e.key.toLowerCase() === 'e')    input.superActive = true;
    
    // Escape key support
    if (e.key === 'Escape') {
        if (window.brawlGame) {
            if (gameState.running) {
                window.brawlGame.togglePauseMenu();
            } else {
                // If in a sub-screen, go back
                const screens = ['brawlerSelect', 'skinSelect', 'modeSelect', 'profile', 'leaderboard'];
                for (const s of screens) {
                    const el = document.getElementById(s + 'Screen');
                    if (el && !el.classList.contains('hidden')) {
                        // Find the back button in this screen and click it
                        const backBtn = el.querySelector('button.btn-primary:last-child, button.back-btn');
                        if (backBtn) backBtn.click();
                        break;
                    }
                }
            }
        }
    }
}

function handleKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
    if (e.code  === 'Space')            input.shooting    = false;
    if (e.key.toLowerCase() === 'e')    input.superActive = false;
}

function handleJoystickStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect  = joystickZone.getBoundingClientRect();
    joystickOrigin = { x: touch.clientX, y: touch.clientY };
    
    const base = document.querySelector('.joystick-base');
    if (base) {
        base.style.left = (touch.clientX - rect.left - 70) + 'px';
        base.style.top = (touch.clientY - rect.top - 70) + 'px';
        base.style.bottom = 'auto';
        base.classList.add('active');
    }
    
    updateJoystick(touch);
}

function handleJoystickMove(e) {
    e.preventDefault();
    updateJoystick(e.touches[0]);
}

function handleJoystickEnd(e) {
    e.preventDefault();
    input.moveX = 0;
    input.moveY = 0;
    if (joystickKnob) joystickKnob.style.transform = 'translate(-50%, -50%)';
    joystickOrigin = null;
    
    const base = document.querySelector('.joystick-base');
    if (base) {
        base.style.left = '25px';
        base.style.top = 'auto';
        base.style.bottom = '25px';
        base.classList.remove('active');
    }
}

function updateJoystick(touch) {
    if (!joystickOrigin || !joystickKnob) return;
    const dx    = touch.clientX - joystickOrigin.x;
    const dy    = touch.clientY - joystickOrigin.y;
    const dist  = Math.min(Math.hypot(dx, dy), 55);
    const angle = Math.atan2(dy, dx);
    joystickKnob.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;
    input.moveX = (dist / 55) * Math.cos(angle);
    input.moveY = (dist / 55) * Math.sin(angle);
}

export function updateKeyboardMovement() {
    if (joystickOrigin) return;
    input.moveX = 0;
    input.moveY = 0;
    if (keys['w'] || keys['arrowup'])    input.moveY = -1;
    if (keys['s'] || keys['arrowdown'])  input.moveY =  1;
    if (keys['a'] || keys['arrowleft'])  input.moveX = -1;
    if (keys['d'] || keys['arrowright']) input.moveX =  1;
    if (input.moveX !== 0 || input.moveY !== 0) {
        const len = Math.hypot(input.moveX, input.moveY);
        input.moveX /= len;
        input.moveY /= len;
    }
}
