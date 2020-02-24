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

        if (object.labelElement) {
            object.labelElement.classList.remove(this.labelClassName);
        }

        MiscEvent.addListener('focus', this.focus.bind(this, objectIndex), element);
        MiscEvent.addListener('blur', this.blur.bind(this, objectIndex), element);
        MiscEvent.addListener('invalid', this.invalid.bind(this, objectIndex), element);
        MiscEvent.addListener('keyUp:*', this.write.bind(this, objectIndex));
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

    enableElements(objectIndex, evt) {
        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            inputElement.removeAttribute('disabled');
        });
    }

    disableElements(objectIndex) {
        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            inputElement.setAttribute('disabled', 'true');
        });

        this.blur(objectIndex);
        this.showHideResetButton(objectIndex);
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

    setData(objectIndex, data = null) {
        const object = this.objects[objectIndex];
        if (!object.valueElement) {
            return;
        }

        object.valueElement.value = ((data && data.value) ? data.value : null);
    }

    focusOnTextElement(objectIndex) {
        const object = this.objects[objectIndex];

        MiscAccessibility.setFocus(object.inputElements[0]);
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

    removeInvalid(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        let elementError = object.containerElement.querySelector('.ds44-errorMsg-container');
        if (elementError) {
            elementError.remove();
        }

        object.inputElements.forEach((inputElement) => {
            inputElement.removeAttribute('aria-invalid');
            inputElement.removeAttribute('aria-label');
            inputElement.removeAttribute('aria-describedby');
        });
        object.textElement.classList.remove('ds44-error');
    }

    invalid(objectIndex) {
        const object = this.objects[objectIndex];
        if (!object.textElement) {
            return;
        }

        const errorMessageElementId = MiscUtils.generateId();
        this.showErrorMessage(objectIndex, errorMessageElementId);

        const errorMessage = this.getErrorMessage(objectIndex);
        object.inputElements.forEach((inputElement) => {
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.setAttribute('aria-label', errorMessage);
            inputElement.setAttribute('aria-describedby', errorMessageElementId)
        });
        object.textElement.classList.add('ds44-error');
    }
}
