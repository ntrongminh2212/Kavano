
function SetupDate(selector) {
    let eBirthForm = document.querySelector(selector);
    let eSelectDay = eBirthForm.querySelector('select[id="birth_day"]');
    let eSelectMonth = eBirthForm.querySelector('select[id="birth_month"]');
    let eSelectYear = eBirthForm.querySelector('select[id="birth_year"]');
    console.log(eSelectDay);
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `Tháng ${i}`;
        eSelectMonth.add(option);
    }
    const year = (new Date()).getFullYear();
    for (let i = 1970; i <= year; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `${i}`;
        eSelectYear.add(option);
    }
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `${i}`;
        eSelectDay.add(option);
    }

    DateSelectedListener(eSelectDay, eSelectMonth, eSelectYear);
}

function DateSelectedListener(eSelectDay, eSelectMonth, eSelectYear) {
    eSelectMonth.onchange = function () {
        addDateOption();
    }

    eSelectYear.onchange = function () {
        addDateOption();
    }

    function addDateOption() {
        const month = eSelectMonth.value;
        const year = eSelectYear.value;
        let date = 1;
        removeAllOption();
        while (isDateValid(year, month, date)) {
            const option = document.createElement('option');
            option.value = date;
            option.text = `${date}`;
            eSelectDay.add(option);
            date++;
        }
    }

    function isDateValid(year, month, date) {
        return new Date(year, month - 1, date).getDate() === date;
    }

    function removeAllOption() {
        var options = eSelectDay.querySelectorAll('option');
        options.forEach(o => o.remove());
    }
}

function Validator(options) {
    var eForm = document.querySelector(options.form);

    function validate(eInput, requirement, eError) {
        var message = requirement.check(eInput.value);
        if (message) {
            eError.innerText = message;
            eInput.parentElement.classList.add('invalid');
        } else {
            eError.innerText = '';
            eInput.parentElement.classList.remove('invalid');
        }
        return !message;
    }

    eForm.onsubmit = function (event) {
        event.preventDefault();
        let isFormValid = true;
        options.requirements.forEach(requirement => {
            var eInput = eForm.querySelector(requirement.inputId);
            var eError = eInput.parentElement.querySelector('.form-message');
            if (!eError) {
                eError = eInput.parentElement.parentElement.querySelector('.form-message');
            }
            const isValid = validate(eInput, requirement, eError);
            if (!isValid)
                isFormValid = false;
        })
        if (isFormValid) {
            let eData = eForm.querySelectorAll('[name]');
            let data = Array.from(eData).reduce((data, input) => {
                switch (input.type) {
                    case 'text':
                        data[input.name] = input.value;
                        break;
                    case 'radio':
                        data[input.name] = eForm.querySelector('input[name="' + input.name + '"]:checked').value;
                        break;
                    default:
                        data[input.name] = input.value;
                        break;
                }
                return data;
            }, {});

            let divBirth = eForm.querySelector('div[id="birth"]')
            if (divBirth) {
                const day = eForm.querySelector('select[id="birth_day"]').value;
                const month = eForm.querySelector('select[id="birth_month"]').value;
                const year = eForm.querySelector('select[id="birth_year"]').value;
                data['dateOfBirth'] = `${year}-${month}-${day}`;
            }
            options.onSubmit(data);
        }
    }

    options.requirements.forEach(requirement => {
        var eInput = eForm.querySelector(requirement.inputId);
        var eError = eInput.parentElement.querySelector('.form-message');
        if (eInput) {
            eInput.onblur = function () {
                validate(eInput, requirement, eError);
            }
            eInput.onkeydown = function () {
                eError.innerText = '';
                eInput.parentElement.classList.remove('invalid');
            }
        }
    });
}

Validator.isRequired = function (selector, errMes) {
    return {
        inputId: selector,
        check: function (value) {
            return value.trim() ? undefined : errMes || 'Trường này không được bỏ trống';
        }
    };
}

Validator.isEmail = function (selector, message) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return {
        inputId: selector,
        check: function (value) {
            return emailRegex.test(value.trim()) ? undefined : message || 'Email không đúng định dạng (VD: abc@gmail.com)';
        }
    };
}

Validator.isUsername = function (selector, message) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let phoneNumRegex = /((09|03|07|08|05)+([0-9]{8})\b)/;
    return {
        inputId: selector,
        check: function (value) {
            return (emailRegex.test(value.trim()) || phoneNumRegex.test(value.trim()))
                ? undefined : message || 'Email hoặc số điện thoại không đúng định dạng';
        }
    };
}

Validator.isPhoneNumber = function (selector) {
    let phoneNumRegex = /((09|03|07|08|05)+([0-9]{8})\b)/;
    return {
        inputId: selector,
        check: function (value) {
            return phoneNumRegex.test(value.trim()) ? undefined : 'Số điện thoại không đúng định dạng (VD: 0123456789)';
        }
    };
}


Validator.isPasswordConfirm = function (selector, getPassword) {
    console.log(getPassword());
    return {
        inputId: selector,
        check: function (value) {
            return value === getPassword() ? undefined : 'Mật khẩu xác nhận không trùng khớp';
        }
    }
}

function handleError(selector, errMes) {
    const eInput = document.querySelector(`input[id="${selector}"]`);
    var eError = eInput.parentElement.querySelector('.form-message');
    eError.innerText = errMes;
    eInput.parentElement.classList.add('invalid');
}