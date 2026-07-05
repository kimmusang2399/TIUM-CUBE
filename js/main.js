const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const reviewForm = document.querySelector("[data-review-form]");
const reviewList = document.querySelector("[data-review-list]");
const reviewNote = document.querySelector("[data-review-note]");
const reviewStorageKey = "tiumCubeReviewsV4";

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
});

function loadSavedReviews() {
  try {
    return JSON.parse(window.localStorage?.getItem(reviewStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveReviews(reviews) {
  try {
    window.localStorage?.setItem(reviewStorageKey, JSON.stringify(reviews));
  } catch {
    if (reviewNote) {
      reviewNote.textContent = "후기가 화면에 등록되었습니다.";
    }
  }
}

let savedReviews = loadSavedReviews();

function createReviewCard(review) {
  const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const card = document.createElement("article");
  card.className = "review-card is-visible";
  card.innerHTML = `
    <div class="review-top">
      <strong></strong>
      <span></span>
    </div>
    <div class="review-stars"></div>
    <p></p>
  `;
  card.querySelector("strong").textContent = review.name;
  card.querySelector("span").textContent = review.type;
  card.querySelector(".review-stars").textContent = stars;
  card.querySelector(".review-stars").setAttribute("aria-label", `별점 ${rating}점`);
  card.querySelector("p").textContent = review.message;
  return card;
}

savedReviews.forEach((review) => {
  reviewList?.prepend(createReviewCard(review));
});

reviewForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(reviewForm);
  const review = {
    name: String(formData.get("name") || "").trim(),
    type: String(formData.get("type") || "").trim(),
    rating: String(formData.get("rating") || "").trim(),
    message: String(formData.get("message") || "").trim(),
  };

  if (!review.name || !review.type || !review.rating || !review.message) {
    return;
  }

  savedReviews = [review, ...savedReviews].slice(0, 6);
  saveReviews(savedReviews);
  reviewList?.prepend(createReviewCard(review));
  reviewForm.reset();

  if (reviewNote) {
    reviewNote.textContent = "후기가 등록되었습니다.";
  }
});
