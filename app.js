// get elements
const searchBtn = document.getElementById("searchbtn");
const searchInp = document.getElementById("searchinp");
const favbox = document.getElementById('favbox');
const randomBox = document.querySelector('.random');
const modal = document.querySelector('.modal');
const container = document.querySelector('.container');

// oline offline detection
window.addEventListener('load',()=>{
    if (!navigator.onLine) {
        alert("You are offline! please check your internet conection.");
        return;
    }
})

// display meal info
container.addEventListener('click',(e)=>{
    if (e.target == modal) {
        modal.style.display = "none";
    }
})

// search button
searchBtn.addEventListener('click',()=>{
    if (searchInp.style.width == "0px") {
        searchInp.style.width = "185px";
        searchInp.style.padding = "5px 5px 5px 8px";
    }else if(searchInp.value){
        searchMeals(searchInp.value);
    }else{
        searchInp.style.width = "0";
        searchInp.style.padding = "0";
    }
})

// call functions
getRandomMeal();
getFavLs();

// fetch meals
async function getRandomMeal() {
    let respons = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    let random = await respons.json();
    let randomMeal =  random.meals[0];
    addRandomMeal(randomMeal)
}

async function getMealById(id) {
    let req = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    let respons = await req.json();
    let meal = respons.meals[0];
    return meal;
}

async function searchMealsByname(name) {
    const req = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + name);
    const meals = await req.json();
    return meals.meals;
}

// display random meal
function addRandomMeal(meals) {
     const box = document.createElement('div');
     box.classList.add("random-cart");
    const meal = `
    <div class="random-pic">
    <img src="${meals["strMealThumb"]}" alt="">
    </div>
    <div class="meta">
    <h1>${meals["strMeal"]}</h1>
    <button id="addfav" class="addtofave "><i class="fa fa-heart"></i></button>
    </div>
    `;
    box.innerHTML = meal;
    randomBox.appendChild(box);
    // add to favorite event
    const addToFav = box.querySelector('.addtofave');
    addToFav.addEventListener('click',()=>{
        if (!addToFav.classList.contains('active')) {
            addToFav.classList.add('active');
            addMealLs(meals["idMeal"]);
        }else{
            addToFav.classList.remove('active');
            removeMealLs(meals["idMeal"]);
        }
        getFavLs();
    })
    // display meal info event
    const title = box.querySelector('.meta h1');
    const img = box.querySelector('.random-pic img');
    box.addEventListener('click',(e)=>{
        if (e.target == img || e.target == title) {
            displayMealInfo(meals)
            modal.style.display = "flex";
        }
    })
}

//! localstorage add remove and get meals
function addMealLs(mealid) {
    let mealids = getMealLs();
    localStorage.setItem("mealids" , JSON.stringify([...mealids,mealid]))
}
function getMealLs() {
    let getMeals = JSON.parse(localStorage.getItem("mealids"));
    return getMeals === null ? [] : getMeals;
}

function removeMealLs(mealid) {
    let mealids = getMealLs();
    let removed = mealids.filter((id)=> id !== mealid);
    localStorage.setItem("mealids" ,JSON.stringify(removed));
}

//! add to favorite list
async function getFavLs() {
    favbox.innerHTML="";
    let mealids = getMealLs();
    for(let i = 0; i < mealids.length; i++){
        let mealid = mealids[i];
        let meal = await getMealById(mealid);
        addToFavList(meal);
}
  if (favbox.querySelectorAll("li").length < 1) {
      let nothing = document.createElement('p');
      nothing.innerText = "There are not Favorite food!";
      favbox.appendChild(nothing);
  }
}

function addToFavList(item) {
    const li = document.createElement('li');
    const favList = `
    <div class="fav-pic"><img src="${item["strMealThumb"]}" alt="${item["strMeal"]}"></div>
    <h3>${item["strMeal"]}</h3>
    <button id="favclose"><i class="fa fa-close"></i></button>
    `;
    li.innerHTML = favList;
    favbox.appendChild(li);
        // display fave info
        let img = li.querySelector('.fav-pic img');
        let h3 = li.querySelector('h3');
        li.addEventListener('click',(e)=>{
            if (e.target == h3 || e.target == img) {
            displayMealInfo(item);
            modal.style.display = "flex";
            }
        })

    let closeBtn = li.querySelector('#favclose');
    closeBtn.addEventListener('click',()=>{
        removeMealLs(item["idMeal"]);
        getFavLs();
        let heart = document.querySelector(".addtofave");
        heart.classList.remove('active');
    })

    if(favbox.querySelectorAll("li").length > 3){
        favbox.style.justifyContent ="space-between";
    }else{
        favbox.style.justifyContent ="space-around";
    }
}

//! search meals by name
async function searchMeals(value) {
    randomBox.innerHTML='';
    let searchs = await searchMealsByname(value);
    if (searchs) {
        searchs.forEach(search => {
            addRandomMeal(search);
        });
    }
    if (randomBox.innerHTML == '') {
        let h = document.createElement('h1');
        h.innerText = "Nothing found!";
        h.style.textAlign = "center";
        h.style.fontWeight = "600";
        h.style.fontWeight = "600";
        randomBox.appendChild(h);
    }
}

//! dispaly meal info
function displayMealInfo(meal) {
    modal.innerHTML = '';
        // add meal detals
        let ingredient = [];
        for(let i = 1; i < 20; i++){
            const ingredients = meal["strIngredient"+i];
            if (ingredients) {
                 ingredient.push(`${ingredients} : ${meal["strMeasure"+i]}`);
            }else{
                break;
            }}
    //creat elements
    const infoBox = document.createElement('div');
    infoBox.classList.add('meal-info');
    const mealInfo = `
    <button id="info-close"  class="info-close"><i class="fa fa-close"></i></button>
    <h2>${meal["strMeal"]}</h2>
    <div class="info-pic">
    <img src="${meal["strMealThumb"]}" alt="">
    </div>
    <p>${meal["strInstructions"]}</p>
    <ul>
    ${ingredient.map(ingre =>`<li>${ingre}</li>`).join(" ")}
    </ul>
    `;
    infoBox.innerHTML = mealInfo;
    modal.appendChild(infoBox)

    const modalClseBtn = modal.querySelector('.info-close');
    modalClseBtn.addEventListener('click',()=>{
        modal.style.display = "none";
    })
 }
