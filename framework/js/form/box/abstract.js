class FormBoxAbstract extends FormFieldAbstract {
    constructor(category) {
        super(
            '.ds44-form__' + category + '_container',
            category
        );

        this.errorMessages['valueMissing'] = 'Veuillez cocher un élément';
    }

    create(element) {
        super.create(element);

        const objectIndex = (this.objects.length - 1);
        const object = this.objects[objectIndex];

        object.inputElements = element.querySelectorAll('input[type="' + this.category + '"]');
        object.containerElement = element;
        object.isRequired = (element.getAttribute('data-required') === 'true');

        object.inputElements.forEach((inputElement) => {
            MiscEvent.addListener('click', this.toggleCheck.bind(this, objectIndex), inputElement);
        });
        MiscEvent.addListener('field:enable', this.enable.bind(this, objectIndex), object.containerElement);
        MiscEvent.addListener('field:disable', this.disable.bind(this, objectIndex), object.containerElement);
    }

    disable(objectIndex) {
        super.disable(objectIndex);

        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            inputElement.setAttribute('disabled', 'true');
        });
    }

    toggleCheck(objectIndex) {
        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            if (inputElement.checked) {
                inputElement.setAttribute('aria-checked', 'true');
            } else {
                inputElement.removeAttribute('aria-checked');
            }
        });

        this.enableDisableLinkedField(objectIndex);
    }

    setData(objectIndex, data = null) {
        const object = this.objects[objectIndex];

        object.inputElements.forEach((inputElement) => {
            if(
                data &&
                data.values &&
                data.values.includes(inputElement.value)
            ) {
                inputElement.checked = true;
                inputElement.setAttribute('aria-checked', 'true');
            } else {
                inputElement.checked = false;
                inputElement.removeAttribute('aria-checked');
            }
        });
    }

    getData(objectIndex) {
        const object = this.objects[objectIndex];

        const inputElementValues = [];
        object.inputElements.forEach((inputElement) => {
            if (inputElement.checked) {
                inputElementValues.push(inputElement.value);
            }
        });
        if (inputElementValues.length === 0) {
            return null;
        }

        let data = {};
        data[object.name] = inputElementValues;

        return data;
    }

    checkValidity(objectIndex) {
        const object = this.objects[objectIndex];

        let errorElement = object.containerElement.querySelector('.ds44-errorMsg-container');
        if (errorElement) {
            errorElement.remove();
        }

        let hasOneCheckedInput = false;
        object.inputElements.forEach((inputElement) => {
            if (
                inputElement.checked ||
                inputElement.disabled
            ) {
                hasOneCheckedInput = true;
            }

            inputElement.removeAttribute('aria-invalid');
            inputElement.removeAttribute('aria-label');
            inputElement.removeAttribute('aria-describedby');
            inputElement.classList.remove('ds44-boxError');
        });

        if (
            object.isRequired &&
            hasOneCheckedInput !== true
        ) {
            this.invalid(objectIndex);

            return false;
        }

        return true;
    }

    invalid(objectIndex) {
        const object = this.objects[objectIndex];

        const errorMessageElementId = MiscUtils.generateId();
        this.showErrorMessage(objectIndex, errorMessageElementId);

        const errorMessage = this.getErrorMessage(objectIndex);
        object.inputElements.forEach((inputElement) => {
            inputElement.classList.add('ds44-boxError');
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.setAttribute('aria-label', errorMessage);
            inputElement.setAttribute('aria-describedby', errorMessageElementId)
        });
    }
}
