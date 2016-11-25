/**
 * Created by patrick on 16/11/25.
 */
function assertString(value1,value2){
    if(value1 !== value2){
        throw new Error("value1 !== value2");
    }
}
pck.module("stringUtil",pck.$string);

pck.inject(["stringUtil"],function(helper){
     var renderedString = helper.render("my name is {{ name }} and I am {{age}} years old.",{name:"gaoweiqiao",age:28});
    assertString("my name is gaoweiqiao and I am 28 years old.",renderedString);
});
