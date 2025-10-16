export const settings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error_visible",
};

const getErrorEl = (formEl, inputEl) =>
  formEl.querySelector(`#${inputEl.id}-error`);

const showInputError = (formEl, inputEl, errorMsg, config) => {
  const errorEl = getErrorEl(formEl, inputEl);
  if (!errorEl) return;
  errorEl.textContent = errorMsg;
  errorEl.classList.add(config.errorClass);
  inputEl.classList.add(config.inputErrorClass);
};

const hideInputError = (formEl, inputEl, config) => {
  const errorEl = getErrorEl(formEl, inputEl);
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.classList.remove(config.errorClass);
  inputEl.classList.remove(config.inputErrorClass);
};

const checkInputValidity = (formEl, inputEl, config) => {
  if (!inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage, config);
  } else {
    hideInputError(formEl, inputEl, config);
  }
};

const hasInvalidInput = (inputList) =>
  inputList.some((input) => !input.validity.valid);

const disableButton = (buttonEl, config) => {
  buttonEl.disabled = true;
  buttonEl.classList.add(config.inactiveButtonClass);
};

const enableButton = (buttonEl, config) => {
  buttonEl.disabled = false;
  buttonEl.classList.remove(config.inactiveButtonClass);
};

const toggleButtonState = (inputList, buttonEl, config) => {
  if (hasInvalidInput(inputList)) {
    disableButton(buttonEl, config);
  } else {
    enableButton(buttonEl, config);
  }
};

const resetValidation = (formEl, inputList, config) => {
  inputList.forEach((input) => hideInputError(formEl, input, config));
  const buttonEl = formEl.querySelector(config.submitButtonSelector);
  if (buttonEl) toggleButtonState(inputList, buttonEl, config);
};

const setEventListeners = (formEl, config) => {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const buttonEl = formEl.querySelector(config.submitButtonSelector);

  toggleButtonState(inputList, buttonEl, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formEl, inputElement, config);
      toggleButtonState(inputList, buttonEl, config);
    });
  });
};

export const enableValidation = (config) => {
  const formList = document.querySelectorAll(config.formSelector);
  formList.forEach((formEl) => setEventListeners(formEl, config));
};

export { resetValidation };

enableValidation(settings);
