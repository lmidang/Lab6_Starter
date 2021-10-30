class RecipeCard extends HTMLElement {
  constructor() {
    // Part 1 Expose - TODO
    super();
    this.shadow = this.attachShadow({mode:'open'});
  }

  set data(data) {
    // This is the CSS that you'll use for your recipe cards
    const styleElem = document.createElement('style');
    const styles = `
      * {
        font-family: sans-serif;
        margin: 0;
        padding: 0;
      }
      
      a {
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
      
      article {
        align-items: center;
        border: 1px solid rgb(223, 225, 229);
        border-radius: 8px;
        display: grid;
        grid-template-rows: 118px 56px 14px 18px 15px 36px;
        height: auto;
        row-gap: 5px;
        padding: 0 16px 16px 16px;
        width: 178px;
      }

      div.rating {
        align-items: center;
        column-gap: 5px;
        display: flex;
      }
      
      div.rating > img {
        height: auto;
        display: inline-block;
        object-fit: scale-down;
        width: 78px;
      }

      article > img {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        height: 118px;
        object-fit: cover;
        margin-left: -16px;
        width: calc(100% + 32px);
      }

      p.ingredients {
        height: 32px;
        line-height: 16px;
        padding-top: 4px;
        overflow: hidden;
      }
      
      p.organization {
        color: black !important;
      }

      p.title {
        display: -webkit-box;
        font-size: 16px;
        height: 36px;
        line-height: 18px;
        overflow: hidden;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      p:not(.title), span, time {
        color: #70757A;
        font-size: 12px;
      }
    `;
    styleElem.innerHTML = styles;

    // Here's the root element that you'll want to attach all of your other elements to
    const card = document.createElement('article');

    // Some functions that will be helpful here:
    //    document.createElement()
    //    document.querySelector()
    //    element.classList.add()
    //    element.setAttribute()
    //    element.appendChild()
    //    & All of the helper functions below

    // Make sure to attach your root element and styles to the shadow DOM you
    // created in the constructor()

    // Part 1 Expose - TODO
    this.shadow.appendChild(styleElem);
    this.shadow.appendChild(card);
    
    const imageElem = document.createElement('img');
    let imageUrl = getImage(data);
    if (imageUrl == null) {
      imageUrl = getUrl(data["@image"]);
    }
    imageElem.setAttribute('src', imageUrl);
    imageElem.setAttribute('alt', "Recipe Title");
    card.appendChild(imageElem);

    const titleP = document.createElement('p');
    const title = document.createElement('a');
    const titleText = document.createTextNode(getTitle(data));
    titleP.className = "title";
    title.appendChild(titleText);
    title.setAttribute('href', getUrl(data));
    titleP.appendChild(title);
    card.append(titleP);

    const organization = document.createElement('p');
    const organizationText = document.createTextNode(getOrganization(data));
    organization.className = "organization";
    organization.appendChild(organizationText);
    card.append(organization);

    const rating = getRating(data);
    const ratingDiv = document.createElement('div');
    const ratingAvgSpan = document.createElement('span');
    let ratingAvgText;
    if (rating > 0) {
      const ratingImg = document.createElement('img');
      const ratingNumReviews = document.createElement('span');
      ratingAvgText = document.createTextNode(rating);
      const ratingReviewsText = document.createTextNode(getNumReviews(data));
      const ratingImgSource = "assets/images/icons/" + parseInt(rating) + "-star.svg";
      ratingDiv.className = "rating";
      ratingImg.setAttribute("src", ratingImgSource);
      ratingImg.setAttribute("alt", rating + " stars");
      ratingNumReviews.appendChild(ratingReviewsText);
      ratingDiv.appendChild(ratingAvgSpan);
      ratingDiv.appendChild(ratingImg);
      ratingDiv.appendChild(ratingNumReviews);
    } else {
      ratingAvgText = document.createTextNode("No Reviews");
      ratingDiv.appendChild(ratingAvgSpan);
    }
    ratingAvgSpan.appendChild(ratingAvgText);
    card.append(ratingDiv);
    const time = document.createElement("time");
    const timeText = document.createTextNode(getTime(data));
    time.appendChild(timeText);
    card.append(time);

    const ingredientsP = document.createElement("p");
    const ingredientsText = document.createTextNode(getIngredients(data));
    ingredientsP.className = "ingredients";
    ingredientsP.appendChild(ingredientsText);
    card.append(ingredientsP);

    console.log(getIngredients(data));

  }
}

function getImage(data) {
  if (data.publisher?.name) return getUrl(searchForKey(data, "image"));
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'ImageObject') {
        return data['@graph'][i].url;
      }
    }
  };
  return null;
}

function getTitle(data) {
  if (data.publisher?.name) return data.name;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'].includes('WebPage')) {
        return data['@graph'][i].name;
      }
    }
  };
  return null;
}

function getRating(data) {
  if (data.publisher?.name) return -1;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Recipe') {
        return data['@graph'][i].aggregateRating.ratingValue;
      }
    }
  };
  return null;
}

function getNumReviews(data) {
  if (data.publisher?.name) return -1;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Recipe') {
        return data['@graph'][i].aggregateRating.ratingCount;
      }
    }
  };
  return null;
}

function getTime(data) {
  let timeString = "";
  if (data.publisher?.name) timeString = data.totalTime;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Recipe') {
        timeString = data['@graph'][i].totalTime;
      }
    }
  };

  return convertTime(timeString);
}

function getIngredients(data) {
  let ingredientsArr;
  if (data.publisher?.name) ingredientsArr = data.recipeIngredient;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Recipe') {
        ingredientsArr = data['@graph'][i].recipeIngredient;
      }
    }
  };

  return createIngredientList(ingredientsArr);
}

/*********************************************************************/
/***                       Helper Functions:                       ***/
/***          Below are some functions I used when making          ***/
/***     the solution, feel free to use them or not, up to you     ***/
/*********************************************************************/

/**
 * Recursively search for a key nested somewhere inside an object
 * @param {Object} object the object with which you'd like to search
 * @param {String} key the key that you are looking for in the object
 * @returns {*} the value of the found key
 */
function searchForKey(object, key) {
  var value;
  Object.keys(object).some(function (k) {
    if (k === key) {
      value = object[k];
      return true;
    }
    if (object[k] && typeof object[k] === 'object') {
      value = searchForKey(object[k], key);
      return value !== undefined;
    }
  });
  return value;
}

/**
 * Extract the URL from the given recipe schema JSON object
 * @param {Object} data Raw recipe JSON to find the URL of
 * @returns {String} If found, it returns the URL as a string, otherwise null
 */
function getUrl(data) {
  if (data.url) return data.url;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Article') return data['@graph'][i]['@id'];
    }
  };
  return null;
}

/**
 * Similar to getUrl(), this function extracts the organizations name from the
 * schema JSON object. It's not in a standard location so this function helps.
 * @param {Object} data Raw recipe JSON to find the org string of
 * @returns {String} If found, it retuns the name of the org as a string, otherwise null
 */
function getOrganization(data) {
  if (data.publisher?.name) return data.publisher?.name;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Organization') {
        return data['@graph'][i].name;
      }
      if (data['@graph'][i]['@type'] == 'WebSite') {
        return data['@graph'][i].name;
      }
    }
  };
  return null;
}

/**
 * Converts ISO 8061 time strings to regular english time strings.
 * Not perfect but it works for this lab
 * @param {String} time time string to format
 * @return {String} formatted time string
 */
function convertTime(time) {
  let timeStr = '';

  // Remove the 'PT'
  time = time.slice(2);

  let timeArr = time.split('');
  if (time.includes('H')) {
    for (let i = 0; i < timeArr.length; i++) {
      if (timeArr[i] == 'H') return `${timeStr} hr`;
      timeStr += timeArr[i];
    }
  } else {
    for (let i = 0; i < timeArr.length; i++) {
      if (timeArr[i] == 'M') return `${timeStr} min`;
      timeStr += timeArr[i];
    }
  }

  return '';
}

/**
 * Takes in a list of ingredients raw from imported data and returns a neatly
 * formatted comma separated list.
 * @param {Array} ingredientArr The raw unprocessed array of ingredients from the
 *                              imported data
 * @return {String} the string comma separate list of ingredients from the array
 */
function createIngredientList(ingredientArr) {
  let finalIngredientList = '';

  /**
   * Removes the quantity and measurement from an ingredient string.
   * This isn't perfect, it makes the assumption that there will always be a quantity
   * (sometimes there isn't, so this would fail on something like '2 apples' or 'Some olive oil').
   * For the purposes of this lab you don't have to worry about those cases.
   * @param {String} ingredient the raw ingredient string you'd like to process
   * @return {String} the ingredient without the measurement & quantity 
   * (e.g. '1 cup flour' returns 'flour')
   */
  function _removeQtyAndMeasurement(ingredient) {
    return ingredient.split(' ').splice(2).join(' ');
  }

  function _removeParenthesis(ingredient) {
    if (ingredient.includes("(")) {
      const ingredSplit = ingredient.split(')');
      return ingredient.split('(')[0] + ingredSplit[ingredSplit.length - 1];  
    }
    return ingredient
  }

  function _removeExtraCommas(ingredient) {
    return ingredient.split(',')[0];
  }

  ingredientArr.forEach(ingredient => {
    //ingredient = _removeParenthesis(ingredient);
    //ingredient = _removeExtraCommas(ingredient);
    //ingredient = ingredient.replace("&nbsp;", "");
    //ingredient = ingredient.replaceAll("*", "");
    ingredient = _removeQtyAndMeasurement(ingredient);
    ingredient = ingredient.replaceAll("<p>", "");
    ingredient = ingredient.replaceAll("</p>", "");
    finalIngredientList += `${ingredient}, `;
  });

  // The .slice(0,-2) here gets ride of the extra ', ' added to the last ingredient
  return finalIngredientList.slice(0, -2);
}

// Define the Class so you can use it as a custom element.
// This is critical, leave this here and don't touch it
customElements.define('recipe-card', RecipeCard);
