// app state
// ===================
// These variables represent the state of our application, they tell us at
// any given moment the state of our blackjack game. You might find it useful
// to use these to debug issues by console logging them in the functions below.
var deckID = "";
var dealerCards = [];
var playerCards = [];
var playerScore = 0;
var dealerScore = 0;
var roundLost = false;
var roundWon = false;
var roundTied = false;

var testCount = 0;
// game play nodes:
// ===================
// These nodes will be used often to update the UI of the game.

// assign this variable to the DOM node which has id="dealer-number"
var dealerScoreNode = document.querySelector('#dealer-number')

// select the DOM node which has id="player-number"
var playerScoreNode = document.querySelector('#player-number')

// select the DOM node which has id="dealer-cards"
var dealerCardsNode = document.querySelector('#dealer-cards')

// select the DOM node which has id="player-cards"
var playerCardsNode = document.querySelector('#player-cards')

// selec the DOM node which has id="announcement"
var announcementNode = document.querySelector('#announcement')

// selec the DOM node which has id=new-game"
var newDeckNode = document.querySelector('#new-game')

// selec the DOM node which has id="next-hand"
var nextHandNode = document.querySelector('#next-hand')

// selec the DOM node which has id=""hit-me""
var hitMeNode = document.querySelector('#hit-me')

// selec the DOM node which has id="stay"
var stayNode = document.querySelector('#stay')


// On click events
// ==================
// These events define the actions to occur when a button is clicked.
// These are provided for you and serve as examples for creating further
// possible actions of your own choosing.
newDeckNode.onclick = getNewDeck;
nextHandNode.onclick = newHand;
hitMeNode.onclick = () => hitMe('player');
stayNode.onclick = () => setTimeout(() => dealerPlays(), 600);
// ==================


// Game mechanics functions
// ========================
var deckAPI = `https://deckofcardsapi.com/api/deck/`

function getNewDeck() {
  resetPlayingArea();
  var newDeck = `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6`
  return fetch(newDeck)
  .then(response =>
    response.json())
  .then(data => {
    nextHandNode.removeAttribute("style");
    hitMeNode.style.display = "none";
    stayNode.style.display = "none";
    deckID = data.deck_id;
  })
  .catch(error => {
    console.log(error)
  })
}


function computeScore(cards) {
  var total=0;
  var cardObj = {
    total: total,
    aces: 0
  }
  cards.map(function(card){
    if(card.value === "KING" ||card.value ==="QUEEN" || card.value === "JACK"){
      card.value = 10;
    }
    else if(card.value === "ACE"){
      cardObj.aces += 1;
      if (total > 10){
        card.value = 1;
      }
      else{
        card.value = 11;
      }
    }
   total+=parseInt(card.value)

   if(total > 21 && cardObj.aces > 0){
      total = (total - 11 ) + 1;
    }
   })
    return total;
}


function newHand() {
  resetPlayingArea();
  return fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=4`)
  .then(response => response.json())
  .then(data => {
    dealerCards.push(data.cards[0],data.cards[1]);
    playerCards.push(data.cards[2],data.cards[3]);
    dealerScore = "?";
    hitMeNode.removeAttribute("style");
    stayNode.removeAttribute("style");
  })
  .then(result => {
    playerCards.forEach(playerCard => {
      var image = document.createElement('img')
      image.setAttribute('src', playerCard.image);
      image.setAttribute('alt', playerCard.code);
      playerCardsNode.appendChild(image);
    })
    dealerCards.forEach(dealerCard => {
      var image = document.createElement('img')
      image.setAttribute('src', dealerCard.image);
      image.setAttribute('alt', dealerCard.code);
      dealerCardsNode.appendChild(image);
    })

    playerScore = `${computeScore(playerCards)}`;
    playerScoreNode.textContent = playerScore;

    dealerScore = `${computeScore(dealerCards)}`;
    dealerScoreNode.textContent = dealerScore;
    if (dealerScore == 21){
      roundLost == true
      announcementNode.textContent = "Dealer has BlackJack! You Lose!"
    }

    if (playerScore == 21){
      roundWon == true;
      announcementNode.textContent = "BlackJack! You Win!"
    }
  })
  .catch(error => {
    return error
    console.log("error");
  })
}

function resetPlayingArea() {
console.log(++testCount, "reset playing area count")

  dealerCards = [];
   playerCards = [];
  playerScore = 0;
  dealerScore = 0;
  roundLost = false;
  roundWon = false;
  roundTied = false;

  announcementNode.textContent = "";
  playerScoreNode.textContent = "";
  dealerScoreNode.textContent = "";
  hitMeNode.style.display = "none";
  stayNode.style.display = "none";

  var imagesD = dealerCardsNode.getElementsByTagName('img');
   while(imagesD.length > 0) {
       imagesD[0].parentNode.removeChild(imagesD[0]);
   }
   var imagesP = playerCardsNode.getElementsByTagName('img');
   while(imagesP.length > 0) {
       imagesP[0].parentNode.removeChild(imagesP[0]);
   }
  console.log(dealerCardsNode,2)
}

function hitMe(target) {
  if(roundWon === true || roundLost === true || roundTied === true){
      return;
  }
  return fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
  .then(response =>
    response.json())
  .then(data => {
    if(target === 'player'){
      playerCards.push(data.cards[0])
      var image = document.createElement('img')
      image.setAttribute('src', data.cards[0].image);
      image.setAttribute('alt', data.cards[0].code);
      playerCardsNode.appendChild(image);
    }
    else if(target === 'dealer'){
      dealerCards.push(data.cards[0])
      var image = document.createElement('img')
      image.setAttribute('src', data.cards[0].image);
      image.setAttribute('alt', data.cards[0].code);
      dealerCardsNode.appendChild(image);
      dealerPlays();
    }
    dealerScore = `${computeScore(dealerCards)}`;
    dealerScoreNode.textContent = dealerScore;

    playerScore = `${computeScore(playerCards)}`;
    playerScoreNode.textContent = playerScore;
    if (playerScore > 21){
      roundWon = false;
      announcementNode.textContent = "you lose!"

    }
    else if(playerScore == 21){
        roundWon = true;
        announcementNode.textContent = "you won!"
    }

  })
  .catch(error => {
    console.log("error")
  })
}

function dealerPlays() {
  if(roundWon === true || roundLost === true || roundTied === true){
    return;
  }
  dealerScore = `${computeScore(dealerCards)}`;
  dealerScoreNode.textContent = dealerScore;

  if (dealerScore < 17) {
    // a delay here makes for nicer game play because of suspence.
    setTimeout(()=>hitMe('dealer'), 200)
  }
  else if (dealerScore > 21) {
    roundWon = true;
    announcementNode.textContent = "You won!"
  }
  else if (dealerScore > playerScore) {
    roundLost = true;
    announcementNode.textContent = "You lost!"
  }
  else if (dealerScore === playerScore) {
    roundTied = true;
    announcementNode.textContent = "It's a tie!"
  }
  else if (dealerScore == 21) {
    roundLost = true;
    announcementNode.textContent = "Dealer wins!"
  }
  else {
    roundWon = true;
    announcementNode.textContent = "you win!"
  }

}
