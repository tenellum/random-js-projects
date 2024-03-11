class Card{
    value: number;
    src: string;
    backside_src: string = '1B';
    file_path_prefix: string = 'cards/';
    file_path_suffix: string = '.svg';
    constructor(value: number, src: string){
        this.value = value;
        this.src = src;
    }

    getImageFilePath(isVisible: boolean): string{
        if (isVisible){
            return this.file_path_prefix + this.src + this.file_path_suffix;
        }
        else{
            return this.file_path_prefix + this.backside_src + this.file_path_suffix;
        }
    }
}

var fullDeckArray: Array<Card> = [
    new Card(11, 'AC'),
    new Card(11, 'AD'),
    new Card(11, 'AH'),
    new Card(11, 'AS'),
    new Card(2, '2C'),
    new Card(2, '2D'),
    new Card(2, '2H'),
    new Card(2, '2S'),
    new Card(3, '3C'),
    new Card(3, '3D'),
    new Card(3, '3H'),
    new Card(3, '3S'),
    new Card(4, '4C'),
    new Card(4, '4D'),
    new Card(4, '4H'),
    new Card(4, '4S'),
    new Card(5, '5C'),
    new Card(5, '5D'),
    new Card(5, '5H'),
    new Card(5, '5S'),
    new Card(6, '6C'),
    new Card(6, '6D'),
    new Card(6, '6H'),
    new Card(6, '6S'),
    new Card(7, '7C'),
    new Card(7, '7D'),
    new Card(7, '7H'),
    new Card(7, '7S'),
    new Card(8, '8C'),
    new Card(8, '8D'),
    new Card(8, '8H'),
    new Card(8, '8S'),
    new Card(9, '9C'),
    new Card(9, '9D'),
    new Card(9, '9H'),
    new Card(9, '9S'),
    new Card(10, 'TC'),
    new Card(10, 'TD'),
    new Card(10, 'TH'),
    new Card(10, 'TS'),
    new Card(10, 'JC'),
    new Card(10, 'JD'),
    new Card(10, 'JH'),
    new Card(10, 'JS'),
    new Card(10, 'QC'),
    new Card(10, 'QD'),
    new Card(10, 'QH'),
    new Card(10, 'QS'),
    new Card(10, 'KC'),
    new Card(10, 'KD'),
    new Card(10, 'KH'),
    new Card(10, 'KS'),
]

class CardStack{
    cards: Array<Card>;
    constructor(fullDeck: boolean = false, shuffleAfter: boolean = true, cards: Array<Card> = []){
        if (fullDeck){
            // Load full deck from json
            this.cards = fullDeckArray;
        }
        else{
            this.cards = cards;
        }
        if (shuffleAfter){
            this.shuffle();
        }
    }

    add(card: Card, shuffleAfter: boolean = true){
        let new_card: Card = card;
        this.cards.push(new_card)
        if (shuffleAfter){ this.shuffle() }
    }
    remove(shuffleBefore: boolean = true): any{
        if (this.cards.length > 0){
            if (shuffleBefore){ this.shuffle() }
            let card = this.cards.pop()
            if (card != undefined){
                return card;
            }
        }
        else{
            return -1;
        }
        
    }
    shuffle(){
        if (this.cards.length > 0){
            let rand: number, rand_card: Card;
            for(let i = this.cards.length - 1; i > 0; i--){
                rand = Math.floor(Math.random() * (i + 1));
                rand_card = this.cards[i];
                this.cards[i] = this.cards[rand];
                this.cards[rand] = rand_card;
            }
        }
    }
    
    value(): number{
        let result: number = 0;
        let aces: number = 0;
        for (let card of this.cards){
            result += card.value;
            if (card.value == 11){ aces++; }
        }
        for (let i = 0; i < aces; i++){
            if(result > 21){
                result -= 10;
            }
            else{
                break;
            }
        }
        return result;
    }
}

class Player{
    id: string;
    hand: CardStack;
    visible: boolean;
    chips: number;
    last_bet: number = 0;
    can_draw: boolean = true;
    can_double: boolean = true;
    constructor(id: string, visible: boolean, hand: CardStack = new CardStack()){
        this.id = id;
        this.visible = visible;
        if (Number(localStorage.getItem('chips')) == 0){
            this.chips = 1000;
        }
        else{
            this.chips = Number(localStorage.getItem('chips'));
        }
        this.hand = hand;
    }

    bet(ammount: number, doubled: boolean = false): number{
        if (ammount < 0){ ammount = 0; console.log('use gain to add chips')}
        if (ammount > this.chips){ ammount = this.chips; }
        this.chips -= ammount;
        this.last_bet = doubled ? ammount * 2 : ammount;
        localStorage.setItem('chips', String(this.chips));
        return ammount;
    }
    gain(ammount: number){
        if (ammount < 0){ ammount = 0; console.log('use bet to remove chips')}
        this.last_bet = 0;
        this.chips += ammount;
        localStorage.setItem('chips', String(this.chips));
    }

    hit(): any{
        if(this.can_draw){
            let new_card: any = deck.remove()
            if (new_card != -1){
                this.hand.add(new_card);
            }
            else{
                deck = new CardStack(true);
                this.hand.add(new_card);
            }
            return new_card
        }
        return -1;
    }
    stand(){
        this.can_draw = false;
    }
    double(){
        if (this.can_double){
            this.bet(this.last_bet, true);
            //this.hit();
            //this.can_draw = false;
            this.can_double = false;
        }
    }
    split(){
    }
}


var play1 = new Player('player1', true);
var deal = new Player('dealer', false);
var deck = new CardStack(true);

var gameOverTimeout = 2000;



var nameSpan = document.getElementById('nameSpan');
if (nameSpan != null){
    nameSpan.innerHTML = String(play1.id);
}
var chipSpan = document.getElementById('chipSpan');
if (chipSpan != null){
    chipSpan.innerHTML = String(play1.chips);
}
var valueSpan = document.getElementById('valueSpan');
if (valueSpan != null){
    valueSpan.innerHTML = String(play1.hand.value());
}
var dealerValueSpan = document.getElementById('dealerValueSpan');
if (dealerValueSpan != null){
    dealerValueSpan.innerHTML = String(deal.hand.value());
}
var betSpan = document.getElementById('betSpan');
var gameResultGraph = document.getElementById('gameResultGraph');
function inputHandler(player: Player, cmd: string, div: string){
    if (cmd == 'bet'){
        let inputField: any = document.getElementById('betInput');
        if(inputField != null){
            if (player.bet(Number(inputField.value)) > 0){   
                if (chipSpan != null){
                    chipSpan.innerHTML = String(play1.chips);
                }
                if (betSpan != null){
                    betSpan.innerHTML = String(play1.last_bet);
                }
                
                let buttons: any = document.getElementsByClassName('playButton');
                for (let b of buttons){
                    b.disabled = false;
                }
                let button: any = document.getElementById('betButton');
                button.disabled = true;
                
                inputHandler(player, 'hit', div);
                inputHandler(player, 'hit', div);
                inputHandler(deal, 'hit', 'dealerHandDiv');
            }
            
        }
    }
    else {
        if(cmd == 'hit'){
            let drawn_card = player.hit();
            if (drawn_card != -1){
                let divEl: any = document.getElementById(div)
                if(divEl != null){
                    let img: HTMLImageElement = document.createElement('img');
                    img.src = drawn_card.file_path_prefix + drawn_card.src + drawn_card.file_path_suffix;
                    divEl.appendChild(img);
                }
            }
            if (valueSpan != null){
                valueSpan.innerHTML = String(play1.hand.value());
            }
            if (dealerValueSpan != null){
                dealerValueSpan.innerHTML = String(deal.hand.value());
            }
            if(player.hand.value() > 21){
                inputHandler(player, 'stand', div);
            }
        }
        if(cmd == 'stand'){
            player.stand();
            let buttons: any = document.getElementsByClassName('playButton');
            for (let b of buttons){
                b.disabled = true;
            }

            if(player.hand.cards.length == 2 && player.hand.value() == 21){
                console.log('Blackjack')
                if (gameResultGraph != null){ gameResultGraph.innerHTML = 'Blackjack!'; }
                let payout = player.last_bet + (player.last_bet * 3) / 2
                play1.gain(payout);
                setTimeout(function(){location.reload()}, gameOverTimeout);
            }
            else if(player.hand.value() > 21){
                console.log('Bust')
                if (gameResultGraph != null){ gameResultGraph.innerHTML = 'Bust...'; }
                setTimeout(function(){location.reload()}, gameOverTimeout);
            }
            else{
                handleDealer(player.hand.value());
            }
        }
        if(cmd == 'double'){
            if (player.chips >= player.last_bet || !player.can_double){
                player.double();
                if (chipSpan != null){
                    chipSpan.innerHTML = String(play1.chips);
                }
                if (betSpan != null){
                    betSpan.innerHTML = String(play1.last_bet);
                }
                inputHandler(player, 'hit', div);
                inputHandler(player, 'stand', div);
            }
            else{
                let but: any = document.getElementById('doubleButton');
                if (but != null){
                    but.disabled = true;
                }
            }
        }
    }
}


function handleDealer(player_value: number){
    if (deal.hand.value() < 17){
        setTimeout(function() {inputHandler(deal, 'hit', 'dealerHandDiv'); handleDealer(player_value);}, 1000);        
    }
    else {
        if (deal.hand.value() > 21){
            console.log('You win');
            if (gameResultGraph != null){ gameResultGraph.innerHTML = 'You Win.'; }
            play1.gain(play1.last_bet * 2);
            setTimeout(function(){location.reload()}, gameOverTimeout);
        }
        else{
            if (deal.hand.value() > player_value){
                console.log('Bust');
                if (gameResultGraph != null){ gameResultGraph.innerHTML = 'Bust...'; }
                setTimeout(function(){location.reload()}, gameOverTimeout);
            }
            else if (deal.hand.value() < player_value){
                console.log('You win');
                if (gameResultGraph != null){ gameResultGraph.innerHTML = 'You Win.'; }
                play1.gain(play1.last_bet * 2);
                setTimeout(function(){location.reload()}, gameOverTimeout);
            }
            else{
                console.log('Stand off');
                if (gameResultGraph != null){ gameResultGraph.innerHTML = 'Stand Off.'; }
                play1.gain(play1.last_bet);
                setTimeout(function(){location.reload()}, gameOverTimeout);
            }
        }
    }
}



function currentValueLog(obj: any){
    console.log(console.log(JSON.parse(JSON.stringify(obj))));
}