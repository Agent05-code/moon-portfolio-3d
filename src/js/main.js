// Main application entry point
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TWEEN } from '@tweenjs/tween.js';

// Import our modules
import { MoonSurface } from './moon-surface.js';
import { Character } from './character.js';
import { LightingSystem } from './lighting.js';
import { PhysicsWorld } from './physics.js';

class MoonPortfolio {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        
        this.moonSurface = null;
        this.character = null;
        this.lighting = null;
        this.physics = null;
        
        this.clock = new THREE.Clock();
        this.loadingManager = new THREE.LoadingManager();
        
        this.isLoaded = false;
        this.isWalking = false;
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };
        
        this.init();
    }
    
    async init() {
        console.log('🌙 Initializing Moon Portfolio 3D...');
        
        this.setupLoadingManager();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupPhysics();
        this.setupEventListeners();
        
        await this.loadAssets();
        this.setupWorld();
        this.setupUI();
        
        this.startRenderLoop();
        this.hideLoadingScreen();
    }
    
    setupLoadingManager() {
        this.loadingManager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            document.querySelector('.loading-progress').style.width = `${progress}%`;
            console.log(`Loading: ${url} (${loaded}/${total})`);
        };
        
        this.loadingManager.onLoad = () => {
            console.log('✅ All assets loaded');
            this.isLoaded = true;
        };
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a202c, 50, 200);
        
        // Set background gradient
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        
        const gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#1a202c');
        gradient.addColorStop(0.5, '#2d3748');
        gradient.addColorStop(1, '#4a5568');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        const canvas = document.getElementById('moon-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    setupPhysics() {
        this.physics = new PhysicsWorld();
        this.world = this.physics.world;
    }
    
    async loadAssets() {
        console.log('📦 Loading assets...');
        
        // Texture loader
        const textureLoader = new THREE.TextureLoader(this.loadingManager);
        
        // Load moon textures (we'll create these)
        this.moonTextures = {
            diffuse: await textureLoader.loadAsync('src/assets/textures/moon-diffuse.jpg'),
            normal: await textureLoader.loadAsync('src/assets/textures/moon-normal.jpg'),
            bump: await textureLoader.loadAsync('src/assets/textures/moon-bump.jpg')
        };
        
        // Apply texture settings
        Object.values(this.moonTextures).forEach(texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
        });
        
        console.log('✅ Textures loaded');
    }
    
    setupWorld() {
        console.log('🌍 Setting up 3D world...');
        
        // Create moon surface
        this.moonSurface = new MoonSurface(this.scene, this.world, this.moonTextures);
        
        // Create lighting system
        this.lighting = new LightingSystem(this.scene);
        
        // Create character
        this.character = new Character(this.scene, this.world, {
            position: new THREE.Vector3(0, -3, 0)
        });
        
        // Create starfield
        this.createStarfield();
        
        console.log('✅ World setup complete');
    }
    
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 8000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 400;
            positions[i + 1] = Math.random() * 200 + 50;
            positions[i + 2] = (Math.random() - 0.5) * 400;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xebf8ff,
            size: 1.5,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        
        this.stars = stars;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Mouse controls
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // UI interactions
        this.setupUIListeners();
    }
    
    setupUIListeners() {
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showPortfolioSection(section);
            });
        });
    }
    
    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                event.preventDefault();
                break;
        }
    }
    
    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (this.character) {
            this.character.handleMouseMovement(event);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    showPortfolioSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.add('hidden'));
        
        // Show selected section
        const selectedSection = document.getElementById(`${sectionName}-section`);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
            selectedSection.classList.add('fade-in');
        }
        
        // Update active button
        const buttons = document.querySelectorAll('.nav-button');
        buttons.forEach(button => button.classList.remove('active'));
        event.target.classList.add('active');
    }
    
    setupUI() {
        console.log('🎨 Setting up UI...');
        
        // Show UI after loading
        setTimeout(() => {
            document.getElementById('ui-overlay').classList.remove('hidden');
        }, 1000);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    updatePhysics(deltaTime) {
        if (this.world) {
            this.world.step(deltaTime);
        }
        
        if (this.character) {
            this.character.update(this.keys, deltaTime);
        }
    }
    
    updateCamera() {
        if (this.character) {
            // Smooth camera following
            const characterPosition = this.character.getPosition();
            const desiredPosition = new THREE.Vector3(
                characterPosition.x,
                characterPosition.y + 5,
                characterPosition.z + 10
            );
            
            this.camera.position.lerp(desiredPosition, 0.05);
            this.camera.lookAt(characterPosition);
        }
    }
    
    updateStars(deltaTime) {
        if (this.stars) {
            // Subtle star rotation
            this.stars.rotation.y += deltaTime * 0.0001;
        }
    }
    
    startRenderLoop() {
        console.log('🔄 Starting render loop...');
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            const deltaTime = this.clock.getDelta();
            
            // Update physics
            this.updatePhysics(deltaTime);
            
            // Update camera
            this.updateCamera();
            
            // Update stars
            this.updateStars(deltaTime);
            
            // Update TWEEN
            TWEEN.update();
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Moon Portfolio 3D...');
    new MoonPortfolio();
});