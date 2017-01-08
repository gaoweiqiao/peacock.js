/**
 * Created by patrick on 17/1/8.
 */
function assert(option){
    var log = document.createElement("div");
    var result;
    try{
        if( option.test()){
            console.log('%c '+option.success, 'color: green');
            log.classList.add('success');
            log.innerHTML = option.success;

        }else{
            option.error = option.error || "test don't pass";

            log.classList.add('error');
            log.innerHTML = option.error;
            //throw new Error(option.error);
        }
        document.body.appendChild(log);
    }catch(e){
        log.classList.add('error');
        log.innerHTML = e;
        document.body.appendChild(log);
    }


}
console.log("unit test peacock @version-"+pck.version);
var awesomeListener = function(msg){
    console.log(msg+' is awesome');
};
pck.use(['$bus'],function($bus){
    var coolListener = function(msg){
        console.log(msg+' is cool');
    };

    $bus.on('cool',coolListener);
    $bus.on('cool',awesomeListener);
});
pck.use(['$bus'],function($bus){
    $bus.send('cool','gaoweiqiao');
    $bus.un('cool',awesomeListener);
    $bus.send('cool','gwq');
});
pck.use(['$db'],function($db){
    $db.delete().from('gao').execute();
    $db.insertBatch([{gao:2},{gao:3},{gao:1},{gao:5}]).into('gao');
    var result = $db.select().from('gao').where(function(item){
        return item.gao < 4;
    }).orderBy(function(item1,item2){
        return item1.gao - item2.gao;
    }).execute();
    console.log(result);

});