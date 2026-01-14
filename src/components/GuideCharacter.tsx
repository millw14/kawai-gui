import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin, VRMHumanBoneName } from '@pixiv/three-vrm';
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
    const [isWaving, setIsWaving] = useState(false);

    const nextMessage = () => {
        const next = (messageIndex + 1) % GUIDE_MESSAGES.length;
        setMessageIndex(next);
        setMessage(GUIDE_MESSAGES[next]);
        setShowBubble(true);
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 1000);
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(250, 350);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        containerRef.current.appendChild(renderer.domElement);

        // Camera - positioned for upper body view
        const camera = new THREE.PerspectiveCamera(25.0, 250 / 350, 0.1, 20.0);
        camera.position.set(0, 1.3, 3);

        // Scene
        const scene = new THREE.Scene();

        // Lights
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(1.0, 1.5, 2.0);
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-1.0, 0.5, 1.0);
        scene.add(fillLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        // Pink rim light for kawaii effect
        const rimLight = new THREE.DirectionalLight(0xff8fa3, 0.4);
        rimLight.position.set(-1, 1, -1);
        scene.add(rimLight);

        // VRM Loader
        let currentVrm: any = null;
        let waveAnimation = false;
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        // Mouse position
        const mouse = { x: 0, y: 0 };
        const targetLookAt = { x: 0, y: 0 };
        
        const onMouseMove = (event: MouseEvent) => {
            // Normalize mouse position relative to window
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        // Load VRM
        loader.load(
            '/milla.vrm',
            (gltf) => {
                const vrm = gltf.userData.vrm;
                if (!vrm) {
                    console.error('VRM not found in GLTF');
                    return;
                }

                // Position the model
                vrm.scene.position.set(0, -0.3, 0);
                vrm.scene.rotation.y = 0;
                scene.add(vrm.scene);
                currentVrm = vrm;

                console.log('VRM loaded successfully!', vrm);

                // Set initial happy expression
                if (vrm.expressionManager) {
                    vrm.expressionManager.setValue('happy', 0.3);
                }

                // Apply initial idle pose (not T-pose)
                applyIdlePose(vrm);

                // Auto-blink
                if (vrm.expressionManager) {
                    setInterval(() => {
                        vrm.expressionManager.setValue('blink', 1.0);
                        setTimeout(() => vrm.expressionManager.setValue('blink', 0.0), 120);
                    }, 3000 + Math.random() * 2000);
                }
            },
            (progress) => {
                console.log('Loading VRM...', (progress.loaded / progress.total * 100).toFixed(1) + '%');
            },
            (error) => {
                console.error('VRM load error:', error);
            }
        );

        // Apply a natural idle pose to avoid T-pose
        const applyIdlePose = (vrm: any) => {
            if (!vrm.humanoid) return;

            const setBoneRotation = (boneName: string, x: number, y: number, z: number) => {
                const bone = vrm.humanoid.getNormalizedBoneNode(boneName as VRMHumanBoneName);
                if (bone) {
                    bone.rotation.set(
                        THREE.MathUtils.degToRad(x),
                        THREE.MathUtils.degToRad(y),
                        THREE.MathUtils.degToRad(z)
                    );
                }
            };

            // Arms down and slightly forward (natural standing pose)
            setBoneRotation('leftUpperArm', 0, 0, 70);
            setBoneRotation('leftLowerArm', 0, 0, 5);
            setBoneRotation('rightUpperArm', 0, 0, -70);
            setBoneRotation('rightLowerArm', 0, 0, -5);

            // Slight head tilt
            setBoneRotation('head', 0, 0, 0);
            setBoneRotation('neck', 5, 0, 0);

            // Shoulders
            setBoneRotation('leftShoulder', 0, 0, 5);
            setBoneRotation('rightShoulder', 0, 0, -5);

            // Spine slightly curved
            setBoneRotation('spine', 2, 0, 0);
            setBoneRotation('chest', 3, 0, 0);
        };

        // Store original pose for animation
        const originalPose: { [key: string]: THREE.Euler } = {};

        // Animation loop
        const clock = new THREE.Clock();
        let time = 0;
        
        const animate = () => {
            requestAnimationFrame(animate);
            const deltaTime = clock.getDelta();
            time += deltaTime;

            if (currentVrm) {
                // Smooth mouse tracking
                targetLookAt.x += (mouse.x - targetLookAt.x) * 0.05;
                targetLookAt.y += (mouse.y - targetLookAt.y) * 0.05;

                if (currentVrm.humanoid) {
                    // Head follows mouse
                    const head = currentVrm.humanoid.getNormalizedBoneNode('head');
                    if (head) {
                        // Base rotation plus mouse tracking
                        const baseRotX = THREE.MathUtils.degToRad(5);
                        head.rotation.x = baseRotX + targetLookAt.y * 0.2;
                        head.rotation.y = targetLookAt.x * 0.4;
                        head.rotation.z = targetLookAt.x * 0.05;
                    }

                    // Eyes follow mouse more dramatically
                    const leftEye = currentVrm.humanoid.getNormalizedBoneNode('leftEye');
                    const rightEye = currentVrm.humanoid.getNormalizedBoneNode('rightEye');
                    if (leftEye && rightEye) {
                        leftEye.rotation.y = targetLookAt.x * 0.3;
                        leftEye.rotation.x = -targetLookAt.y * 0.2;
                        rightEye.rotation.y = targetLookAt.x * 0.3;
                        rightEye.rotation.x = -targetLookAt.y * 0.2;
                    }

                    // Breathing animation
                    const chest = currentVrm.humanoid.getNormalizedBoneNode('chest');
                    if (chest) {
                        const breathe = Math.sin(time * 1.5) * 0.01;
                        chest.rotation.x = THREE.MathUtils.degToRad(3) + breathe;
                    }

                    // Subtle body sway
                    const spine = currentVrm.humanoid.getNormalizedBoneNode('spine');
                    if (spine) {
                        spine.rotation.z = Math.sin(time * 0.5) * 0.02;
                    }

                    // Waving animation when clicked
                    if (waveAnimation) {
                        const rightUpperArm = currentVrm.humanoid.getNormalizedBoneNode('rightUpperArm');
                        const rightLowerArm = currentVrm.humanoid.getNormalizedBoneNode('rightLowerArm');
                        if (rightUpperArm && rightLowerArm) {
                            rightUpperArm.rotation.z = THREE.MathUtils.degToRad(-150);
                            rightUpperArm.rotation.x = Math.sin(time * 8) * 0.3;
                            rightLowerArm.rotation.z = THREE.MathUtils.degToRad(-30);
                        }
                    } else {
                        // Return to idle pose for arms
                        const rightUpperArm = currentVrm.humanoid.getNormalizedBoneNode('rightUpperArm');
                        const rightLowerArm = currentVrm.humanoid.getNormalizedBoneNode('rightLowerArm');
                        if (rightUpperArm && rightLowerArm) {
                            // Smooth return to idle
                            rightUpperArm.rotation.z = THREE.MathUtils.lerp(
                                rightUpperArm.rotation.z,
                                THREE.MathUtils.degToRad(-70),
                                0.1
                            );
                            rightLowerArm.rotation.z = THREE.MathUtils.lerp(
                                rightLowerArm.rotation.z,
                                THREE.MathUtils.degToRad(-5),
                                0.1
                            );
                        }
                    }

                    // Hand gesture - slight finger movements
                    const leftHand = currentVrm.humanoid.getNormalizedBoneNode('leftHand');
                    const rightHand = currentVrm.humanoid.getNormalizedBoneNode('rightHand');
                    if (leftHand) leftHand.rotation.z = Math.sin(time * 0.8) * 0.05;
                    if (rightHand) rightHand.rotation.z = Math.sin(time * 0.8 + 1) * 0.05;
                }

                currentVrm.update(deltaTime);
            }

            renderer.render(scene, camera);
        };
        animate();

        // Handle wave trigger from React state
        const handleWaveEvent = () => {
            waveAnimation = true;
            setTimeout(() => { waveAnimation = false; }, 1000);
        };

        // Store the handler so we can trigger it from React
        (window as any).__triggerWave = handleWaveEvent;

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            delete (window as any).__triggerWave;
            renderer.dispose();
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Trigger wave animation
    useEffect(() => {
        if (isWaving && (window as any).__triggerWave) {
            (window as any).__triggerWave();
        }
    }, [isWaving]);

    // Auto-hide bubble after delay
    useEffect(() => {
        if (showBubble) {
            const timer = setTimeout(() => setShowBubble(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [showBubble, message]);

    // Auto cycle messages occasionally
    useEffect(() => {
        const interval = setInterval(() => {
            if (!showBubble) {
                nextMessage();
            }
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
            <div className="click-hint">💬 Click me!</div>
        </div>
    );
};

export default GuideCharacter;
