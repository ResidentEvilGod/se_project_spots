import "./index.css";
import { enableValidation, settings } from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  token: "d41c5de4-a60c-4cba-8b57-bb0d7fcd07f2",
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
const avatarForm = avatarModal?.querySelector(".modal__form");
const avatarInput = avatarModal?.querySelector("#avatar-url-input");
const avatarCloseBtn = avatarModal?.querySelector(".modal__close-btn");
const avatarSubmitBtn = avatarModal?.querySelector(".modal__submit-btn");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewNameEl = previewModal.querySelector(".modal__title");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal?.querySelector(".modal__form");
const deleteSubmitBtn = deleteModal?.querySelector(".modal__submit-btn");
const deleteCloseBtn = deleteModal?.querySelector(".modal__close-btn");

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

function openModal(modal) {
  modal.classList.add("modal_is-opened");
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
}

if (avatarCloseBtn)
  avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));
if (avatarEditBtn)
  avatarEditBtn.addEventListener("click", () => {
    if (avatarInput) avatarInput.value = "";
    openModal(avatarModal);
  });

if (deleteCloseBtn)
  deleteCloseBtn.addEventListener("click", () => closeModal(deleteModal));

previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

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

  cardTitleEl.textContent = name;
  cardImageEl.src = link;
  cardImageEl.alt = name;

  if (isLiked) cardLikeBtnEl.classList.add("card__like-btn_active");

  cardLikeBtnEl.addEventListener("click", () => {
    if (!cardId) {
      cardLikeBtnEl.classList.toggle("card__like-btn_active");
      return;
    }

    const willLike = !cardLikeBtnEl.classList.contains("card__like-btn_active");
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
      .catch((err) => console.error("Failed to toggle like:", err))
      .finally(() => (cardLikeBtnEl.disabled = false));
  });

  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data)
  );

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = link;
    previewImageEl.alt = name;
    previewNameEl.textContent = name;
    openModal(previewModal);
  });

  return cardElement;
}

let selectedCard = null;
let selectedCardId = null;

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

  setButtonLoading(deleteSubmitBtn, true, "Deleting...", "Yes, delete");

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
      setButtonLoading(deleteSubmitBtn, false, "Deleting...", "Yes, delete")
    );
}

if (deleteForm) deleteForm.addEventListener("submit", handleDeleteSubmit);

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const url = avatarInput.value.trim();
  if (!url) return;
  setButtonLoading(avatarSubmitBtn, true);

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
    .finally(() => setButtonLoading(avatarSubmitBtn, false));
}

if (avatarForm) avatarForm.addEventListener("submit", handleAvatarSubmit);

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

function handleProfileFormSubmit(evt) {
  evt.preventDefault();

  const name = editProfileNameInput.value.trim();
  const about = editProfileDescriptionInput.value.trim();
  const submitBtn = editProfileFormEl.querySelector(".modal__submit-btn");

  setButtonLoading(submitBtn, true);

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
    .finally(() => setButtonLoading(submitBtn, false));
}

editProfileFormEl.addEventListener("submit", handleProfileFormSubmit);

newPostBtn.addEventListener("click", function () {
  newPostFormEl.reset();
  const inputs = Array.from(newPostFormEl.querySelectorAll(".modal__input"));
  resetValidation(newPostFormEl, inputs, settings);
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

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

newPostFormEl.addEventListener("submit", handleAddCardSubmit);

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

enableValidation(settings);
