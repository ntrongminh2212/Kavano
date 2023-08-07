//let user = JSON.parse(localStorage.getItem("user"));
let imgAvatar = document.querySelector("#avatar-img");
let modal = document.querySelector('#change-password-modal');
console.log(user);

setTimeout(() => {
    setUp()
}, 500);

function setUp() {
    let inputs = document.querySelectorAll('#form-1 [name]');
    let eSelectDay = document.querySelector('#form-1 select[id="birth_day"]');
    let eSelectMonth = document.querySelector('#form-1 select[id="birth_month"]');
    let eSelectYear = document.querySelector('#form-1 select[id="birth_year"]');
    let eEmail = document.querySelector("#personal-info span#email");

    imgAvatar.src = user.avatar;

    Array.from(inputs).forEach(input => {
        switch (input.type) {
            case 'text':
                input.value = user[input.name];
                break;
            case 'radio':
                input.value == Number(user[input.name]) ? input.checked = true : 1;
                break;
            default:
                break;
        }
    })

    let dateOfBirth = new Date(user.dateOfBirth);
    console.log(dateOfBirth);
    eSelectDay.value = dateOfBirth.getDate();
    eSelectMonth.value = dateOfBirth.getMonth() + 1;
    eSelectYear.value = dateOfBirth.getFullYear();

    eEmail.innerHTML = user.email;
}

function previewFile(inputSelectImg) {
    let lstSelectImages = inputSelectImg.files;
    if (lstSelectImages.length > 0) {
        Array.from(lstSelectImages).forEach(image => {
            var fileReader = new FileReader();

            fileReader.addEventListener('load', () => {
                //imgAvatar.src = fileReader.result;
                changeAvatar(fileReader.result);
            })
            fileReader.readAsDataURL(image);
        })
    }
}

async function updateUserInfoAction(data) {
    const response = await updateUserInfoAPI(JSON.stringify(data));
    if (response.success) {
        notificationDialog('success', response.message);
        localStorage.setItem('user', JSON.stringify(data));
    } else {
        notificationDialog('failure', response.message);
    }
}


async function changeAvatar(base64img) {
    const data = {
        image_url: user.avatar,
        base64img: base64img
    }
    console.log(data);
    loadingDialog();
    const response = await changeAvatarAPI(JSON.stringify(data));
    if (response.success) {
        notificationDialog('success', response.message);
        user.avatar = response.image_url;
        imgAvatar.src = user.avatar;
        document.querySelector('.actionbar #user #avatar').src = user.avatar;
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        notificationDialog('failure', response.message);
    }
}

function openChangePasswordModal() {
    let bttClose = modal.querySelector('#close-modal');
    let inputs = modal.querySelectorAll('name')
    modal.style.display = 'block';

    bttClose.onclick = function (evt) {
        modal.style.display = 'none';
        Array.from(inputs).forEach((input) => {
            input.value = '';
        })
    }
}

async function changePasswordAction(data) {
    console.log(data);
    const response = await changePasswordAPI(JSON.stringify(data));
    if (response.success) {
        notificationDialog('success', response.message);
        modal.style.display = 'none';
    } else {
        handleError('oldPassword', response.message);
    }
}