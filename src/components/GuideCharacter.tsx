import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import './GuideCharacter.css';

const GUIDE_MESSAGES = [
    "Welcome to my PC simulation! 💕",
    "Double-click icons to open apps~",
    "Try the VS Code to see some code!",
    "The browser has cool pages inside 🌐",
    "Don't forget to check out the games! 🎮",
    "You can drag windows around~",
    "Click me for more tips! ✨",
    "Follow me on Twitter @witchmillaa 🐦",
    "Hold 1M $KAWAI to play games! 💰",
];

const GuideCharacter: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState(GUIDE_MESSAGES[0]);
    const [showBubble, setShowBubble] = useState(true);
    const [messageIndex, setMessageIndex] = useState(0);

    const nextMessage = () => {
        const next = (messageIndex + 1) % GUIDE_MESSAGES.length;
        setMessageIndex(next);
        setMessage(GUIDE_MESSAGES[next]);
        setShowBubble(true);
    };

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        // Setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(250, 350);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(25, 250 / 350, 0.1, 20);
        camera.position.set(0, 1.3, 3);
        camera.lookAt(0, 1.2, 0);

        const scene = new THREE.Scene();

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(1, 1.5, 2);
        scene.add(mainLight);
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-1, 0.5, 1);
        scene.add(fillLight);
        const pinkLight = new THREE.DirectionalLight(0xff8fa3, 0.3);
        pinkLight.position.set(-1, 1, -1);
        scene.add(pinkLight);

        // State
        let vrm: VRM | null = null;
        let bones: { [key: string]: THREE.Object3D | null } = {};
        const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

        const onMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        // LookAt target
        const lookTarget = new THREE.Object3D();
        lookTarget.position.set(0, 1.4, 3);
        scene.add(lookTarget);

        // Load VRM
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        loader.load('/milla.vrm', (gltf) => {
            vrm = gltf.userData.vrm as VRM;
            if (!vrm) return;

            vrm.scene.position.set(0, -0.3, 0);
            scene.add(vrm.scene);

            // Setup lookAt for eyes
            if (vrm.lookAt) {
                vrm.lookAt.target = lookTarget;
            }

            // Happy expression
            vrm.expressionManager?.setValue('happy', 0.3);

            // Find ALL bones by traversing the scene
            vrm.scene.traverse((obj) => {
                // Store all objects that look like bones
                if (obj instanceof THREE.Bone || obj.type === 'Bone') {
                    bones[obj.name] = obj;
                    console.log('Bone:', obj.name);
                }
            });
            
            // Also log humanoid bone mapping if available
            if (vrm.humanoid) {
                console.log('=== VRM Humanoid Bones ===');
                const boneList = ['leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm', 'leftShoulder', 'rightShoulder'];
                boneList.forEach(boneName => {
                    const raw = vrm.humanoid?.getRawBoneNode(boneName as any);
                    const norm = vrm.humanoid?.getNormalizedBoneNode(boneName as any);
                    console.log(boneName, '- raw:', raw?.name, 'norm:', norm?.name);
                    if (raw) bones['raw_' + boneName] = raw;
                    if (norm) bones['norm_' + boneName] = norm;
                });
            }

            // Blink
            setInterval(() => {
                vrm?.expressionManager?.setValue('blink', 1);
                setTimeout(() => vrm?.expressionManager?.setValue('blink', 0), 100);
            }, 2500 + Math.random() * 2000);
        });

        // Animation
        const clock = new THREE.Clock();
        let t = 0;
        let frameId: number;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const dt = clock.getDelta();
            t += dt;

            // Smooth mouse
            mouse.sx += (mouse.x - mouse.sx) * 0.08;
            mouse.sy += (mouse.y - mouse.sy) * 0.08;

            if (vrm) {
                // Update look target for eyes
                lookTarget.position.x = mouse.sx * 2;
                lookTarget.position.y = 1.4 + mouse.sy * 0.5;

                // Update VRM first
                vrm.update(dt);

                // Get bones directly by their actual names
                const leftArm = bones['J_Bip_L_UpperArm'];
                const rightArm = bones['J_Bip_R_UpperArm'];
                const leftForearm = bones['J_Bip_L_LowerArm'];
                const rightForearm = bones['J_Bip_R_LowerArm'];
                const leftShoulder = bones['J_Bip_L_Shoulder'];
                const rightShoulder = bones['J_Bip_R_Shoulder'];
                const head = bones['J_Bip_C_Head'];
                const neck = bones['J_Bip_C_Neck'];
                const chest = bones['J_Bip_C_Chest'];
                const spine = bones['J_Bip_C_Spine'];

                // Arms down - flip the rotation direction
                if (leftArm) {
                    leftArm.rotation.z = -1.0 + Math.sin(t * 0.5) * 0.02;
                }
                if (rightArm) {
                    rightArm.rotation.z = 1.0 + Math.sin(t * 0.5 + 1) * 0.02;
                }
                if (leftForearm) {
                    leftForearm.rotation.z = -0.1;
                }
                if (rightForearm) {
                    rightForearm.rotation.z = 0.1;
                }

                // Head - follow cursor
                if (head) {
                    head.rotation.y = mouse.sx * 0.4;
                    head.rotation.x = -mouse.sy * 0.15;
                }

                // Neck
                if (neck) {
                    neck.rotation.y = mouse.sx * 0.15;
                }

                // Chest - breathing
                if (chest) {
                    chest.rotation.x = Math.sin(t * 1.5) * 0.01;
                }

                // Spine - subtle sway
                if (spine) {
                    spine.rotation.z = Math.sin(t * 0.4) * 0.008;
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('mousemove', onMouseMove);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Auto-hide bubble
    useEffect(() => {
        if (showBubble) {
            const timer = setTimeout(() => setShowBubble(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [showBubble, message]);

    // Auto cycle
    useEffect(() => {
        const interval = setInterval(() => {
            if (!showBubble) nextMessage();
        }, 15000);
        return () => clearInterval(interval);
    }, [showBubble, messageIndex]);

    return (
        <div className="guide-character" onClick={nextMessage}>
            {showBubble && (
                <div className="speech-bubble">
                    <span>{message}</span>
                    <div className="bubble-tail"></div>
                </div>
            )}
            <div ref={containerRef} className="character-canvas" />
            <div className="character-glow"></div>
        </div>
    );
};

export default GuideCharacter;
