(function () {
    const MAX_MESSAGE_LENGTH = 2000;

    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("contactSubmit");

    if (!(form instanceof HTMLFormElement) || !(submitBtn instanceof HTMLButtonElement)) return;

    const nameInput = form.elements.namedItem("name");
    const emailInput = form.elements.namedItem("email");
    const messageInput = form.elements.namedItem("message");

    if (!(nameInput instanceof HTMLInputElement) || !(emailInput instanceof HTMLInputElement) || !(messageInput instanceof HTMLTextAreaElement)) {
        return;
    }

    function getFieldRoot(field) {
        return field.closest(".contact-field");
    }

    function getErrorNode(field) {
        const fieldRoot = getFieldRoot(field);
        if (!fieldRoot) return null;

        let error = fieldRoot.querySelector(".contact-error");
        if (!(error instanceof HTMLElement)) {
            error = document.createElement("span");
            error.className = "contact-error";
            error.hidden = true;
            fieldRoot.appendChild(error);
        }

        return error;
    }

    function setFieldError(field, message) {
        const errorNode = getErrorNode(field);
        const hasError = Boolean(message);

        field.classList.toggle("is-invalid", hasError);
        field.setAttribute("aria-invalid", hasError ? "true" : "false");

        if (!errorNode) return;
        errorNode.textContent = message || "";
        errorNode.hidden = !hasError;
    }

    function validateName() {
        const value = nameInput.value.trim();
        if (!value) return "Name is required.";
        return "";
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        if (!value) return "Email is required.";

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
        if (!isValidEmail) return "Enter a valid email address.";

        return "";
    }

    function validateMessage() {
        const value = messageInput.value.trim();
        if (!value) return "Message is required.";
        if (value.length > MAX_MESSAGE_LENGTH) {
            return `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`;
        }
        return "";
    }

    function validateField(field) {
        if (field === nameInput) return validateName();
        if (field === emailInput) return validateEmail();
        if (field === messageInput) return validateMessage();
        return "";
    }

    function validateForm() {
        const nameError = validateName();
        const emailError = validateEmail();
        const messageError = validateMessage();

        setFieldError(nameInput, nameError);
        setFieldError(emailInput, emailError);
        setFieldError(messageInput, messageError);

        return {
            valid: !nameError && !emailError && !messageError,
            firstInvalid: nameError ? nameInput : emailError ? emailInput : messageInput
        };
    }

    [nameInput, emailInput, messageInput].forEach((field) => {
        field.addEventListener("input", () => {
            if (!field.classList.contains("is-invalid")) return;
            setFieldError(field, validateField(field));
        });

        field.addEventListener("blur", () => {
            setFieldError(field, validateField(field));
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const check = validateForm();
        if (!check.valid) {
            check.firstInvalid?.focus();
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<span>Message Sent</span>";
        submitBtn.disabled = true;

        window.setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            form.reset();
            setFieldError(nameInput, "");
            setFieldError(emailInput, "");
            setFieldError(messageInput, "");
        }, 1400);
    });
})();
