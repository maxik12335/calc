const form = document.querySelector(".calculator__form");
const submitButton = form.querySelector("button");
const inputCaclulate = form.querySelector(".calculator__result");
const inputDelete = form.querySelector(".option .option__delete");
const inputDeleteAll = form.querySelector(".option-all .option__delete");
const numberButtons = form.querySelectorAll(".calculator__item");
const mathButtons = form.querySelectorAll(".math__operation");
const listMathOperations = document.querySelector(".result");
const cleanButton = document.querySelector(".result__button-clean");

let expression = "";
let historyList = [
  // {id: 0, value: expression}
];

startLocalStoraheAndHistoryList();
showMath();

function showMath() {
  if(document.querySelector(".result__item") === null) {
    listMathOperations.classList.remove("result-show") ;
  } else {
    listMathOperations.classList.add("result-show") ;
  }
}

// methods
const updateInput = {

  deleteLastSymbolIfMathOperator() {
    if( ["+", "-", "/", "*"].includes(expression.at(-1)) ) {
      expression = expression.slice(0, -1);
    }
  },

  delete() {
    expression = expression.slice(0, -1);
    inputCaclulate.value = expression;
  },

  deleteAll() {
    expression = ""
    inputCaclulate.value = expression;
  },

  buttons: {
    numberButtons(numberButton) {
      expression += numberButton.textContent;
      inputCaclulate.value = expression;
    },
  
    mathButtons(mathButton) {
      expression += mathButton.textContent;
      inputCaclulate.value = expression;
  
      if(["+", "-", "/", "*", " ", "", null, undefined].includes(expression[0])) {
        expression = "";
        inputCaclulate.value = expression;
      }
    },

  },

  keyBoard: {
    inputNumbers(keyNumber) {
      expression += keyNumber;
      inputCaclulate.value = expression;
    },

    inputMath(keyMath) {
      expression += keyMath;
      inputCaclulate.value = expression;

      if(["+", "-", "/", "*", " ", "", null, undefined].includes(expression[0])) {
        expression = "";
        inputCaclulate.value = expression;
      }
    }
  }

}

const listener = {
  keyBoard(e) {
    arrayNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    arrayMath = ["+", "-", "/", "*"];  
    arrayDoing = ["Backspace", "Enter"];
    
    if(arrayNumbers.includes(e.key)) {
      console.log("Число: ", e.key);
      updateInput.keyBoard.inputNumbers(e.key)
    }
  
    if(arrayMath.includes(e.key)) {
      console.log("Оператор: ", e.key);
      updateInput.deleteLastSymbolIfMathOperator();
      updateInput.keyBoard.inputMath(e.key)
    }
  
    if(arrayDoing[0] === e.key) {
      console.log("Backspace: ", e.key);
      updateInput.delete();
    }
  
    if(arrayDoing[1] === e.key) {
      console.log("Enter: ", e.key);
      submitForm(e)
    }
  },

  numbers(numberButton) {
    updateInput.buttons.numberButtons(numberButton);
  }
}

function startLocalStoraheAndHistoryList() {
  // First setHistotyList
  if(localStorage.length) {
    for(let i = 0; i < localStorage.length; i++) {
      historyList.push({id: i, value: localStorage[i]});
    }
  }

  // First renderListMathOperations
  if(historyList.length) {
    historyList.forEach(historyItem => {
      let p = document.createElement("p")
      p.classList.add("result__item")
      p.textContent = historyItem.value;
    
      listMathOperations.append(p);
    }) 
  }
}

// Listener mouse
numberButtons.forEach(numberButton => {
  numberButton.addEventListener("click", () => {
    updateInput.buttons.numberButtons(numberButton);
  })
})  

mathButtons.forEach(mathButton => {
  mathButton.addEventListener("click", () => {
    updateInput.deleteLastSymbolIfMathOperator();
    updateInput.buttons.mathButtons(mathButton);
  })
})

inputDelete.addEventListener("click", () => {
  updateInput.delete();
})

inputDeleteAll.addEventListener("click", () => {
  updateInput.deleteAll();
})

cleanButton.addEventListener("click", () => {
  localStorage.clear();
  historyList = [];
  const allMath = document.querySelectorAll(".result__item");
  allMath.forEach(item => {
    item.remove();
  })

  showMath();
})

// Listener keydown
document.addEventListener("keydown", listener.keyBoard); 
submitButton.addEventListener("click",  submitForm);

async function submitForm(e) {
  e.preventDefault();

  updateInput.deleteLastSymbolIfMathOperator();
  
  if(expression.length === 0) {
    return
  }

  const res = await fetch("/math/php/math.php", {
    method: "POST",
    body: JSON.stringify({postData: expression})
  })
    .then(res => res.json())
    .then(res => res)

    updateLocalStorageHistoryListAndRender();
    showMath();

  // Очистить поля
  expression = "";
  inputCaclulate.value = expression;

  function updateLocalStorageHistoryListAndRender() {
    let id = historyList[0] ? Number(historyList.at(-1).id) + 1 : 0;
    localStorage.setItem(id, `${expression} = ${res.result}`);

    if(historyList.length === 0) {
      historyList.push({id: localStorage.key(0), value: localStorage["0"]});
    } else {
      historyList.push({id: localStorage.length - 1, value: localStorage[localStorage.length - 1]});
    }
    
    if(historyList.length) {
      let p = document.createElement("p")
      p.classList.add("result__item")
      p.textContent =  historyList.at(-1).value;
    
      listMathOperations.append(p);
    }
  }
}


// + ПОЧИСТИТЬ и РАЗОБРАТЬ КОД => BACKEND
// ПОДУМАТЬ НАД ОПТИМИЗАЦИЕЙ КОДА НА FRONTEND

// 1. сделать округление результата BACKEND 
// 2. вывести ошибку и не отдавать на бек, если: цифра + знак. 152+ или 2-
   // выводить ошибку модалку с красивым аккуратным описанием
// 3. delete поместить влево, справа delete all (удалить всю кнопку)
// 4. сделать Keys (набор с клавиатуры)
// 5. при нажатии на ENTER нажимается submit