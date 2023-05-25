"use strict";
import {
  RANDOM_MEAL_API,
  MEALS_LIST_API,
  USERS,
  MEALS,
  SHARED_MEALS,
} from "./API.JS";
const searchMealBtn = document.querySelector("#search-meal-btn");
const searchMealInp = document.querySelector("#search-meal-inp");
const mealSection = document.querySelector("#meal");
const inputIcon = document.querySelector("#remove-input-icon");
const helloUserText = document.querySelector("h1");
const spinner = document.querySelector("#spinner");
const randomMealBtn = document.querySelector("#user-random-meal");
const sharedMealsBtn = document.querySelector("#shared-meals");
const profileBtn = document.querySelector("#user-profile");
const localStorageID = JSON.parse(localStorage.getItem("mealID"));
const logoutBtn = document.querySelector("#log-out");

window.addEventListener("load", function () {
  if (!localStorageID) {
    location.href = "login.html";
  }
});

greetingUser();

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("mealID");
  location.href = "login.html";
});

searchMealInp.addEventListener("input", function () {
  if (this.value) {
    inputIcon.classList.remove("hide");
  } else {
    inputIcon.classList.add("hide");
  }
  inputIcon.addEventListener("click", function (e) {
    searchMealInp.value = "";
    this.classList.add("hide");
  });
});

searchMealBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!searchMealInp.value) return;
  getMeals(`${MEALS_LIST_API}${searchMealInp.value.toLowerCase().trim()}`);
});

randomMealBtn.addEventListener("click", () => {
  getMeals(RANDOM_MEAL_API);
});

profileBtn.addEventListener("click", function () {
  loadingUserProfile();
});

sharedMealsBtn.addEventListener("click", function () {
  mealSection.classList.remove("align-items-center");
  mealSection.classList.add("flex-column");
  helloUserText.classList.add("hide");
  mealSection.innerHTML = "";
  spinner.classList.remove("hide");
  const renderAllMeals = async function () {
    const responseSharedMeals = await fetch(SHARED_MEALS);
    const dataSharedMeals = await responseSharedMeals.json();
    const responseUsers = await fetch(`${USERS}`);
    const dataUsers = await responseUsers.json();
    mealSection.innerHTML = "";
    const html = `
    ${dataSharedMeals.map(({ name: userName, mealName, mealSource }) => {
      const active =
        dataUsers.find((val) => val.name === userName).id === localStorageID;
      return `
        <span class="d-flex  gap-2 single-box w-50  m-4">
          <p>${userName} ${active ? "(You)" : ""}</p>
          <p>shared</p>
          <p><a href="${mealSource}" target="_blank" id="meal-name">${mealName}</a></p>
          ${
            active
              ? "<button class='btn btn-secondary remove-share-btn'>❌</button>"
              : ``
          }
        </span>
      `;
    })}
    `;
    mealSection.innerHTML = "";
    spinner.classList.add("hide");
    mealSection.insertAdjacentHTML("afterbegin", html);
    const removeMealFromShareBtn = document.querySelector(".remove-share-btn");
    // Brisanje obroka iz Share
    removeMealFromShareBtn?.addEventListener("click", (e) => {
      spinner.classList.remove("hide");
      const cur = e.target.closest(".single-box");
      const mealNameText = cur.querySelector("#meal-name").textContent;
      const getSharedMeals = async function () {
        const currentUserName = await greetingUser();
        const responseSharedMeals = await fetch(SHARED_MEALS);
        const dataSharedMeals = await responseSharedMeals.json();
        const dataSharedMealsFiltered = dataSharedMeals.filter(
          (val) => val.name === currentUserName
        );
        const removeMealID = dataSharedMealsFiltered.find(
          (val) => val.mealName === mealNameText
        ).id;
        const responseDeleteMeal = await fetch(
          `${SHARED_MEALS}/${removeMealID}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        await cur.remove();
        spinner.classList.add("hide");
      };
      getSharedMeals();
    });
  };

  renderAllMeals();
});

async function loadingUserProfile() {
  try {
    helloUserText.classList.add("hide");
    mealSection.innerHTML = "";
    mealSection.classList.add("align-items-center");
    mealSection.classList.remove("flex-column");
    spinner.classList.remove("hide");
    const responseUsers = await fetch(`${USERS}/${localStorageID}`);
    const dataUsers = await responseUsers.json();
    const responseMeals = await fetch(MEALS);
    const dataMeals = await responseMeals.json();
    const dataMealsFiltered = dataMeals.filter(
      (val) => val.name == dataUsers.name
    );

    const markup = `
  <div
  id="first__profile"
  class="w-50 h-75 d-flex flex-column justify-content-between align-items-center"
>
  <h3>Created At: ${new Date(dataUsers.createdAt * 1000)
    .toLocaleString()
    .split(",")
    .at(0)}</h3>
  <img
    src="images/user-${dataUsers.gender === "female" ? "female" : "male"}.png"
    class="border border-secondary rounded-5"
    width="150"
    height="150"
  />
  <h1>${dataUsers.name}</h1>
  <h3>Gender: ${
    dataUsers.gender.slice(0, 1).toUpperCase() +
    dataUsers.gender.slice(1).toLowerCase()
  }</h3>
  <button class="btn btn-danger" id="del-acc">Delete Account</button>
</div>

<div
  id="second__profile"
  class="w-50 h-75 d-flex flex-column align-items-center"
>
 <h3 class="mb-5">Your Saved Meals</h3>
 <ul>
  ${dataMealsFiltered.map((val) => {
    return `<li class="d-flex gap-2">
        <p>${val.mealName}<p>
        <a href="${val.mealSource}" class="text-secondary" target="_blank">Source</a>
         <p class="text-primary meal-btn share-meal-btn">Share</p>
         <p class="text-danger meal-btn del-meal-btn">Delete</p>
    </li>`;
  })}
 </ul>
</div>
  `;
    spinner.classList.add("hide");
    mealSection.innerHTML = "";
    mealSection.insertAdjacentHTML("afterbegin", markup);
    const deleteAccBtn = document.querySelector("#del-acc");
    deleteAccBtn.addEventListener("click", delUser);
    // Brisanje obroka iz Profile sekcije
    const removeMealBtn = document.querySelectorAll(".del-meal-btn");
    removeMealBtn.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        spinner.classList.remove("hide");
        const profileBoxMeal = e.target.closest("li");
        const mealNameText = profileBoxMeal.firstElementChild.textContent;
        const removeMealProfile = async function () {
          const userName = await greetingUser();
          const responseMeals = await fetch(MEALS);
          const dataMeals = await responseMeals.json();
          const dataMealsFiltered = dataMeals.filter(
            (val) => val.name === userName
          );
          const filteredMealID = dataMealsFiltered.find(
            (val) => val.mealName === mealNameText
          ).id;
          const responseSharedMeals = await fetch(SHARED_MEALS);
          const dataSharedMeals = await responseSharedMeals.json();
          const dataSharedMealsFiltered = dataSharedMeals.filter(
            (val) => val.name === userName
          );
          const sharedMealID = dataSharedMealsFiltered.find(
            (val) => val.mealName === mealNameText
            // .id
          );
          const deletingMealFromMeals = await fetch(
            `${MEALS}/${filteredMealID}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (sharedMealID?.id) {
            const deletingMealFromSharedMeals = await fetch(
              `${SHARED_MEALS}/${sharedMealID.id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
          await profileBoxMeal.remove();
          spinner.classList.add("hide");
        };
        removeMealProfile();
      });
    });
    const shareMealBtn = document.querySelectorAll(".share-meal-btn");
    shareMealBtn.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const profileBoxMeal = e.target.closest("li");
        const href = profileBoxMeal.querySelector("a").href;
        const sharingMeal = async function () {
          const responseSharedMeals = await fetch(SHARED_MEALS);
          const dataSharedMeals = await responseSharedMeals.json();
          const userName = await greetingUser();
          const dataSharedMealsFiltered = dataSharedMeals.filter(
            (val) => val.name === userName
          );
          if (
            dataSharedMealsFiltered.find(
              (val) =>
                val.mealName === profileBoxMeal.firstElementChild.textContent
            )
          ) {
            alert("You Already Shared This Meal ❌");
            return;
          } else {
            const sharingMealRequest = await fetch(SHARED_MEALS, {
              method: "POST",
              headers: {
                "Content-type": "application/json; charset=UTF-8",
              },
              body: JSON.stringify({
                name: await greetingUser(),
                mealName: profileBoxMeal.firstElementChild.textContent,
                mealSource: href,
              }),
            });
            alert("Meal Shared 🔗");
          }
        };
        sharingMeal();
      });
    });
  } catch (e) {
    console.log(e);
  }
}

async function delUser() {
  try {
    const userName = await greetingUser();
    const responseMeals = await fetch(MEALS);
    const dataMeals = await responseMeals.json();
    //
    const responseSharedMeals = await fetch(SHARED_MEALS);
    const dataSharedMeals = await responseSharedMeals.json();
    const concatedMeals = [...dataMeals, ...dataSharedMeals];
    for (let i = 0; i < concatedMeals.length; i++) {
      if (dataMeals[i]?.name === userName) {
        const deletingUserRequest = await fetch(`${MEALS}/${dataMeals[i].id}`, {
          method: "DELETE",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        });
      }
      if (dataSharedMeals[i]?.name === userName) {
        const deletingUserRequest = await fetch(
          `${SHARED_MEALS}/${dataSharedMeals[i].id}`,
          {
            method: "DELETE",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          }
        );
      }
    }
    const responseUsers = await fetch(`${USERS}/${localStorageID}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    localStorage.removeItem("mealID");
    location.href = "login.html";
  } catch (e) {
    console.log(e);
  }
}

async function greetingUser() {
  try {
    spinner.classList.remove("hide");
    const responseUsers = await fetch(`${USERS}/${localStorageID}`);
    if (!responseUsers.ok) {
      localStorage.removeItem("mealID");
      location.href = "login.html";
    }
    const dataUsers = await responseUsers.json();
    spinner.classList.add("hide");
    const { name } = dataUsers;
    helloUserText.textContent = `Bon Appetit, ${name} 😋`;
    return dataUsers.name;
  } catch (e) {
    console.log(e);
  }
}

async function getMeals(parametar) {
  try {
    mealSection.classList.remove("align-items-center");
    mealSection.classList.add("flex-column");
    mealSection.innerHTML = "";
    spinner.classList.remove("hide");
    searchMealInp.value = "";
    inputIcon.classList.add("hide");
    helloUserText.classList.add("hide");
    const response = await fetch(`${parametar}`);
    const data = await response.json();
    const { meals } = data;
    const meal = meals[0];
    const { strSource: src } = meal;
    const getDetails = function (parametar) {
      return Object.entries(meal)
        .filter(
          (val) =>
            val.at(-1) !== "" &&
            val.at(-1) !== " " &&
            val.at(-1) !== null &&
            val.at(0).startsWith(parametar)
        )
        .map((val) => val.at(-1))
        .slice(0, 8);
    };
    const ingredients = getDetails("strIngredient");
    const measure = getDetails("strMeasure");
    let ingredientsAndMeasure = [];
    for (let i = 0; i < [...ingredients, ...measure].length; i++) {
      ingredientsAndMeasure.push([ingredients[i], measure[i]]);
    }
    const markup = ` 
    <span class="position-relative" id="meal-header">
    <h1 id="meal-title" class="text-center mb-4">${meal.strMeal}</h1>
    <button id="save-icon"  class="position-absolute top-0 end-0 me-5" title="Like Meal">
    <img src="images/save.png" width="40" height="40"/>
    </button>
    </span>
    <div id="main" class="d-flex gap-5">
      <span class="d-flex gap-2 p-2 flex-column" id="ingredients">
          <h2>Ingredients</h2>
          <ul id="ingredients-list">
           ${ingredientsAndMeasure
             .filter(
               (val) => val.at(0) !== undefined && val.at(-1) !== undefined
             )
             .map(
               (val) =>
                 `<li class="meal-spec">${val.at(0)} - ${val.at(-1)}</li>`
             )}
          </ul>
      </span>
      <span>
          <img src="${
            meal.strMealThumb
          }" width="250" height="250" class="rounded float-start m-3"/>
          <p id="meal-bio">
           ${meal.strInstructions}
          </p>
      </span>
    </div>
    `;
    spinner.classList.add("hide");
    mealSection.innerHTML = "";
    mealSection.insertAdjacentHTML("afterbegin", markup);
    const likeMeal = document.querySelector("#save-icon");
    likeMeal.addEventListener("click", function (e) {
      const addingLikedMeal = async function () {
        likeMeal.disabled = true;
        const responseUsers = await fetch(`${USERS}`);
        const responseData = await responseUsers.json();
        const userName = responseData.find(
          (val) => val.id === localStorageID
        ).name;
        const mealName =
          e.target.closest("#meal-header").firstElementChild.textContent;
        const responseMeals = await fetch(MEALS);
        const dataMeals = await responseMeals.json();
        const dataMealsFiltered = dataMeals.filter(
          (val) => val.name === userName
        );
        if (dataMealsFiltered.find((val) => val.mealName === mealName)) {
          alert("You Already Liked This Meal ❌");
          return;
        }
        const likedMeals = { name: userName, mealName, mealSource: src };
        const sendingLikedMealsRequest = await fetch(`${MEALS}`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify(likedMeals),
        });
        alert("Meal Added To Your Favourites 🥧👍");
        likeMeal.disabled = true;
        likeMeal.style.opacity = 0.25;
        likeMeal.disabled = false;
      };
      addingLikedMeal();
    });
  } catch (e) {
    inputIcon.classList.add("hide");
    helloUserText.classList.remove("hide");
    spinner.classList.add("hide");
    console.log(e);
    helloUserText.textContent = "Please Try Search For Another Meal 😕";
  }
}
