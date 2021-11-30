import axios from 'axios';
import db from './database';
class typingRace{
    text: string='';
    
    // players:any;
    async getText(){
        let text= db();
        this.text= text.text;
        return  text.text;
    }
    
    winner(speeds){
        const pool = speeds;
        function compare(a,b){
            let sort=0;
            if(a.speed>b.speed){
                sort = -1
            }
            else{
                sort = 1
            }
            return sort
        }
       return pool.sort(compare);
    }

}
export default typingRace;