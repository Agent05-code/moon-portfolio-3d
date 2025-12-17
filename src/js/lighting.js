import * as THREE from 'three';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        
        this.setupLighting();
    }
    
    setupLighting() {
        // Ambient light (subtle space ambiance)
        this.lights.ambient = new THREE.HemisphereLight(
            0x4299e1, // Sky color (cool blue)
            0x1a202c, // Ground color (deep space purple)
            0.2
        );
        this.scene.add(this.lights.ambient);
        
        // Main directional light (sun)
        this.lights.sun = new THREE.DirectionalLight(0xffffff, 2.5);
        this.lights.sun.position.set(-50, 30, 25);
        this.lights.sun.castShadow = true;
        
        // Configure shadows for dramatic effect
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 200;
        this.lights.sun.shadow.camera.left = -50;
        this.lights.sun.shadow.camera.right = 50;
        this.lights.sun.shadow.camera.top = 50;
        this.lights.sun.shadow.camera.bottom = -50;
        this.lights.sun.shadow.bias = -0.0001;
        
        this.scene.add(this.lights.sun);
        
        // Rim light for dramatic effect
        this.lights.rim = new THREE.DirectionalLight(0x4299e1, 1.2);
        this.lights.rim.position.set(30, 10, -20);
        this.scene.add(this.lights.rim);
        
        // Fill light (soft purple)
        this.lights.fill = new THREE.DirectionalLight(0x805ad5, 0.3);
        this.lights.fill.position.set(0, -10, 15);
        this.scene.add(this.lights.fill);
        
        console.log('✅ Lighting system initialized');
    }
}