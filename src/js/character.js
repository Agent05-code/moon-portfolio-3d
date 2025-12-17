import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class MoonSurface {
    constructor(scene, world, textures) {
        this.scene = scene;
        this.world = world;
        this.textures = textures;
        
        this.mesh = null;
        this.body = null;
        
        this.createSurface();
        this.setupPhysics();
    }
    
    createSurface() {
        // Create moon surface geometry with height variation
        const geometry = new THREE.PlaneGeometry(50, 50, 128, 128);
        
        // Add height variation for craters
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            
            // Create simple crater pattern
            const distance = Math.sqrt(x * x + y * y);
            const height = Math.sin(distance * 0.1) * 0.5 + Math.random() * 0.3;
            positions[i + 2] = height;
        }
        
        geometry.computeVertexNormals();
        
        // Create material with artistic enhancement
        const material = new THREE.MeshStandardMaterial({
            map: this.textures.diffuse,
            normalMap: this.textures.normal,
            bumpMap: this.textures.bump,
            roughness: 0.8,
            metalness: 0.1,
            color: 0x8B9DC3, // Cool blue-gray
            emissive: 0x1A365D, // Subtle ground glow
            emissiveIntensity: 0.03
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = -5;
        this.mesh.receiveShadow = true;
        
        this.scene.add(this.mesh);
    }
    
    setupPhysics() {
        // Create physics ground
        const shape = new CANNON.Plane();
        this.body = new CANNON.Body({
            mass: 0, // Static
            shape: shape,
            material: new CANNON.Material('moon')
        });
        
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.body.position.set(0, -5, 0);
        
        this.world.add(this.body);
    }
}