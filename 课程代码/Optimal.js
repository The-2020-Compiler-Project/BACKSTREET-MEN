// 优化
function Result(Isymbol, array) {
    let judge = 0;
    let indexOf = 0; // 第一个！位置
    let flag = 0;
    let list = array;
    let i = 0;

    /*function Token(value,type) {              //用于给语法分析返回数据
        this.value = value;
        this.type = type;
    }*/
    /*[
    new Token('a',"IT"),
    new Token('>=',"DT"),
    //new Token('(',"DT"),
    new Token('B',"IT"),
    new Token('*',"DT"),
    new Token('C',"IT"),
    //new Token(')',"DT")
] ;
*/

    if (typeof (list[i]) === 'string')
    {
        i = 1;
        flag = 1;
    }

    for (; i < list.length; i++) {
        let object = list[i];
        switch (object.type) {
            case "IT":
                list[i] = Isymbol.get(object.value);
                break;
            case "CC":
                list[i] = object.value.charCodeAt();
                break;
            case "CT":
                list[i] = parseFloat(object.value);
                break;
            case "DT":
                if (list[i].value === '!' && judge === 0) {
                    indexOf = i;
                    list[i] = '!';
                    judge++;
                } else if (list[i].value === '!' && judge !== 0) {
                    if (judge % 2 === 1) // 偶数个!
                    {
                        list[i] = '';
                        list[indexOf] = '';
                    } else // 奇数个!
                    {
                        list[i] = '';
                        list[indexOf] = '!';
                    }
                    judge++;
                } else // 如果不是！照常赋值就行
                    list[i] = list[i].value;

                break;
            default:
                break;
        }
    }

    list = list.join(" ");
    console.log(list);
    let newValue = eval(list);
    if(flag === 0) //
        return newValue;
    else
        return [list[0], newValue];
}

