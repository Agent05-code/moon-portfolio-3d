import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -1.62, 0) // Moon gravity
        });
        
        this.setupWorld();
        this.createGround();
    }
    
    setupWorld() {
        // Configure physics world for moon environment
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.allowSleep = true;
        
        // Moon-specific physics materials
        this.moonMaterial = new CANNON.Material('moon');
        this.characterMaterial = new CANNON.Material('character');
        
        // Define contact materials
        const moonCharacterContact = new CANNON.ContactMaterial(
            this.moonMaterial,
            this.characterMaterial,
            {
                friction: 0.3,        // Low lunar friction
                restitution: 0.2,     // Low bounce
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );
        
        this.world.addContactMaterial(moonCharacterContact);
    }
    
    createGround() {
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0, // Static body
            shape: groundShape,
            material: this.moonMaterial
        });
        
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(groundBody);
        
        this.groundBody = groundBody;
    }
}