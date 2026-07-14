const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
const slideIndicators = Array.from(document.querySelectorAll('.indicator'));
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

if (heroSlides.length) {
  showSlide(0);
  startSlider();
}
