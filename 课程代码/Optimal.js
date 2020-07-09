// 优化
function Result() {
    let judge = 0;
    let indexOf = 0; // 第一个！位置
    let flag = 0;
    let i = 0;
    let head = undefined;
    console.log(stack.items);
    console.log(stack.items[1]);
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
stack.item*/

    if (typeof(stack.items[0]) === 'string')
    {
        flag = 1;
        head = stack.items.shift();
    }

    for (; i < stack.items.length; i++) {
        let object = stack.items[i];
        switch (object.type) {
            case "IT":
                stack.items[i] = SymbolTable.getVarSymbolInfo(object.value);
                console.log(stack.items[i]);
                if(stack.items[i] === undefined){
                    stack.items[i] = SymbolTable.getTapeSymbolInfo(object.value);
                    if(stack.items[i] === undefined)
                        Bugs.log(object.row,object.line,"SyntaxError: 使用了未申明变量");
                    else{
                        if(typeof(stack.items[i].value) === 'string')
                            stack.items[i] = stack.items[i].value.charCodeAt();
                        else stack.items[i] = stack.items[i].value;
                    }
                }
                else
                {
                    if(typeof(stack.items[i].value) === 'string')// "'c'" 123
                        stack.items[i] = stack.items[i].value.charCodeAt();
                    else stack.items[i] = stack.items[i].value;
                }
                break;
            case "CC":
                stack.items[i] = object.value.substring(1,2).charCodeAt();
                break;
            case "CT":
                stack.items[i] = object.value;
                break;
            case "DT":
                if (stack.items[i].value === '!' && judge === 0) {
                    indexOf = i;
                    stack.items[i] = '!';
                    judge++;
                } else if (stack.items[i].value === '!' && judge !== 0) {
                    if (judge % 2 === 1) // 偶数个!
                    {
                        stack.items[i] = '';
                        stack.items[indexOf] = '';
                    } else // 奇数个!
                    {
                        stack.items[i] = '';
                        stack.items[indexOf] = '!';
                    }
                    judge++;
                } else // 如果不是！照常赋值就行
                    stack.items[i] = stack.items[i].value;
                break;
            default:
                break;
        }
    }

    let list = stack.items.join(" ");
    console.log(list);
    console.log(stack.items);
    let newValue = eval(list);



    if(flag === 0) //
        stack.items = [newValue];
    else {
        let temp = SymbolTable.getVarSymbolInfo(head);
        console.log(temp);
        if(temp.type === "num") {}
        else {
            newValue = parseInt(newValue);
            newValue = newValue%128;
            newValue = String.fromCharCode(newValue);
        }
        stack.items = [head, newValue];
    }
}