/**
 * Created by patrick on 16/11/25.
 */
function assertString(value1,value2){
    if(value1 !== value2){
        throw new Error("value1 !== value2");
    }
}
var gap = {
    name:"gap",
    go:function(){
        console.log(this.name);
    }
};


pck.use(['$string'],function($string){
    console.log($string.render('dao is {{dao}}',{dao:1}));
});
