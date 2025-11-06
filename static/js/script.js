document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('prediction-form');
    const resultContent = document.getElementById('result-content');
    const resultPlaceholder = document.getElementById('result-placeholder');
    const resultTitle = document.getElementById('result-title');
    const probabilityFill = document.getElementById('probability-fill');
    const probabilityText = document.getElementById('probability-text');
    const resultMessage = document.getElementById('result-message');
    const loadingOverlay = document.getElementById('loading-overlay');
    const titanicShip = document.getElementById('titanic-ship');
    const survivalChance = document.getElementById('survival-chance');
    const predictionResult = document.getElementById('prediction-result');
    const resultSection = document.querySelector('.result-section'); // Nuevo: para el scroll

    // Sistema de audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let sounds = {};
    let isMuted = false;
    let globalVolume = 0.7;

    // Controles de audio
    const muteBtn = document.getElementById('muteToggle');
    const volumePopup = document.getElementById('volumePopup');
    const volumeSlider = document.getElementById('globalVolume');

    // Inicializar controles de audio
    function initAudioControls() {
        // Toggle mute
        muteBtn.addEventListener('click', function() {
            isMuted = !isMuted;
            muteBtn.textContent = isMuted ? '🔈' : '🔊';
            muteBtn.classList.toggle('muted', isMuted);
            
            if (isMuted) {
                globalVolume = 0;
            } else {
                globalVolume = volumeSlider.value / 100;
            }
            
            playSound('click');
        });
        
        // Mostrar/ocultar control de volumen
        muteBtn.addEventListener('mouseenter', function() {
            volumePopup.classList.add('show');
        });
        
        muteBtn.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!volumePopup.matches(':hover')) {
                    volumePopup.classList.remove('show');
                }
            }, 300);
        });
        
        volumePopup.addEventListener('mouseenter', function() {
            volumePopup.classList.add('show');
        });
        
        volumePopup.addEventListener('mouseleave', function() {
            volumePopup.classList.remove('show');
        });
        
        // Control de volumen
        volumeSlider.addEventListener('input', function(e) {
            globalVolume = e.target.value / 100;
            isMuted = globalVolume === 0;
            muteBtn.textContent = isMuted ? '🔈' : '🔊';
            muteBtn.classList.toggle('muted', isMuted);
            playSound('click');
        });
    }

    // Cargar sonidos
    async function loadSounds() {
        try {
            // Sonido de click/botón
            sounds.click = createBeepSound(800, 0.1);
            
            // Sonido de éxito
            sounds.success = createSuccessSound();
            
            // Sonido de fracaso
            sounds.failure = createFailureSound();
            
            // Sonido de olas del mar
            sounds.ocean = createOceanSound();
            
            // Sonido de sirena de barco
            sounds.horn = createHornSound();
            
            console.log('🎵 Sonidos cargados correctamente');
        } catch (error) {
            console.log('🔇 Audio no disponible:', error);
        }
    }

    // Función para crear sonido de beep
    function createBeepSound(frequency, duration) {
        return function() {
            if (isMuted) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3 * globalVolume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }

    // Sonido de éxito
    function createSuccessSound() {
        return function() {
            if (isMuted) return;
            
            const frequencies = [523.25, 659.25, 783.99, 1046.50];
            const now = audioContext.currentTime;
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0, now + index * 0.1);
                gainNode.gain.linearRampToValueAtTime(0.2 * globalVolume, now + index * 0.1 + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.3);
                
                oscillator.start(now + index * 0.1);
                oscillator.stop(now + index * 0.1 + 0.3);
            });
        };
    }

    // Sonido de fracaso
    function createFailureSound() {
        return function() {
            if (isMuted) return;
            
            const frequencies = [523.25, 392.00, 293.66, 220.00];
            const now = audioContext.currentTime;
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0.3 * globalVolume, now + index * 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.5);
                
                oscillator.start(now + index * 0.15);
                oscillator.stop(now + index * 0.15 + 0.5);
            });
        };
    }

    // Sonido de olas del mar
    function createOceanSound() {
        return function() {
            if (isMuted) return null;
            
            const bufferSize = 2 * audioContext.sampleRate;
            const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const whiteNoise = audioContext.createBufferSource();
            const bandpass = audioContext.createBiquadFilter();
            const gainNode = audioContext.createGain();
            
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;
            
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 200;
            bandpass.Q.value = 1;
            
            gainNode.gain.value = 0.1 * globalVolume;
            
            whiteNoise.connect(bandpass);
            bandpass.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            whiteNoise.start();
            
            setTimeout(() => {
                whiteNoise.stop();
            }, 3000);
            
            return whiteNoise;
        };
    }

    // Sonido de sirena de barco
    function createHornSound() {
        return function() {
            if (isMuted) return;
            
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator1.frequency.value = 220;
            oscillator2.frequency.value = 224;
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3 * globalVolume, audioContext.currentTime + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
            
            oscillator1.start();
            oscillator2.start();
            oscillator1.stop(audioContext.currentTime + 3);
            oscillator2.stop(audioContext.currentTime + 3);
        };
    }

    // Sonido de burbujas para hundimiento
    function createBubbleSound() {
        if (isMuted) return;
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 200 - (i * 30);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.2 * globalVolume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            }, i * 300);
        }
    }

    // Función para reproducir sonido
    function playSound(soundName) {
        if (sounds[soundName] && audioContext.state === 'running') {
            try {
                sounds[soundName]();
            } catch (error) {
                console.log('Error reproduciendo sonido:', error);
            }
        }
    }

    // Función para hacer scroll suave a una sección
    function smoothScrollToElement(element, offset = 20) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Inicializar sistema de audio
    function initAudio() {
        initAudioControls();
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Cargar sonidos después de la interacción del usuario
        document.addEventListener('click', function initAudioOnClick() {
            loadSounds();
            playSound('click');
            document.removeEventListener('click', initAudioOnClick);
        }, { once: true });
    }

    // Efectos de sonido en interacciones
    function initSoundInteractions() {
        document.querySelectorAll('input, select, button').forEach(element => {
            element.addEventListener('mouseenter', () => {
                playSound('click');
            });
            
            element.addEventListener('focus', () => {
                playSound('click');
            });
        });
    }

    // Inicializar audio cuando la página carga
    initAudio();
    initSoundInteractions();

    // Sonido al enviar formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        playSound('click');
        playSound('horn');
        
        loadingOverlay.classList.remove('hidden');
        
        const formData = new FormData(form);
        const data = {
            Pclass: parseInt(formData.get('Pclass')),
            Age: parseInt(formData.get('Age')),
            Fare: parseFloat(formData.get('Fare')),
            Sex_male: parseInt(formData.get('Sex_male'))
        };

        try {
            const response = await fetch('/predict/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                playSound('ocean');
                setTimeout(() => {
                    displayResult(result, data);
                    animateShip(result.probability);
                    // Hacer scroll a los resultados después de mostrarlos
                    setTimeout(() => {
                        smoothScrollToElement(resultSection, 50);
                    }, 800);
                }, 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            // Modo demo si hay error
            const demoResult = generateDemoResult(data);
            
            playSound('ocean');
            setTimeout(() => {
                displayResult(demoResult, data);
                animateShip(demoResult.probability);
                // Hacer scroll a los resultados después de mostrarlos
                setTimeout(() => {
                    smoothScrollToElement(resultSection, 50);
                }, 800);
            }, 1000);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });

    function generateDemoResult(data) {
        // Simulación basada en datos históricos reales
        let baseProbability = 50;
        
        // Factores históricos
        if (data.Sex_male === 0) baseProbability += 30; // Mujeres
        if (data.Pclass === 1) baseProbability += 20;   // Primera clase
        if (data.Pclass === 3) baseProbability -= 25;   // Tercera clase
        if (data.Age < 16) baseProbability += 15;       // Niños
        if (data.Age > 50) baseProbability -= 10;       // Mayores
        if (data.Fare > 100) baseProbability += 10;     // Boletos caros
        
        // Aleatoriedad
        const randomFactor = Math.random() * 20 - 10;
        baseProbability += randomFactor;
        
        // Asegurar rango
        baseProbability = Math.max(5, Math.min(95, baseProbability));
        
        const survived = baseProbability >= 50;
        
        return {
            prediction: survived ? "Sobrevivió" : "No sobrevivió",
            probability: Math.round(baseProbability * 10) / 10,
            demo: true
        };
    }

    function displayResult(result, userData) {
        resultPlaceholder.classList.add('hidden');
        resultContent.classList.remove('hidden');
        
        const survived = result.prediction === "Sobrevivió";
        const probability = result.probability;
        
        // Reproducir sonido según resultado
        if (survived) {
            playSound('success');
        } else {
            playSound('failure');
        }
        
        // Actualizar elementos
        resultTitle.textContent = survived ? "🎉 ¡Sobreviviste!" : "💀 No Sobreviviste";
        resultTitle.className = survived ? 'survived' : 'not-survived';
        
        probabilityText.textContent = `${probability}%`;
        survivalChance.textContent = `${probability}%`;
        predictionResult.textContent = survived ? "✅ Sobrevivió" : "❌ No Sobrevivió";
        
        // Animar barra de probabilidad con sonido de progreso
        animateProbabilityBar(probability, survived);
        
        // Mensaje contextual detallado
        let message = '';
        if (survived) {
            message = `¡Increíble! Con una probabilidad del <strong>${probability}%</strong>, habrías sido uno de los <strong>705 supervivientes</strong>. `;
        } else {
            message = `Lamentablemente, con una probabilidad del <strong>${probability}%</strong>, habrías estado entre los <strong>1,502 fallecidos</strong>. `;
        }
        
        // Agregar contexto histórico
        message += getHistoricalContext(userData, survived);
        
        if (result.demo) {
            message += `<br><small><em>⚠️ Modo demostración - usando datos históricos simulados</em></small>`;
        }
        
        resultMessage.innerHTML = message;
        resultMessage.className = `result-message ${survived ? 'survived' : 'not-survived'}`;
        
        // Animación de celebración o luto
        if (survived) {
            resultContent.classList.add('celebrate');
            setTimeout(() => {
                resultContent.classList.remove('celebrate');
            }, 1500);
        }
        
        // Animación de entrada
        resultContent.style.opacity = '0';
        resultContent.style.transform = 'translateY(20px)';
        resultContent.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            resultContent.style.opacity = '1';
            resultContent.style.transform = 'translateY(0)';
        }, 100);
    }

    function animateProbabilityBar(targetProbability, survived) {
        let currentProbability = 0;
        const increment = targetProbability / 50;
        const interval = 30;
        
        const intervalId = setInterval(() => {
            currentProbability += increment;
            
            if (currentProbability >= targetProbability) {
                currentProbability = targetProbability;
                clearInterval(intervalId);
            }
            
            probabilityFill.style.width = `${currentProbability}%`;
            probabilityText.textContent = `${Math.round(currentProbability)}%`;
            
            // Sonido de progreso (beep cada 10%)
            if (Math.round(currentProbability) % 10 === 0) {
                playSound('click');
            }
        }, interval);
    }

    function getHistoricalContext(userData, survived) {
        let context = '';
        
        if (userData.Sex_male === 0) {
            context += "Las mujeres tuvieron una tasa de supervivencia del 74%. ";
        } else {
            context += "Los hombres tuvieron una tasa de supervivencia del 20%. ";
        }
        
        if (userData.Pclass === 1) {
            context += "La primera clase tuvo la mayor tasa de supervivencia (63%).";
        } else if (userData.Pclass === 2) {
            context += "La segunda clase tuvo una tasa de supervivencia del 43%.";
        } else {
            context += "La tercera clase tuvo la menor tasa de supervivencia (25%).";
        }
        
        if (userData.Age < 16) {
            context += " Los niños tuvieron prioridad en los botes salvavidas.";
        }
        
        return context;
    }

    function animateShip(probability) {
        const survived = probability >= 50;
        
        if (survived) {
            // Barco navegando exitosamente
            titanicShip.style.animation = 'gentle-float 8s ease-in-out infinite';
            playSound('horn');
        } else {
            // Barco hundiéndose
            titanicShip.style.animation = 'sink 4s ease-in forwards';
            createBubbleSound();
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Efectos de entrada inicial con sonido
    setTimeout(() => {
        document.querySelector('.form-card').style.opacity = '1';
        document.querySelector('.form-card').style.transform = 'translateY(0)';
        playSound('click');
    }, 200);
    
    setTimeout(() => {
        document.querySelector('.ship-container').style.opacity = '1';
        document.querySelector('.ship-container').style.transform = 'translateY(0)';
        playSound('ocean');
    }, 400);
    
    setTimeout(() => {
        document.querySelector('.result-card').style.opacity = '1';
        document.querySelector('.result-card').style.transform = 'translateY(0)';
        playSound('click');
    }, 600);

    // Cerrar popup de volumen al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!muteBtn.contains(e.target) && !volumePopup.contains(e.target)) {
            volumePopup.classList.remove('show');
        }
    });

    // Efectos de hover mejorados para todos los botones
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Botón para volver al formulario (opcional, puedes agregarlo al HTML si quieres)
    function addBackToFormButton() {
        const backButton = document.createElement('button');
        backButton.innerHTML = '↺ Hacer otra predicción';
        backButton.className = 'predict-btn';
        backButton.style.marginTop = '1rem';
        backButton.style.display = 'none';
        backButton.id = 'back-to-form';
        
        backButton.addEventListener('click', function() {
            smoothScrollToElement(form, 50);
            playSound('click');
        });
        
        resultContent.appendChild(backButton);
        
        // Mostrar el botón cuando se muestren los resultados
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (!resultContent.classList.contains('hidden')) {
                        setTimeout(() => {
                            backButton.style.display = 'block';
                            backButton.style.opacity = '0';
                            backButton.style.transform = 'translateY(20px)';
                            backButton.style.transition = 'all 0.5s ease';
                            
                            setTimeout(() => {
                                backButton.style.opacity = '1';
                                backButton.style.transform = 'translateY(0)';
                            }, 100);
                        }, 1500);
                    } else {
                        backButton.style.display = 'none';
                    }
                }
            });
        });
        
        observer.observe(resultContent, { attributes: true });
    }

    // Inicializar botón de volver al formulario
    addBackToFormButton();
});