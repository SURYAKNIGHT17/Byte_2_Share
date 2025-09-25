document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const progressBar = document.querySelector('.progress-bar');
    const loadingAnimation = document.querySelector('.loading-animation');
    const successAnimation = document.querySelector('.success-animation');
    const dragArea = document.querySelector('.drag-upload-container');
    const sliderHandle = document.querySelector('.upload-slider-handle');
    const uploadSlider = document.querySelector('.upload-slider-container');
    const selectedFileName = document.getElementById('selected-file-name');
    const selectedFileSize = document.getElementById('selected-file-size');
    const fileDisplay = document.querySelector('.file-display');
    const submitBtn = document.getElementById('submit-btn');
    const removeFileBtn = document.getElementById('remove-file');
    
    // Create audio element for explosion sound
    const explosionSound = document.getElementById('explosion-sound');
    
    // Check for dark mode preference
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
        document.body.classList.add('dark-mode');
        dragArea.classList.add('dark-mode');
    }
    
    // Initialize fireworks
    const fireworksContainer = document.querySelector('.fireworks-container');
    let fireworksInstance = new Fireworks(fireworksContainer);
    
    if (!uploadForm) return;
    
    // Make sure we have all the necessary elements
    
    // Format file size to human-readable format
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Clear file selection and reset UI
    function clearFileSelection() {
        fileInput.value = '';
        fileDisplay.classList.add('d-none');
        dragArea.classList.remove('file-selected');
        
        // Show the default drag text
        document.querySelector('.drag-title').classList.remove('d-none');
        document.querySelector('.drag-subtitle').classList.remove('d-none');
        document.querySelector('.btn-outline-primary').classList.remove('d-none');
    }
    
    // Handle file input change
    function handleFileInputChange() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // Display file name
            selectedFileName.textContent = file.name;
            
            // Display file size
            const fileSize = formatFileSize(file.size);
            selectedFileSize.textContent = fileSize;
            
            // Show file display and update container style
            fileDisplay.classList.remove('d-none');
            dragArea.classList.add('file-selected');
            
            // Hide the default drag text when file is selected
            document.querySelector('.drag-title').classList.add('d-none');
            document.querySelector('.drag-subtitle').classList.add('d-none');
            document.querySelector('.btn-outline-primary').classList.add('d-none');
        }
    }
    
    // Add event listeners
    fileInput.addEventListener('change', handleFileInputChange);
    
    // Add event listener for remove file button
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearFileSelection();
        });
    }
    // Remove duplicate event listener since we already have one defined above
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dragArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dragArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dragArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        dragArea.classList.remove('drag-over');
    }
    
    dragArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            fileInput.files = files;
            
            // Display file name
            selectedFileName.textContent = file.name;
            
            // Display file size
            const fileSize = formatFileSize(file.size);
            selectedFileSize.textContent = fileSize;
            
            // Show file display and update container style
            fileDisplay.classList.remove('d-none');
            dragArea.classList.add('file-selected');
            
            // Hide the default drag text when file is selected
            document.querySelector('.drag-title').classList.add('d-none');
            document.querySelector('.drag-subtitle').classList.add('d-none');
            document.querySelector('.btn-outline-primary').classList.add('d-none');
            
            // Add visual feedback for successful drop
            dragArea.classList.add('drop-success');
            setTimeout(() => {
                dragArea.classList.remove('drop-success');
            }, 1000);
        }
    }
    
    // Slider to upload functionality
    let isDragging = false;
    let startX = 0;
    let startLeft = 0;
    
    // Handle both mouse and touch start events
    sliderHandle.addEventListener('mousedown', startDragging);
    sliderHandle.addEventListener('touchstart', startDragging, { passive: false });
    
    function startDragging(e) {
        // Prevent default only for mouse events
        if (e.type !== 'touchstart') {
            e.preventDefault();
        }
        
        isDragging = true;
        
        // Add visual feedback
        sliderHandle.classList.add('dragging');
        uploadSlider.classList.add('active');
        
        // Record starting positions - handle both mouse and touch events
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startLeft = parseInt(window.getComputedStyle(sliderHandle).left);
        
        // Handle both mouse and touch move events
        document.addEventListener('mousemove', handleDragging);
        document.addEventListener('touchmove', handleDragging, { passive: false });
    }
    
    // Handle both mouse and touch movement
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('touchmove', function(e) {
        handleDragging(e.touches[0]);
        e.preventDefault(); // Prevent scrolling while dragging
    }, { passive: false });
    
    function handleDragging(e) {
        if (!isDragging) return;
        
        // Get mouse/touch position
        const clientX = e.type && e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        
        // Calculate new position
        const sliderRect = uploadSlider.getBoundingClientRect();
        const sliderWidth = sliderRect.width;
        const handleWidth = sliderHandle.offsetWidth;
        const maxLeft = sliderWidth - handleWidth;
        
        // Calculate left position relative to slider
        let newLeft = startLeft + (clientX - startX);
        
        // Constrain within slider bounds
        newLeft = Math.max(5, Math.min(newLeft, maxLeft - 5));
        
        // Update handle position
        sliderHandle.style.left = newLeft + 'px';
        
        // Update progress visual based on slider position
        const progress = (newLeft / maxLeft) * 100;
        uploadSlider.style.setProperty('--slider-progress', progress + '%');
        
        // Add visual feedback based on progress
        if (progress > 85) {
            uploadSlider.classList.add('almost-complete');
        } else {
            uploadSlider.classList.remove('almost-complete');
        }
        
        // If slider is dragged to the end, trigger upload
        if (newLeft >= maxLeft - 10) {
            if (fileInput.files.length > 0) {
                // Play explosion sound
                explosionSound.volume = 0.5; // Set volume to 50%
                explosionSound.currentTime = 0; // Reset sound to beginning
                explosionSound.play().catch(e => console.log('Audio playback error:', e));
                
                // Show fireworks animation
                showFireworksEffect();
                
                isDragging = false;
                sliderHandle.style.left = '5px'; // Reset slider
                submitBtn.click(); // Trigger form submission
            } else {
                alert('Please select a file first');
                sliderHandle.style.left = '5px'; // Reset slider
                isDragging = false;
            }
        }
    }
    
    // Handle both mouse and touch end events
    document.addEventListener('mouseup', endDragging);
    document.addEventListener('touchend', endDragging);
    
    // Remove event listeners when dragging ends
    function cleanupDragEvents() {
        document.removeEventListener('mousemove', handleDragging);
        document.removeEventListener('touchmove', handleDragging);
    }
    
    function endDragging() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Remove event listeners
        cleanupDragEvents();
        
        // Remove visual feedback
        sliderHandle.classList.remove('dragging');
        uploadSlider.classList.remove('active');
        uploadSlider.classList.remove('almost-complete');
        
        // Reset slider position if not at the end
        const sliderWidth = uploadSlider.offsetWidth;
        const handleWidth = sliderHandle.offsetWidth;
        const maxLeft = sliderWidth - handleWidth;
        const currentLeft = parseInt(window.getComputedStyle(sliderHandle).left);
        
        if (currentLeft < maxLeft - 10) {
            // Animate the slider back to start
            sliderHandle.style.transition = 'left 0.3s ease-out';
            sliderHandle.style.left = '5px';
            uploadSlider.style.setProperty('--slider-progress', '0%');
            
            // Remove transition after animation completes
            setTimeout(() => {
                sliderHandle.style.transition = '';
            }, 300);
        }
    }
    
    uploadForm.addEventListener('submit', function(e) {
        if (!fileInput.files.length) {
            alert("Please choose a file first.");
            e.preventDefault();
            return;
        }
        
        // Show loading animation
        loadingAnimation.style.display = 'block';
        successAnimation.style.display = 'none';
        
        let xhr = new XMLHttpRequest();
        let formData = new FormData(this);
        
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                let percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + "%";
                progressBar.textContent = percent + "%";
                
                // When upload is complete, show success animation
                if (percent === 100) {
                    setTimeout(function() {
                        loadingAnimation.style.display = 'none';
                        successAnimation.style.display = 'block';
                        successAnimation.classList.add('show-success');
                    }, 500);
                }
            }
        });
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                // Show success animation
                loadingAnimation.style.display = 'none';
                successAnimation.style.display = 'block';
                successAnimation.classList.add('show-success');
                
                // Add confetti effect
                showConfetti();
            }
        };
        
        xhr.open('POST', window.location.href, true);
        xhr.setRequestHeader('X-CSRFToken', document.querySelector('[name=csrfmiddlewaretoken]').value);
        xhr.send(formData);
        
        e.preventDefault();
    });
    
    // Add fun confetti effect
    function showConfetti() {
        for (let i = 0; i < 100; i++) {
            createConfetti();
        }
        
        // Also show fireworks for additional celebration
        showFireworksEffect();
        
        // Play explosion sound
        explosionSound.volume = 0.5;
        explosionSound.currentTime = 0;
        explosionSound.play().catch(e => console.log('Audio playback error:', e));
    }
    
    // Add fireworks effect
    function showFireworksEffect() {
        // If fireworks instance doesn't exist, create it
        if (!fireworksInstance) {
            fireworksInstance = new Fireworks(fireworksContainer);
        }
        
        // Make fireworks container visible
        fireworksContainer.style.display = 'block';
        
        // Start fireworks animation
        fireworksInstance.start(3000); // Run for 3 seconds
        
        // Hide fireworks container after animation completes
        setTimeout(() => {
            fireworksContainer.style.display = 'none';
        }, 3500);
    }
    
    function createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.top = '-10px';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.zIndex = '1000';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        
        document.body.appendChild(confetti);
        
        const animationDuration = Math.random() * 3 + 2;
        confetti.style.animation = `fall ${animationDuration}s linear forwards`;
        
        setTimeout(() => {
            confetti.remove();
        }, animationDuration * 1000);
    }
    
    // Add confetti animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(${window.innerHeight}px) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
