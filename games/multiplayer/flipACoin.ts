export default class flipAcoin{
    betsOnTails:any;
    betsOnHeads:any;
    winner:any;
    // constructor(a){
    //     this.betsOnTails= a.betsOnTails;
    //     this.betsOnHeads= a.betsOnHeads;
    // }
    calculate(){
        const coinFlip:any = (Math.floor(Math.random())); 
        if(coinFlip===1){
            this.winner='tails';
        }
        else{
            this.winner='heads';
        }
    }
}