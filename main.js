// Main JavaScript functionality

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const contactForm = document.getElementById('contactForm');
const header = document.getElementById('header');

// Mobile Navigation Toggle
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Smooth Scrolling for Navigation Links
function smoothScrollTo(targetId) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Header Scroll Effect
function handleHeaderScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}

// Form Handling
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const formSuccess = document.getElementById('formSuccess');
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Validate form
    if (!validateForm(data)) {
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    
    try {
        // Send data to API
        const response = await fetch('tables/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                phone: data.phone,
                email: data.email,
                service: data.service,
                message: data.message,
                source: 'website',
                status: 'new'
            })
        });
        
        if (response.ok) {
            // Show success message
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // Send WhatsApp notification
            sendWhatsAppNotification(data);
            
            // Track conversion
            trackConversion('form_submission');
        } else {
            throw new Error('Erro ao enviar formulário');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Erro ao enviar formulário. Por favor, tente novamente.');
        
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Form Validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Telefone inválido');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Email inválido');
    }
    
    if (!data.service) {
        errors.push('Selecione um serviço de interesse');
    }
    
    if (!data.terms) {
        errors.push('Você deve concordar em receber comunicações');
    }
    
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    
    return true;
}

// Validation Helpers
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanedPhone);
}

// WhatsApp Notification
function sendWhatsAppNotification(data) {
    const message = `Novo lead do site!\n\nNome: ${data.name}\nTelefone: ${data.phone}\nEmail: ${data.email}\nServiço: ${getServiceName(data.service)}\nMensagem: ${data.message || 'Nenhuma mensagem'}`;
    
    const whatsappUrl = `https://wa.me/5521967801371?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab for clinic notification
    window.open(whatsappUrl, '_blank');
}

// Get Service Name
function getServiceName(service) {
    const services = {
        'preenchimento': 'Preenchimento Facial',
        'botox': 'Botox',
        'harmonizacao': 'Harmonização Orofacial',
        'consulta': 'Não sei - Preciso de avaliação'
    };
    return services[service] || service;
}

// Conversion Tracking
function trackConversion(event) {
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead');
    }
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'AW-123456789/abc123def456',
            'value': 1.0,
            'currency': 'BRL'
        });
    }
    
    // Custom event tracking
    console.log('Conversion tracked:', event);
}

// Intersection Observer for Animations
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .testimonial-card, .about-features .feature-item');
    animatedElements.forEach(el => observer.observe(el));
}

// Phone Input Mask
function setupPhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        if (value.length > 0) {
            if (value.length <= 2) {
                formattedValue = '(' + value;
            } else if (value.length <= 6) {
                formattedValue = '(' + value.substring(0, 2) + ') ' + value.substring(2);
            } else if (value.length <= 10) {
                formattedValue = '(' + value.substring(0, 2) + ') ' + value.substring(2, 6) + '-' + value.substring(6);
            } else {
                formattedValue = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
            }
        }
        
        e.target.value = formattedValue;
    });
}

// Auto-scroll to form on CTA click
function setupAutoScrollToForm() {
    const ctaButtons = document.querySelectorAll('a[href="#contact"]');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            setTimeout(() => {
                const contactSection = document.getElementById('contact');
                const nameInput = document.getElementById('name');
                
                if (contactSection && nameInput) {
                    nameInput.focus();
                }
            }, 500);
        });
    });
}

// Exit Intent Popup
function setupExitIntent() {
    let exitIntentShown = false;
    
    function showExitIntent() {
        if (exitIntentShown) return;
        
        // Simple exit intent - you could implement a modal here
        const message = 'Agende sua consulta gratuita agora e ganhe 10% de desconto no primeiro tratamento!';
        
        if (confirm(message + '\n\nDeseja agendar sua consulta agora?')) {
            smoothScrollTo('#contact');
        }
        
        exitIntentShown = true;
    }
    
    // Detect mouse leaving the page
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0) {
            showExitIntent();
        }
    });
    
    // Time-based trigger (30 seconds)
    setTimeout(() => {
        if (!exitIntentShown) {
            showExitIntent();
        }
    }, 30000);
}

// Social Media Share Buttons
function setupSocialShare() {
    const shareButtons = document.querySelectorAll('.social-share');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const url = window.location.href;
            const text = 'Conheça a Clínica Belleza - Especialistas em Harmonização Facial';
            
            if (button.classList.contains('share-whatsapp')) {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
            } else if (button.classList.contains('share-facebook')) {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            } else if (button.classList.contains('share-instagram')) {
                // Instagram doesn't allow direct sharing, show instructions
                alert('Compartilhe no Instagram Stories! Salve esta página e compartilhe com seus amigos.');
            }
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Navigation links smooth scrolling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            smoothScrollTo(targetId);
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Phone input mask
    setupPhoneMask();
    
    // Auto-scroll to form
    setupAutoScrollToForm();
    
    // Animations
    setupAnimations();
    
    // Exit intent
    setupExitIntent();
    
    // Social share
    setupSocialShare();
});

// Window resize handler
window.addEventListener('resize', function() {
    // Close mobile menu on resize if window is large
    if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
});

// Prevent default form submission on Enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// Console log for debugging
console.log('🌸 Clínica Belleza - Site carregado com sucesso!');
console.log('📱 WhatsApp: (11) 99999-9999');
console.log('🌐 Website: clínica de harmonização facial de alta conversão');