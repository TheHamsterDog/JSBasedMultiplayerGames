export default class game {
    playerOne:any;
    playerTwo:any;
    constructor(a: any = {}) {
        this.playerOne = {wins:0, player:a.playerOne};
        this.playerTwo= {wins:0, player: a.playerTwo};
    }

    winner:any;

    round(a) {
        console.log(a);
        if (a.playerOne === 'rock' && a.playerTwo === 'paper') {
            ++this.playerTwo.wins;

            if(this.playerTwo.wins===2){
                return 2;
       
                
            }
            else if(this.playerOne.wins===2){
              return 3;
            }
            console.log(' ---- 1 --- ')
            return 1;

        }
        if (a.playerOne === 'paper' && a.playerTwo === 'rock') {
            
            ++this.playerOne.wins;

            if(this.playerTwo.wins===2){

                return 2;
            }
            else if(this.playerOne.wins===2){
                return 3;
            }
          
            return 1;
        }
        if (a.playerOne === 'scissors' && a.playerTwo === 'paper') {
            ++this.playerOne.wins;
            if(this.playerTwo.wins===2){

               return 2;
            }
            else if(this.playerOne.wins===2){
               return 3;
            }
            else{
                return 1;
            }
        }
        if (a.playerOne === 'paper' &&a.playerTwo === 'scissors') {
            ++this.playerTwo.wins;
            if(this.playerTwo.wins===2){

               return 2;
            }
            else if(this.playerOne.wins===2){
               return 3;
            }
            else{
                 return 1;
            }
        }
        if (a.playerOne === 'rock' && a.playerTwo === 'scissors') {
            ++this.playerOne.wins;
            if(this.playerTwo.wins===2){

               return 2;
            }
            else if(this.playerOne.wins===2){
               return 3;
            }
            else{
                return 1;
            }
        }
        if (a.playerOne === 'scissors' && a.playerTwo === 'rock') {
            ++this.playerTwo.wins;
            if(this.playerTwo.wins===2){

               return 2;
            }
            else if(this.playerOne.wins===2){
               return 3;
            }
            else{
                return 1;
            }
        }
        if (a.playerTwo === a.playerOne) {
            return 1;
        }
    }
}

