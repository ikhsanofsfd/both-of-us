/**
 * SCRIPT PARTIKEL BUNGA SAKURA (Vanilla JS)
 * Membuat kelopak bunga yang jatuh dan bergerak secara acak.
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("sakura-particles-container");
  if (!container) return;

  const PETAL_COUNT = 90; // Jumlah total kelopak bunga
  const petals = [];

  // --- FUNGSI MEMBUAT KELOPAK ---
  function createPetal() {
    const petal = document.createElement("div");
    petal.className = "petal";

    // Posisi Awal Acak (Horizontal)
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * -200; // Mulai di atas viewport

    // Ukuran Acak
    const size = Math.random() * 10 + 10; // Ukuran 10px hingga 20px
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;

    // Kecepatan dan Arah Jatuh Acak
    const duration = Math.random() * 15 + 10; // Durasi jatuh 10s - 25s
    const swayStrength = Math.random() * 5 + 3; // Kekuatan goyangan horizontal 3px - 8px

    // Terapkan Gaya Awal
    petal.style.left = `${startX}px`;
    petal.style.top = `${startY}px`;
    petal.style.opacity = Math.random() * 0.5 + 0.75; // Opacity Acak

    // Terapkan Animasi Kecepatan (Rotasi dan Jatuh)
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${Math.random() * duration}s`; // Agar jatuhnya tidak bersamaan

    container.appendChild(petal);
    petals.push({
      element: petal,
      x: startX,
      y: startY,
      speed: Math.random() * 1.5 + 0.5, // Kecepatan vertikal 0.5 - 2.0
      sway: swayStrength,
      duration: duration * 1000, // konversi ke milidetik
    });
  }

  // --- INISIALISASI ---
  for (let i = 0; i < PETAL_COUNT; i++) {
    createPetal();
  }

  // --- FUNGSI ANIMASI PERGERAKAN ---
  let lastTime = 0;
  function updatePetals(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 16.66; // Faktor delta waktu untuk frame rate

    petals.forEach((petal) => {
      // Pergerakan Vertikal (Jatuh)
      petal.y += petal.speed * deltaTime;

      // Pergerakan Horizontal (Goyangan Angin Acak)
      // Menggunakan fungsi sinus untuk gerakan bolak-balik natural
      const timeFactor = (timestamp / 1000) * 0.2;
      const swayOffset =
        Math.sin(timeFactor + petal.duration / 1000) * petal.sway;
      petal.x += swayOffset * 0.05 * deltaTime;

      // Cek Batas Bawah (Looping)
      if (petal.y > window.innerHeight) {
        // Reset posisi ke atas saat mencapai batas bawah
        petal.y = -petal.element.offsetHeight;
        petal.x = Math.random() * window.innerWidth;
      }

      // Terapkan posisi baru ke DOM
      petal.element.style.top = `${petal.y}px`;
      petal.element.style.left = `${petal.x}px`;
    });

    lastTime = timestamp;
    requestAnimationFrame(updatePetals);
  }

  // Mulai loop animasi
  updatePetals(0);
});
