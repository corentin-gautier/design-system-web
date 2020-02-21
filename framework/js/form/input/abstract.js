class FormInputAbstract extends FormFieldAbstract {
    create(element) {
        super.create(element);

        const objectIndex = (this.objects.length - 1);
        const object = this.objects[objectIndex];

        object.textElement = element;
        object.valueElement = element;
        object.inputElements = [element];
        object.labelElement = MiscDom.getPreviousSibling(element, 'span');
        object.resetButton = MiscDom.getNextSibling(element, '.ds44-reset');
        object.containerElement = element.closest('.ds44-form__container');

        if (object.labelElement) {
            object.labelElement.classList.remove(this.labelClassName);
        }

        MiscEvent.addListener('focus', this.focus.bind(this, objectIndex), element);
        MiscEvent.addListener('blur', this.blur.bind(this, objectIndex), element);
        MiscEvent.addListener('invalid', this.invalid.bind(this, objectIndex), element);
        MiscEvent.addListener('form:validate', this.validate.bind(this, objectIndex));
        MiscEvent.addListener('keyUp:*', this.write.bind(this, objectIndex));
        MiscEvent.addListener('field:enable', this.enable.bind(this, objectIndex), object.containerElement);
        MiscEvent.addListener('field:disable', this.disable.bind(this, objectIndex), object.containerElement);
        if (object.resetButton) {
            MiscEvent.addListener('click', this.reset.bind(this, objectIndex), object.resetButton);
        }
        if (object.labelElement) {
            MiscEvent.addListener('click', this.focusOnTextElement.bind(this, objectIndex), object.labelElement);
        }
    }

    write(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }
        if (object.textElement !== document.activeElement) {
            return;
        }

        this.showHideResetButton(objectIndex);
        this.enableDisableLinkedField(objectIndex);
    }

    reset(objectIndex) {
        this.setData(objectIndex);
        this.showHideResetButton(objectIndex);
        this.enableDisableLinkedField(objectIndex);
        this.focusOnTextElement(objectIndex);
    }

    showHideResetButton(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.resetButton) {
            return;
        }

        if (!this.getData(objectIndex)) {
            // Hide reset button
            object.resetButton.style.display = 'none';
        } else {
            // Hide reset button
            object.resetButton.style.display = 'block';
        }
    }

    disable(objectIndex) {
        super.disable(objectIndex);

        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            inputElement.setAttribute('disabled', 'true');
        });

        this.blur(objectIndex);
        this.showHideResetButton(objectIndex);
    }

    setData(objectIndex, data = null) {
        const object = this.objects[objectIndex];
        if (!object.valueElement) {
            return;
        }

        object.valueElement.value = ((data && data.value) ? data.value : null);
    }

    focusOnTextElement(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        MiscAccessibility.setFocus(object.textElement);
    }

    focus(objectIndex) {
        const object = this.objects[objectIndex];

        if (object.labelElement) {
            object.labelElement.classList.add(this.labelClassName);
        }
    }

    blur(objectIndex) {
        if (this.getData(objectIndex)) {
            return;
        }

        const object = this.objects[objectIndex];
        if (!object.labelElement) {
            return;
        }

        object.labelElement.classList.remove(this.labelClassName);
    }

    checkValidity(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        let elementError = object.containerElement.querySelector('.ds44-errorMsg-container');
        if (elementError) {
            elementError.remove();
        }

        object.textElement.removeAttribute('aria-invalid');
        object.textElement.removeAttribute('aria-describedby');
        object.textElement.classList.remove('ds44-error');

        return object.textElement.checkValidity();
    }

    invalid(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        const errorMessageElementId = MiscUtils.generateId();
        this.showErrorMessage(objectIndex, errorMessageElementId);

        object.textElement.classList.add('ds44-error');
        object.textElement.setAttribute('aria-invalid', 'true');
        object.textElement.setAttribute('aria-describedby', errorMessageElementId);
    }

    getErrorMessage(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.valueElement) {
            return;
        }

        if(object.valueElement.getAttribute('type') === 'hidden') {
            return super.getErrorMessage(objectIndex);
        }

        let errorMessage = null;
        for (let key in object.valueElement.validity) {
            if (key === 'valid') {
                continue;
            }

            let isInError = object.valueElement.validity[key];
            if (isInError && this.errorMessages[key]) {
                errorMessage = this.errorMessages[key];
                break;
            }
        }
        if (errorMessage === null) {
            errorMessage = this.errorMessages['default'];
        }

        return super.getErrorMessage(objectIndex, errorMessage);
    }
}
