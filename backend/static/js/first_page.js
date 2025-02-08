import { NavigateTo, setIntegrity } from "./app.js";
let element = new Map()
let errElement = new Map()
let connectionToWS;
export function loginPage() {
    connectionToWS = new WebSocket("ws://127.0.0.1:1414/ws");
    var link = document.querySelector('link[rel="stylesheet"]');
    link.href = '/static/css/style.css';
    const app = document.getElementById("main-content");

    const navBar = document.querySelector("#app > header")
    navBar.style.display = "none";

    const notification = document.createElement('div');
    notification.className = "notification-container";
    app.append(notification);

    const mainDiv = document.createElement('div');
    mainDiv.className = 'main';

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.id = 'chk';
    checkboxInput.setAttribute('aria-hidden', 'true');
    mainDiv.appendChild(checkboxInput);

    const signupDiv = document.createElement('div');
    signupDiv.className = 'signup';

    const signupForm = document.createElement('form');
    signupForm.name = "SignUp"
    signupForm.id = "SignUp"
    const signupLabel = document.createElement('label');
    signupLabel.setAttribute('for', 'chk');
    signupLabel.setAttribute('aria-hidden', 'true');
    signupLabel.textContent = 'Sign up';
    signupForm.appendChild(signupLabel);

    const signupInputs = [
        { type: 'text', name: 'first_name', placeholder: 'First Name', required: false, autocomplete: true },
        { type: 'text', name: 'last_name', placeholder: 'Last Name', required: false },
        { type: 'text', name: 'email', placeholder: 'Email', required: false , autocomplete: true },
        { type: 'text', name: 'user_name', placeholder: 'Username', required: false },
        { type: 'text', name: 'age', placeholder: 'age', required: false },
        { type: 'password', name: 'pswd', placeholder: 'Password', required: false },
        { type: 'password', name: 'confpswd', placeholder: 'Confirme Password', required: false },
    ];

    signupInputs.forEach(inputData => {
        const input = document.createElement('input');
        const errParagraph = document.createElement("p")
        errParagraph.id = inputData.name + "Err"
        errElement[errParagraph.id] = errParagraph
        Object.assign(input, inputData);
        if (inputData.name === "email") {
            const selectElemnt = document.createElement('select');
            selectElemnt.name = "gender";
            const placeholderOption = document.createElement('option');
            placeholderOption.textContent = "Select gender";
            placeholderOption.disabled = true;
            placeholderOption.selected = true;

            const optionMale = document.createElement('option');
            optionMale.value = "Male";
            optionMale.textContent = "Male";

            const optionFemale = document.createElement('option');
            optionFemale.value = "Female";
            optionFemale.textContent = "Female";
            selectElemnt.appendChild(placeholderOption);
            selectElemnt.appendChild(optionMale);
            selectElemnt.appendChild(optionFemale);
            const errParagraph = document.createElement("p")
            errParagraph.id = selectElemnt.name + "Err"
            errElement[errParagraph.id] = errParagraph
            element["gender"] = selectElemnt
            signupForm.append(selectElemnt)
            signupForm.appendChild(errParagraph)


        }

        element[inputData.name] = input
        signupForm.appendChild(input);
        signupForm.appendChild(errParagraph)
    });

    const signupButton = document.createElement('button');
    signupButton.textContent = 'Sign up';
    signupForm.appendChild(signupButton);

    signupDiv.appendChild(signupForm);
    mainDiv.appendChild(signupDiv);

    const loginDiv = document.createElement('div');
    loginDiv.className = 'login';

    const loginForm = document.createElement('form');
    loginForm.name = "logIn"
    loginForm.id = "formSignIn"
    const loginLabel = document.createElement('label');
    loginLabel.setAttribute('for', 'chk');
    loginLabel.setAttribute('aria-hidden', 'true');
    loginLabel.textContent = 'Login';
    loginForm.appendChild(loginLabel);

    const loginInputs = [
        { type: 'text', name: 'emailOrUSername', placeholder: 'Email Or Username', required: false ,autocomplete: true },
        { type: 'password', name: 'pswdSignIn', placeholder: 'Password', required: false },
    ];

    loginInputs.forEach(inputData => {
        const input = document.createElement('input');
        const errParagraph = document.createElement("p")

        Object.assign(input, inputData);
        element[inputData.name] = input
        loginForm.appendChild(input);
        errParagraph.id = inputData.name + "Err"
        errElement[errParagraph.id] = errParagraph
        loginForm.appendChild(errParagraph);
    });

    const loginButton = document.createElement('button');
    loginButton.textContent = 'Login';
    loginForm.appendChild(loginButton);

    loginDiv.appendChild(loginForm);
    mainDiv.appendChild(loginDiv);

    app.appendChild(mainDiv);

    signupForm.addEventListener("submit", (event) => {
        event.preventDefault();
       
        if (!VerifyData()) {
            fetch("/api/register", {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    username: element["user_name"].value,
                    age: element["age"].value,
                    gender: element["gender"].value,
                    first_name: element["first_name"].value,
                    last_name: element["last_name"].value,
                    email: element["email"].value,
                    password: element["pswd"].value,
                    confirmPassword: element["confpswd"].value,
                }),
            })
                .then((response) => {
                    return response.json();
                })
                .then((reply) => {
                    if (reply.REplyMssg === "Done") {
                        connectionToWS.send(JSON.stringify({user:"New-User-joined-us"}));
                        createNotification("Registered successfully");
                        document.querySelector("#formSignIn > label").click();
                    }
                    if (reply.REplyMssg === "session") {
                        createNotification("You are already logged-in");
                    }
                    if (reply.REplyMssg === "email") {

                        errElement["emailErr"].textContent = "Email already exists!"
                    }
                    if (reply.REplyMssg === "user") {

                        errElement["user_nameErr"].textContent = "Username already exists!"
                    }
                    if (reply.REplyMssg === "passwd") {

                        errElement["pswdErr"].textContent = "Password too long!"
                    }

                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    });

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault()
        if (!VerifyLogin()) {
            fetch("/api/login", {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ emailOrUSername: element["emailOrUSername"].value, password: element["pswdSignIn"].value, })
            }).then(response => response.json())
                .then(reply => {
                    switch (true) {
                        case (reply.REplyMssg == "Done"):
                            setIntegrity(true)
                            NavigateTo("feed")
                            break
                        case (reply.REplyMssg == "Account Not found"):

                            errElement["emailOrUSernameErr"].textContent = "email not found!!, create an account"
                            break
                        case (reply.REplyMssg == "passwd"):
                            errElement["pswdSignInErr"].textContent = "incorrect Password!!, Try Again"
                    }
                })
        }


    })
}

const ExpUserName = /^[a-zA-Z0-9_.]{3,20}$/
const ExpName = /^[a-zA-Z]{3,20}$/
const ExpAge = /^(1[6-9]|[2-9][0-9]|1[01][0-9]|120)$/;
const ExpEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const ExpPasswd = /^(?=(.*[a-z]))(?=(.*[A-Z]))(?=(.*[0-9]))(?=(.*[^a-zA-Z0-9]))(.{8,20})$/

const InvalidFirstName = "Invalid First Name!!"
const InvalidLastName = "Invalid Last Name!!"
const InvalidEmail = "Invalid Email!!"
const InvalidAge = "Invalid Age!!"
const InvalidGender = "Invalid Gender!!"
const InvalidName = "Invalid Name!!"
const InvalidPassWord = "Inavlid Password!!"
const NotMatch = "Password Confirmation doesn't match!!"
const VerifyData = () => {

    let exist = false

    errElement["first_nameErr"].textContent = ""
    errElement["last_nameErr"].textContent = ""
    errElement["ageErr"].textContent = ""
    errElement["user_nameErr"].textContent = ""
    errElement["emailErr"].textContent = ""
    errElement["pswdErr"].textContent = ""
    errElement["confpswdErr"].textContent = ""
    errElement["genderErr"].textContent = ""

    if (!ExpName.test(element["first_name"].value)) {
        errElement["first_nameErr"].textContent = InvalidFirstName

        exist = true
    }

    if (!ExpName.test(element["last_name"].value)) {
        errElement["last_nameErr"].textContent = InvalidLastName

        exist = true
    }
    if (element["gender"].value !== "Male" && element["gender"].value !== "Female") {
        errElement["genderErr"].textContent = InvalidGender

        exist = true
    }

    if (!ExpAge.test(element["age"].value)) {
        errElement["ageErr"].textContent = InvalidAge
        exist = true
    }


    if (!ExpUserName.test(element["user_name"].value)) {
        errElement["user_nameErr"].textContent = InvalidName
        exist = true
    }


    if (!ExpEmail.test(element["email"].value)) {
        errElement["emailErr"].textContent = InvalidEmail
        exist = true
    }


    if (!ExpPasswd.test(element["pswd"].value)) {

        errElement["pswdErr"].textContent = InvalidPassWord
        exist = true
    }


    if (element["pswd"].value !== element["confpswd"].value) {
        errElement["confpswdErr"].textContent = NotMatch
        exist = true
    }

    return exist


}
function VerifyLogin() {

    let exist = false
    let emailOrUSernameValue = element["emailOrUSername"].value
    let passwordValue = element["pswdSignIn"].value
    errElement["emailOrUSernameErr"].textContent = ""
    errElement["pswdSignInErr"].textContent = ""
    if (emailOrUSernameValue.length === 0) {
        errElement["emailOrUSernameErr"].textContent = "Invalid Email Or User Name"
        exist = true
    }
    if (passwordValue.length === 0) {
        errElement["pswdSignInErr"].textContent = InvalidPassWord
        exist = true
    }
    return exist
}

function createNotification(title) {
    const container = document.querySelector('.notification-container');

    const notification = document.createElement('div');
    notification.className = 'notification hidden'; 
    notification.innerHTML = `
        <div class="innernoti">
            <div class="text-content">
                <div class="notification-header">
                    <span class="notification-title">${title}</span>
                </div>
            </div>
        </div>
    `;

    container.prepend(notification);

    setTimeout(() => {
        notification.classList.remove('hidden');
    }, 100);

    setTimeout(() => {
        notification.classList.add('hidden');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}