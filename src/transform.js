/**
 * Created by patrick on 16/12/25.
 */
/**
 * {
 *      words:[
 *          {
 *              name:'',
 *              meanings:[
 *                  {
 *                     type:{
 *                          t_id:1,
 *                          t_name:'gao'
 *                     }
 *                  }
 *              ]
 *          }
 *      ]
 * }
 * {
 *      cocos:[
 *          {
 *              name:1
 *          }
 *      ]
 * }
 *config:{
 *  'words=>meaning=>type.t_name':'cocos=>coages'
 * }
 *config:{
 *  'words=>':{
 *      'meaning'
 *  }
 * }
 * */
function transform(originalData,config){
    var data;
    if(Array.isArray(originalData)){

    }else if('object' === typeof originalData){

    }
    return data;
}
function map(data,handlers){
    handlers.forEach(function(handler){
        handler(data);
    });
}
function transformConfigParse(pathString){
    var regex = /([a-zA-Z_]+(?:=>|\.))/g;
    var result;
    var pathList = [];
    var lastIndex = 0;
    while (result = regex.exec(pathString)){
        pathList.push(result[0]);
        lastIndex = lastIndex + result[0].length;
    }
    pathList.push(pathString.slice(lastIndex,pathString.length));
    console.log(pathList);
}
transformConfigParse('words=>meaning=>type.t_name');