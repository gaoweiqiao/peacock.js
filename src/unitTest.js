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
pck.config({
    'gao':{
        say:function(){
            console.log("global");
        }
    }
});
var ctx = pck.with({
    'gao':{
        say:function(){
            console.log("temp");
        }
    }
});
pck.use(['gao'],function(gao){
    gao.say();
});
