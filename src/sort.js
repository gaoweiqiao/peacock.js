/**
 * Created by patrick on 16/12/29.
 */
/**
 * 快速排序
 * comparator:前面大于后面这<0;等于则等于0;前面小于后面则大于0
 * */
var data = [5,1,4,3,2,7,9,6];
function sort(data,comparator){
    function quickSort(data,start,end,comparator){
        if(start < end){
            var i =start;
            var j = end;
            var flag = data[start];
            while (i < j){
                while (i<j){
                    if(comparator(data[j],flag) >= 0){
                        data[i] = data[j];
                        break;
                    }else{
                        j--;
                    }
                }
                while (i < j){
                    if(comparator(data[i],flag) >= 0){
                        i++
                    }else{
                        data[j] = data[i];
                        break;
                    }
                }
            }
            data[i] = flag;
            quickSort(data,start,i,comparator);
            quickSort(data,i+1,end,comparator);
        }

    }
    quickSort(data,0,data.length-1,comparator);
    return data;
}

var data1 = sort(data,function(prev,next){
    return next - prev;
});
console.log(data1);
//
//function quickSort(array){
//    function sort(prev, numsize){
//        var nonius = prev;
//        var j = numsize -1;
//        var flag = array[prev];
//        if ((numsize - prev) > 1) {
//            while(nonius < j){
//                for(; nonius < j; j--){
//                    if (array[j] < flag) {
//                        array[nonius++] = array[j];　//a[i] = a[j]; i += 1;
//                        break;
//                    };
//                }
//                for( ; nonius < j; nonius++){
//                    if (array[nonius] > flag){
//                        array[j--] = array[nonius];
//                        break;
//                    }
//                }
//            }
//            array[nonius] = flag;
//            sort(0, nonius);
//            sort(nonius + 1, numsize);
//        }
//    }
//    sort(0, array.length);
//    return array;
//}