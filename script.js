let rowNumberSection = document.querySelector(".row-number-section")

let formulaBarSelectedCellArea = document.querySelector(".selected-cell-div");

let columnTagSection = document.querySelector(".column-tag-section")

let cellSection = document.querySelector(".cell-section");

let formulaInput = document.querySelector(".formula-input-section");

let lastCell;

let dataObj = {};


formulaInput.addEventListener("keydown", function(e){
  if(e.key == "Enter"){
    console.log('now evaluating formula');

    let typedFormula = e.currentTarget.value;
    

    if(!lastCell) return

    console.log('not returned');

    let selectedCellAdd = lastCell.getAttribute("data-address");
    let cellObj = dataObj[selectedCellAdd];

    cellObj.formula = typedFormula;

    let upstream = cellObj.upstream;

    let currUpStream = currCellObj.upstream;

      for(k = 0; k < currUpStream.length; k++){

        removeFromDownstream(currUpStream[k], selectedCellAdd);
      }

      currCellObj.upstream = [];
  }
})




//to sync column tags with scrolling cells

cellSection.addEventListener("scroll", function(e){
  e.currentTarget.scrollLeft;

  columnTagSection.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;
})

//to sync row numbers with scrolling cells

cellSection.addEventListener("scroll", function(e){
  e.currentTarget.scrollTop;

  rowNumberSection.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;
})




for(let i=1; i<=100; i++){
  let div = document.createElement("div")
  div.innerText = i
  div.classList.add("row-number")
  rowNumberSection.append(div)
}


for(let i=0; i<26; i++){
  
  let asciiCode = 65 + i

  let reqAlphabet = String.fromCharCode(asciiCode)

  let div = document.createElement("div")

  div.innerText = reqAlphabet
  div.classList.add("column-tag")
  columnTagSection.append(div)

}

//inside this nested for loop we are creating indvidual cells UI + cell
for(let i=1; i<=100; i++){     
  let rowDiv = document.createElement("div");
  rowDiv.classList.add("row");

  for(let j=0; j<26; j++){    //to create cell address and cells from A1 to Z100
    let asciiCode = 65 + j

    let reqAlphabet = String.fromCharCode(asciiCode)

    let cellAddress = reqAlphabet + i;

    dataObj[cellAddress] = {
      value: undefined,
      formula: undefined,
      upstream: [],
      downstream: [],
    };

    let cellDiv = document.createElement("div");

    cellDiv.addEventListener("input", function(e){
      
      //jis cell pr type kra uske attribute se maine uska cell address fetch kra
      let currCellAddress = e.currentTarget.getAttribute("data-address")

      //kyoki sare cell objects dataObj me store ho rkhe h using their cell address as key maine jis cell pr click krke type kra uska hi address fetch and uska hi object chalega to wo address as key use krke dataObj se fetch krlia req cellObj ko
      let currCellObj = dataObj[currCellAddress];

      currCellObj.value = e.currentTarget.innerText;
      currCellObj.formula = undefined;

      //1- loop in upstream
      //2- for each cell go to its downstream and remove ourself
      //3- apni upstream ko empty array bnado

      let currUpStream = currCellObj.upstream;

      for(k = 0; k<currUpStream.length; k++){
        // removeFromDownstream(parent, child)

        removeFromDownstream(currUpStream[k], currCellAddress);
      }

      currCellObj.upstream = [];



      let currDownstream = currCellObj.downstream;

      //C1[20] => [E1]  E1 (2*C1) [40]

      for(let i = 0; i< currDownstream.length; i++){
        updateCell(currDownstream[i]);
      }

      dataObj[currCellAddress] = currCellObj;  

      console.log(dataObj);
    });

    cellDiv.contentEditable = true;

    cellDiv.classList.add("cell");

    cellDiv.setAttribute("data-address",cellAddress);


    cellDiv.addEventListener("click", function(e){
      if(lastCell){
        lastCell.classList.remove("cell-selected");
      }

      e.currentTarget.classList.add("cell-selected");

      lastCell = e.currentTarget;



      let currCellAddress = e.currentTarget.getAttribute("data-address")

      formulaBarSelectedCellArea.innerText = currCellAddress;


    });

    rowDiv.append(cellDiv);

  
  }

  cellSection.append(rowDiv);
  
}


dataObj["A1"].value = 20;
dataObj["A1"].downstream = ["B1"];
dataObj["B1"].formula = "2 * A1";
dataObj["B1"].upstream = ["A1"];
dataObj["B1"].value = 40;

let a1cell = document.querySelector("[data-address='A1']");
let b1cell = document.querySelector("[data-address='B1']");

a1cell.innerText = 20;
b1cell.innerText = 40;




//C1 = Formula(2*A1)
//A1 = parent
//C1 = child

//is function kisi ki upstream se mtlb ni h
//iska bs itna kaam h ki parent do and child do, aur mai parent ki downstream se child ko hta duga
//taki unke bichka connection khtm hojai
//taki agr parent update ho to connection khtm hone k bad child update na ho

function removeFromDownstream(parentCell,childCell){
  //1- fetch parentCell's downstream

  let parentDownstream = dataObj[parentCell].downstream

  //2- filter kro childCell ko parent ki downstream se

  let filteredDownstream = []; //A1

  for(let i = 0; i<parentDownstream.length; i++){
    if(parentDownstream[i] != childCell){
      filteredDownstream.push(parentDownstream[i]);
    }
  }


  //3- filtered upstream ko wapis save krwado dataObj me req cell me
  dataObj[parentCell].downstream = filteredDownstream;
}

function updateCell(cell){
  let cellObj = dataObj[cell];
  let upstream = cellObj.upstream;   // [A1 -> 20, B1 -> 10]
  let formula = cellObj.formula;    // A1 + B1

  //upstream me jobhi cell hai unke objects me jaunga whase unki value lekr auga
  // wo sari values mai ek object me key value pair me store kruga where key being the cell address

  // {
  //   A1: 20,
  //   B1: 10
  // }

  let valObj = {}

  for(let i=0; i<upstream.length; i++){

    let cellValue = dataObj[upstream[i]].value;

    valObj[upstream[i]] = cellValue;
  }

  //a1 + b1

  for(let key in valObj){
    formula = formula.replace(key,valObj[key])
  }

  // 20 + 10

  let newValue = eval(formula);

  let cellOnUi = document.querySelector(`[data-address='${cell}']`);

  cellOnUi.innerText = newValue;

  dataObj[cell].value = newValue;

  let downstream = cellObj.downstream;

  for(let i=0; i<downstream.length; i++){
    updateCell(downstream[i]);
  }

}
