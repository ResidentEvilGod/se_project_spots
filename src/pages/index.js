import "./index.css";
import { enableValidation, settings } from "../scripts/validation.js";
import Api from "../utils/Api.js";

const initialCards = [
  {
    name: "Golden Gate Bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the tree",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  token: "f18dafb7-fd93-4a29-8bad-28626515cfd2", // <-- keep your token here
});

function setButtonLoading(
  btn,
  isLoading,
  loadingText = "Saving...",
  defaultText = "Save"
) {
  if (!btn) return;
  btn.textContent = isLoading ? loadingText : defaultText;
  btn.disabled = isLoading;
}

const profileAvatarEl = document.querySelector(".profile__avatar");
const avatarEditBtn = document.querySelector(".profile__avatar-edit");
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal
  ? avatarModal.querySelector(".modal__form")
  : null;
const avatarInput = avatarModal
  ? avatarModal.querySelector("#avatar-url-input")
  : null;
const avatarCloseBtn = avatarModal
  ? avatarModal.querySelector(".modal__close-btn")
  : null;
const avatarSubmitBtn = avatarModal
  ? avatarModal.querySelector(".modal__submit-btn")
  : null;

if (avatarCloseBtn) {
  avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));
}

if (avatarEditBtn) {
  avatarEditBtn.addEventListener("click", () => {
    if (avatarInput) {
      avatarInput.value = ""; // start clean
    }
    openModal(avatarModal);
  });
}
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");

  const name = data?.name ?? "";
  const link = data?.link ?? "";
  const isLiked = Boolean(data?.isLiked);
  const cardId = data?._id || null;

  if (cardTitleEl) cardTitleEl.textContent = name;
  if (cardImageEl) {
    cardImageEl.src = link;
    cardImageEl.alt = name;
  }
  if (isLiked && cardLikeBtnEl) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  if (cardLikeBtnEl) {
    cardLikeBtnEl.addEventListener("click", () => {
      if (!cardId) {
        cardLikeBtnEl.classList.toggle("card__like-btn_active");
        return;
      }

      const willLike = !cardLikeBtnEl.classList.contains(
        "card__like-btn_active"
      );
      cardLikeBtnEl.disabled = true;

      api
        .changeLikeStatus(cardId, willLike)
        .then((updatedCard) => {
          if (updatedCard.isLiked) {
            cardLikeBtnEl.classList.add("card__like-btn_active");
          } else {
            cardLikeBtnEl.classList.remove("card__like-btn_active");
          }
        })
        .catch((err) => {
          console.error("Failed to toggle like:", err);
        })
        .finally(() => {
          cardLikeBtnEl.disabled = false;
        });
    });
  }

  if (cardDeleteBtnEl) {
    cardDeleteBtnEl.addEventListener("click", () => {
      handleDeleteCard(cardElement, data);
    });
  }

  if (cardImageEl) {
    cardImageEl.addEventListener("click", () => {
      if (previewImageEl) {
        previewImageEl.src = link;
        previewImageEl.alt = name;
      }
      if (previewNameEl) previewNameEl.textContent = name;
      openModal(previewModal);
    });
  }

  return cardElement;
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data && data._id ? data._id : null;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  if (!selectedCard) {
    closeModal(deleteModal);
    return;
  }

  const originalText = deleteSubmitBtn ? deleteSubmitBtn.textContent : "";
  if (deleteSubmitBtn) {
    deleteSubmitBtn.textContent = "Deleting...";
    deleteSubmitBtn.disabled = true;
  }
  const promise = selectedCardId
    ? api.deleteCard(selectedCardId)
    : Promise.resolve();

  promise
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
      selectedCard = null;
      selectedCardId = null;
    })
    .catch((err) => {
      console.error("Failed to delete card:", err);
      alert("Could not delete the card. Please try again.");
    })
    .finally(() => {
      if (deleteSubmitBtn) {
        deleteSubmitBtn.textContent = originalText || "Yes, delete";
        deleteSubmitBtn.disabled = false;
      }
    });
}

if (deleteForm) {
  deleteForm.addEventListener("submit", handleDeleteSubmit);
}

const cardDeleteBtnEL = cardElement.querySelector(".card__delete-btn");
cardDeleteBtnEl.addEventListener("click", () => {
  if (!data._id) {
    cardElement.remove();
    return;
  }

  api
    .deleteCard(data._id)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.error("Failed to delete card:", err);
      alert("Could not delete the card. Please try again.");
      cardDeleteBtnEl.disabled = false;
    });
});

const previewModal = document.querySelector("#preview-modal");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});
const previewNameEl = previewModal.querySelector(".modal__title");

cardImageEl.addEventListener("click", () => {
  (previewImageEl.src = data.link),
    (previewImageEl.alt = data.name),
    openModal(previewModal);
  previewNameEl.textContent = data.name;
});
return cardElement;

Promise.all([api.getUserInfo(), api.getInitialCards()])
  .then(([user, cards]) => {
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    if (profileAvatarEl && user.avatar) {
      profileAvatarEl.src = user.avatar;
    }
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.append(cardElement);
    });
  })
  .catch((err) => {
    console.error("Error loading initial data:", err);
    alert("Failed to load data from server. Please try again later.");
  });

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const editProfileFormEl = editProfileModal.querySelector(".modal__form");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostSubmit = newPostModal.querySelector(".modal__submit-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostFormEl = newPostModal.querySelector(".modal__form");
const newPostImageInput = newPostModal.querySelector("#card-image-input");
const newPostCaptionInput = newPostModal.querySelector("#card-image-caption");

const postImageEl = document.querySelector(".card__image");
const postCaptionEl = document.querySelector(".card__title");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal
  ? deleteModal.querySelector(".modal__form")
  : null;
const deleteSubmitBtn = deleteModal
  ? deleteModal.querySelector(".modal__submit-btn")
  : null;
const deleteCloseBtn = deleteModal
  ? deleteModal.querySelector(".modal__close-btn")
  : null;
if (deleteCloseBtn)
  deleteCloseBtn.addEventListener("click", () => closeModal(deleteModal));

function openModal(modal) {
  modal.classList.add("modal_is-opened");
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
}

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  newPostImageInput.value = postImageEl ? postImageEl.src : "";
  if (postImageEl) postImageEl.src = editPostImageInput.value.trim();
  newPostCaptionInput.value = "";
  newPostImageInput.value = "";
  const inputs = Array.from(newPostFormEl.querySelectorAll(".modal__input"));
  resetValidation(newPostFormEl, inputs, settings);
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  profileNameEl.textContent = editProfileNameInput.value;
  profileDescriptionEl.textContent = editProfileDescriptionInput.value;
  closeModal(editProfileModal);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const name = newPostCaptionInput.value.trim();
  const link = newPostImageInput.value.trim();
  const submitBtn = newPostFormEl.querySelector(".modal__submit-btn");

  setButtonLoading(submitBtn, true, "Saving...", "Create");

  api
    .addNewCard({ name, link })
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardsList.prepend(cardElement);
      newPostFormEl.reset();
      closeModal(newPostModal);
    })
    .catch((err) => {
      console.error("Failed to add card:", err);
      alert("Could not add new card. Please try again.");
    })
    .finally(() => setButtonLoading(submitBtn, false, "Saving...", "Create"));
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data?._id || null;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  if (!selectedCard) {
    closeModal(deleteModal);
    return;
  }

  const submitBtn = deleteSubmitBtn;
  setButtonLoading(submitBtn, true, "Deleting...", "Yes, delete");

  const promise = selectedCardId
    ? api.deleteCard(selectedCardId)
    : Promise.resolve();

  promise
    .then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteModal);
    })
    .catch((err) => {
      console.error("Failed to delete card:", err);
      alert("Could not delete the card. Please try again.");
    })
    .finally(() =>
      setButtonLoading(submitBtn, false, "Deleting...", "Yes, delete")
    );
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const url = avatarInput.value.trim();
  const submitBtn = avatarSubmitBtn;

  if (!url) return;
  setButtonLoading(submitBtn, true, "Saving...", "Save");

  api
    .updateAvatar(url)
    .then((user) => {
      profileAvatarEl.src = user.avatar;
      profileAvatarEl.alt = `${user.name}'s profile picture`;
      avatarForm.reset();
      closeModal(avatarModal);
    })
    .catch((err) => {
      console.error("Failed to update avatar:", err);
      alert(
        "Could not update profile picture. Please check the link and try again."
      );
    })
    .finally(() => setButtonLoading(submitBtn, false, "Saving...", "Save"));
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();

  const name = editProfileNameInput.value.trim();
  const about = editProfileDescriptionInput.value.trim();
  const submitBtn = editProfileFormEl.querySelector(".modal__submit-btn");

  setButtonLoading(submitBtn, true, "Saving...", "Save");

  api
    .editUserInfo({ name, about })
    .then((user) => {
      profileNameEl.textContent = user.name;
      profileDescriptionEl.textContent = user.about;
      closeModal(editProfileModal);
    })
    .catch((err) => {
      console.error("Failed to update profile:", err);
      alert("Could not save profile changes. Please try again.");
    })
    .finally(() => setButtonLoading(submitBtn, false, "Saving...", "Save"));
}

const cardElement = getCardElement(inputValues);
cardsList.prepend(cardElement);

newPostFormEl.reset();
const submitBtn = newPostFormEl.querySelector(".modal__submit-btn");
if (submitBtn) {
  const inputs = Array.from(newPostFormEl.querySelectorAll(".modal__input"));
  submitBtn.disabled = true;
  submitBtn.classList.add(settings.inactiveButtonClass);
}
closeModal(newPostModal);

newPostFormEl.addEventListener("submit", handleAddCardSubmit);
editProfileFormEl.addEventListener("submit", handleProfileFormSubmit);

enableValidation(settings);
