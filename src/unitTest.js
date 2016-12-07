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

