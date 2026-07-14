const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
const slideIndicators = Array.from(document.querySelectorAll('.indicator'));
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
let currentSlide = 0;
let slideTimer;

function showSlide(index) {
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === index);
  });
  slideIndicators.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
  });
  currentSlide = index;
}

function startSlider() {
  if (heroSlides.length <= 1) return;
  slideTimer = setInterval(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    showSlide(next);
  }, 5000);
}

function resetSlider() {
  clearInterval(slideTimer);
  startSlider();
}

slideIndicators.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
    resetSlider();
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);

    const payload = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      message: formData.get('message') || ''
    };

    if (formStatus) {
      formStatus.textContent = 'Sending your message...';
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.ok) {
        contactForm.reset();
        if (formStatus) {
          formStatus.textContent = 'Message sent successfully!';
        }
      } else {
        if (formStatus) {
          formStatus.textContent = result.error || 'Unable to send message.';
        }
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = 'Network error. Please try again later.';
      }
    }
  });
}

if (heroSlides.length) {
  showSlide(0);
  startSlider();
}
