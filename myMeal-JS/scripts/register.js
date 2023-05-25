"use strict";
import { USERS } from "./API.JS";
const userNameInput = document.querySelector("#username-input");
const passwordInput = document.querySelector("#password-input");
const repeatPasswordInput = document.querySelector("#repeat-password-input");
const registerBtn = document.querySelector("#register-btn");
const selectGender = document.querySelector("select");
const form = document.querySelector("form");
const spinner = document.querySelector("#spinner");
const body = document.querySelector("body");
const img = document.querySelector("img");

window.addEventListener("keydown", function (e) {
  if (e.key === " ") {
    e.preventDefault();
  }
});

registerBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (
    !userNameInput.value ||
    !passwordInput.value ||
    !repeatPasswordInput.value ||
    selectGender.selectedIndex === 0
  ) {
    alert("Please Fill Out All Informations! ❌");
    return;
  }

  if (passwordInput.value !== repeatPasswordInput.value) {
    alert("Passwords Must Match! ❌");
    return;
  }

  form.classList.add("hide");
  img.classList.add("hide");
  spinner.classList.remove("hide");

  async function registerUser() {
    try {
      const response = await fetch(USERS);
      const data = await response.json();
      const ifUserExists = data.find((u) => u.name === userNameInput.value);
      if (ifUserExists) {
        form.classList.remove("hide");
        img.classList.remove("hide");
        spinner.classList.add("hide");

        alert("This Username Already Exists.\nPlease Try Another One.");
        return;
      } else {
        const response = await fetch(USERS, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            name: userNameInput.value,
            password: passwordInput.value,
            gender: selectGender.value,
          }),
        });
        spinner.classList.add("hide");
        body.innerHTML = `
    <div class="d-flex flex-column gap-5">
    <h2 class="text-white text-center">You Are Registered <br/> Click Button Below To Continue</h2>
    <button class="btn btn-light" id="btn-continue">Click</button>
    </div>
  `;
        const res = await response.json();
        document
          .querySelector("#btn-continue")
          .addEventListener("click", () => {
            localStorage.setItem("mealID", JSON.stringify(res.id));
            location.href = "main.html";
          });
      }
    } catch (e) {
      console.log(e);
    }
  }
  registerUser();
  setTimeout(() => {
    userNameInput.value = passwordInput.value = repeatPasswordInput.value = "";
  }, 1000);
});
