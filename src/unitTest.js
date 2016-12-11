/**
 * Created by patrick on 16/11/25.
 */
function assert(option){
    if(option.test()){
        console.log('%c '+option.success, 'color: green');
    }else{
        option.error = option.error || "test don't pass";
        throw new Error(option.error);
    }
}
console.log("unit test peacock @version-"+pck.version);
/**
 * 测试$share是不是能共存一个对象
 * */
pck.use(['$share'],function($share){
    $share.name = 'gao';
});
pck.use(['$share'],function($share){
    assert({
        test:function(){
            return  'gao' === $share.name;
        },
        success:'$share test pass',
        error:'$share fail'
    });
});
/**
 *  测试url
 * */
var url = location.protocol+'//'+location.host+location.pathname+"?a=高&b=1&a=abc#gao";
location.href = url;
pck.use(['$url'],function($url){
    assert({
       test:function(){
           var params = $url.params;
           var paramA = $url.queryAll('a');
           return '1' === $url.query('b') &&
               '高' === paramA[0] &&
               'abc' === paramA[1];
       },
       success:'$url.query and $url.queryAll test pass'
    });
    assert({
        test:function(){
            return (
                '/index?a=1&b=abc#gao' === $url.genUrl({
                    path:'/index',
                    params:{a:1,b:'abc'},
                    hash: 'gao'
                }) &&
                'https://www.pabipabi.com:8080/test/a/b/c?name=gaoweiqiao&age=1&id=123#高' === $url.genUrl({
                    protocol:'https',
                    host:'www.pabipabi.com',
                    port: 8080,
                    path: '/test/a/b/c',
                    params: {name:'gaoweiqiao',age:1,id:123},
                    hash: '高'
                })
            );
        },
        success:'$url.genUrl test pass',
        error: '$url.genUrl test fail'
    });

});
/**
 * 测试 $object
 **/
pck.use(['$object'],function($object){
    assert({
        test:function(){
            return (
                true === $object.isNil(null) &&
                true === $object.isNil(undefined) &&
                false === $object.isNil(0) &&
                false === $object.isNil('') &&
                false === $object.isNil(false)
            )
        },
        success:'$object.isNil test pass'
    });
    assert({
        test:function(){
            return (
                true === $object.isFunction(function(){}) &&
                false === $object.isFunction({a:1})
            )
        },
        success:'$object.isFunction test pass'
    });
    assert({
        test:function(){
            return (
                JSON.stringify(['11','b_b','c+1','d-2']) === JSON.stringify($object.keyPath('11.b_b["c+1"][\'d-2\']'))
            )
        },
        success:'$object.keyPath test pass'
    });
    //todo: getKeyPath
});
/**
 * 测试 $string
 */
pck.use(['$string'],function($string){
    assert({
        test:function(){
            return 'asa' === $string.trim('   asa  ');
        },
        success:'$string.trim test pass'
    });
    assert({
       test:function(){
           return ('AbcZxc' === $string.camelCasify(' abc zxc') &&
                    'Abc1Qw2$Gfd' === $string.camelCasify('_abc1___qw2$_gfd') &&
                   '$aSdFaHjGd' === $string.camelCasify('$aSd-fa_hj+Gd')
           );
       },
        success:'$string.camelCasify test pass'
    });
    assert({
        test:function(){
            return ('abc-zxc' === $string.kebabCasify(' abc Zxc') &&
                'abc1-qw2$-gfd' === $string.kebabCasify('_abc1___qw2$_gfd') &&
                '$a-sd-fa-hj-gd' === $string.kebabCasify('$aSd-fa_hj+Gd')
            );
        },
        success:'$string.kebabCasify test pass'
    });
    assert({
        test:function(){
            return ('abc_zxc' === $string.snackCasing(' abc Zxc') &&
                'abc1_qw2$_gfd' === $string.snackCasing('_abc1___qw2$_gfd') &&
                '$a_sd_fa_hj_gd' === $string.snackCasing('$aSd-fa_hj+Gd')
            );
        },
        success:'$string.snackCasing test pass'
    });
});

