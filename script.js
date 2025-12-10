document.addEventListener("DOMContentLoaded", () => {
  AOS.init({
    duration: 1000,
    once: true,
  });

  // KONFIGURASI GSAP (10 Posisi: Simetris Kiri-Kanan + Kedalaman Vertikal Maksimal)
  // P10 digeser ke bawah (y: 10) agar bayangan kartu di belakang (y negatif) terlihat di atas.
  // =======================================
  const TRANSFORM_STYLES = [
    // P1: Paling Belakang KIRI (Jauh)
    { rotation: -12, x: -200, y: -60, scale: 0.8, opacity: 0.6, zIndex: 1 },
    // P2: KIRI Jauh
    { rotation: -8, x: -140, y: -50, scale: 0.83, opacity: 0.65, zIndex: 2 },
    // P3: KIRI Tengah
    { rotation: -4, x: -80, y: -40, scale: 0.86, opacity: 0.7, zIndex: 3 },
    // P4: KIRI Dekat
    { rotation: -2, x: -30, y: -30, scale: 0.89, opacity: 0.75, zIndex: 4 },

    // P5: KIRI Paling Dekat
    { rotation: -1, x: -10, y: -20, scale: 0.92, opacity: 0.8, zIndex: 5 },
    // P6: KANAN Paling Dekat
    { rotation: 1, x: 10, y: -20, scale: 0.92, opacity: 0.8, zIndex: 6 },

    // P7: KANAN Dekat
    { rotation: 2, x: 30, y: -30, scale: 0.89, opacity: 0.75, zIndex: 7 },
    // P8: KANAN Tengah
    { rotation: 4, x: 80, y: -40, scale: 0.86, opacity: 0.7, zIndex: 8 },
    // P9: KANAN Jauh
    { rotation: 8, x: 140, y: -50, scale: 0.83, opacity: 0.65, zIndex: 9 },

    // P10: Paling Depan/Aktif (Lurus) - Digeser 10px ke bawah untuk mengungkap bayangan
    { rotation: 0, x: 0, y: 10, scale: 0.98, opacity: 1, zIndex: 10 },
  ];

  const MAX_STACK_POSITIONS = TRANSFORM_STYLES.length; // 10

  const OUT_OF_VIEW_STYLE = {
    rotation: 0,
    x: 0,
    y: 0,
    scale: 0.7,
    opacity: 0,
    zIndex: 0,
  };

  const EASE_TYPE = "power3.out";
  const ANIMATION_DURATION = 0.5;

  // =======================================
  // LOGIKA CARD STACK GALLERY
  // =======================================

  const albumStackContainer = document.querySelector(
    ".photo-card-stack-container"
  );

  if (albumStackContainer && typeof gsap !== "undefined") {
    const allCards = Array.from(
      document.querySelectorAll(".photo-card-stack-container .stack-card")
    ).reverse();
    const totalCards = allCards.length;

    // Ambil elemen-elemen Kontrol dan Modal
    const modal = document.getElementById("photo-modal");
    const modalImage = document.getElementById("modal-image");
    const captionText = document.getElementById("caption-text");
    const closeBtn = document.querySelector(".close-btn");
    const prevModalBtn = document.querySelector(".prev-btn");
    const nextModalBtn = document.querySelector(".next-btn");
    const prevAlbumBtns = document.querySelectorAll(
      "#prev-btn, #prev-btn-desktop"
    );
    const nextAlbumBtns = document.querySelectorAll(
      "#next-btn, #next-btn-desktop"
    );
    const cardCounter = document.getElementById("card-counter");

    // Inisialisasi data Modal Foto
    let photos = allCards
      .map((card) => ({
        path: card.getAttribute("data-photo-path"),
        caption: card.getAttribute("data-caption"),
      }))
      .reverse();

    let currentActiveCardIndex = 0;

    // -------------------------------------
    // FUNGSI INTI GSAP UNTUK MEMPERBARUI TAMPILAN STACK
    // -------------------------------------
    function updateStackView(isAnimated = true) {
      allCards.forEach((card, index) => {
        let styleIndex =
          index - (currentActiveCardIndex - (MAX_STACK_POSITIONS - 1));

        let style = OUT_OF_VIEW_STYLE;

        if (styleIndex >= 0 && styleIndex < MAX_STACK_POSITIONS) {
          style = TRANSFORM_STYLES[styleIndex];
        } else if (styleIndex < 0) {
          style = TRANSFORM_STYLES[0];
        }

        // Set Absolute: left: 50% dan xPercent: -50 untuk pemusatan mutlak
        gsap.set(card, {
          zIndex: style.zIndex,
          left: "50%",
          xPercent: -50,
        });

        // Animasi Transisi ke posisi baru
        gsap.to(card, {
          x: style.x,
          y: style.y,
          rotation: style.rotation,
          scale: style.scale,
          opacity: style.opacity,
          duration: isAnimated ? ANIMATION_DURATION : 0,
          ease: isAnimated ? EASE_TYPE : "none",
          overwrite: "auto",
        });
      });

      // Update Counter dan Tombol
      const currentCardNumber = currentActiveCardIndex + 1;
      if (cardCounter) {
        cardCounter.textContent = `${currentCardNumber} / ${totalCards}`;
      }

      prevAlbumBtns.forEach((btn) =>
        btn.classList.toggle("disabled", currentCardNumber === 1)
      );
      nextAlbumBtns.forEach((btn) =>
        btn.classList.toggle("disabled", currentCardNumber === totalCards)
      );
    }

    // -------------------------------------
    // FUNGSI GESER
    // -------------------------------------

    function swipeNext() {
      if (currentActiveCardIndex === totalCards - 1) return;

      const swipedCard = allCards[currentActiveCardIndex];

      // Animasi Buang Kartu (Swipe Out)
      gsap.to(swipedCard, {
        x: -300,
        rotation: -10,
        scale: 0.8,
        opacity: 0,
        duration: ANIMATION_DURATION,
        ease: "power2.in",
        zIndex: TRANSFORM_STYLES[0].zIndex,
        onComplete: () => {
          // Reset posisi x dan y
          gsap.set(swipedCard, { x: 0, y: 0, rotation: 0 });
        },
      });

      currentActiveCardIndex++;
      updateStackView(true);
    }

    function swipePrev() {
      if (currentActiveCardIndex === 0) return;

      currentActiveCardIndex--;
      updateStackView(true);
    }

    // -------------------------------------
    // INISIALISASI & EVENT LISTENERS
    // -------------------------------------

    updateStackView(false);

    prevAlbumBtns.forEach((btn) => btn.addEventListener("click", swipePrev));
    nextAlbumBtns.forEach((btn) => btn.addEventListener("click", swipeNext));

    // Modal Logic (Open)
    albumStackContainer.addEventListener("click", (event) => {
      let target = event.target.closest(".stack-card");
      if (target) {
        const clickedCardIndex = allCards.indexOf(target);

        if (clickedCardIndex === currentActiveCardIndex) {
          openModal(clickedCardIndex);
        } else {
          currentActiveCardIndex = clickedCardIndex;
          updateStackView(true);
        }
      }
    });

    // -------------------------------------
    // FUNGSI MODAL
    // -------------------------------------

    let currentPhotoIndex = 0;

    function openModal(index) {
      currentPhotoIndex = index;
      modalImage.src = photos[currentPhotoIndex].path;
      captionText.textContent = photos[currentPhotoIndex].caption;
      modal.style.display = "block";
      updateModalNavigation();
    }

    function updateModalNavigation() {
      prevModalBtn.style.display = currentPhotoIndex === 0 ? "none" : "block";
      nextModalBtn.style.display =
        currentPhotoIndex === photos.length - 1 ? "none" : "block";
    }

    // Penutup Modal
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = "none";
      };
    }
    if (prevModalBtn) {
      prevModalBtn.onclick = () => {
        if (currentPhotoIndex > 0) openModal(currentPhotoIndex - 1);
      };
    }
    if (nextModalBtn) {
      nextModalBtn.onclick = () => {
        if (currentPhotoIndex < photos.length - 1)
          openModal(currentPhotoIndex + 1);
      };
    }
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  } else if (albumStackContainer && typeof gsap === "undefined") {
    console.error("GSAP not loaded. Pastikan link GSAP ada di HTML.");
  }
});
