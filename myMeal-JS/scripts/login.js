"use strict";

import { USERS } from "./API.JS";
const usernameInp = document.querySelector("#username-input");
const passwordInp = document.querySelector("#password-input");
const loginBtn = document.querySelector("#login-btn");
const msg = document.querySelector("#msg");
const spinner = document.querySelector("#spinner");
const form = document.querySelector("form");
const hidePass = document.querySelector("#hide-pass");
const showPass = document.querySelector("#show-pass");
const localStorageID = JSON.parse(localStorage.getItem("mealID"));

window.addEventListener("load", function () {
  if (localStorageID) {
    location.href = "main.html";
  }
});

window.addEventListener("keydown", function (e) {
  if (e.key === " ") {
    e.preventDefault();
  }
});

const clearInpSpin = function () {
  spinner.classList.add("hide");
  usernameInp.value = passwordInp.value = "";
};

const togglingPassVisib = function (parametar1, parametar2, passVisib) {
  parametar1.classList.add("hide");
  parametar2.classList.remove("hide");
  passwordInp.type = passVisib;
};

passwordInp.addEventListener("input", function () {
  if (this.value) {
    showPass.classList.remove("hide");
  } else {
    showPass.classList.add("hide");
    hidePass.classList.add("hide");
    //
    passwordInp.type = "password";
  }
});
//
showPass.addEventListener("click", function () {
  togglingPassVisib(showPass, hidePass, "text");
});
hidePass.addEventListener("click", function () {
  togglingPassVisib(hidePass, showPass, "password");
});
//
loginBtn.addEventListener("click", function (e) {
  spinner.classList.remove("hide");
  e.preventDefault();
  if (!usernameInp.value && !passwordInp.value) {
    msg.textContent = "Please enter your informations!";
    clearInpSpin();
    return;
  } else if (!passwordInp.value) {
    msg.textContent = "Please enter your password!";
    clearInpSpin();

    return;
  } else if (!usernameInp.value) {
    msg.textContent = "Please enter your username!";
    clearInpSpin();

    return;
  } else {
    async function getUser() {
      try {
        const response = await fetch(USERS);
        const data = await response.json();
        let user = data.find(
          (u) =>
            u.name === usernameInp.value && u.password === passwordInp.value
        );
        if (user) {
          localStorage.setItem("mealID", JSON.stringify(user.id));
          form.classList.add("hide");
          spinner.classList.remove("hide");
          clearInpSpin();
          location.href = "main.html";
        } else if (
          data.find(
            (u) =>
              u.name === usernameInp.value && u.password !== passwordInp.value
          )
        ) {
          msg.textContent =
            "Password incorrect! If you forgot your password, please contact us!";
          clearInpSpin();
        } else {
          msg.textContent = "User doesn't exist, please register to continue!";
          clearInpSpin();
        }
      } catch (e) {
        console.log(e);
      }
    }
    getUser();
  }
});
