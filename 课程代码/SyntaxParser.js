SyntaxParser = function(){
    /* 语法分析对象
     * 通过调用词法分析的next接口得到token
     * 通过递归下降方法分析语法
     * 通过语义分析的接口实现语义动作
     */

    this.start = function(){
        this.next = this.tokenParser.next();
        this.grammarList();
        this.over();
    }

    this.over = function(){
        if(this.next.type === "exit"){
            this.next = this.tokenParser.next();
            this.numConstant();
        }
        else Bugs.log(this.next.row,this.next.line,"SyntaxError: 缺少exit语句 ");
    }

    this.grammarList = function(){
        /* 识别<语句表>
         */
        while(this.next.type === "tape" || this.next.type === "char" || this.next.type === "num" || this.next.type === "if" || this.next.type === "IT") {
            this.grammar();
        }
    }

    this.init = function(tokenParser, semanticParser, quatCreate, stack){
        this.stack = stack;
        this.stack.clear();
        this.quatCreate = quatCreate;
        this.quatCreate.init(stack, semanticParser);
        this.sp = semanticParser;
        this.tokenParser = tokenParser;
        this.sp.init();
    }

    this.grammar = function(){
        /* 识别语句
         * 分别为声明语句,赋值语句,exit语句
         */
          //  let flag = 0;
        switch(this.next.type){
            case "char":
            case "tape":
            case "num":
                this.sp.flag = this.next.type;
                this.next = this.tokenParser.next();
                this.state();
          //    flag = 1;
                break;
            case "IT":
                this.stack.push(this.next.value);
                this.next = this.tokenParser.next();
                this.evaluateOrMove()
          //    flag = 1;
                break;
          //case "if":
          //    this.ifSub();
          //    break;
            default:
                Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处只能是标识符或关键字 ");
        }
        //if(flag){
            if(this.next.value === ';'){
                this.next = this.tokenParser.next();
            }
            else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少; ");
        //}
    }

    this.state = function(){
        // 识别文法中的 state
        this.sub();
        while(true){
            if(this.next.value === ','){
                this.quatCreate.quatDeclare();
                this.stack.pop();
                this.next = this.tokenParser.next();
                this.sub();
            }
            else break;
        }
    }

    this.numConstant = function(){
        // 识别数字常量
        if(this.next.type !== "CT"){
            Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处只能是数字常量 ");
        }
        if(Number(this.next.value) === 0)
            this.quatCreate.quatExitNormally();
        else this.quatCreate.quatExitWrong();
        this.next = this.tokenParser.next();
    }

    this.sub = function(){
        // 识别文法中的sub
        if(this.next.type === "IT"){
            this.sp.judgeState(this.next,this.sp.flag);
            this.stack.push(this.next.value);
            this.next = this.tokenParser.next();
            this.operateOne();
        }
        else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少标识符 ");
    }

    this.operateOne = function(){
        // 识别文法中的operateOne
        if(this.next.value === '=') {
            this.next = this.tokenParser.next();
            this.orExp();
            //Result();
            this.quatCreate.quatDeclareEvaluate();
            this.stack.pop();
            this.stack.pop();
        }
        else{
            this.quatCreate.quatDeclare();
            this.stack.pop();
        }
    }

    this.operateTwo = function(){
        // 识别文法中的operateTwo
        switch(this.next.value){
            case "=":
                this.next = this.tokenParser.next();
                this.orExp();
                //Result();
                this.quatCreate.quatEvaluate();
                this.stack.pop();
                this.stack.pop();
                break;
            case "->":
                this.sp.judgeTapeDeclared(this.next,this.stack.items[this.stack.items.length-1]);
                this.quatCreate.quatTapeRight();
                this.stack.pop();
                this.next = this.tokenParser.next();
                break;
            case "<-":
                this.sp.judgeTapeDeclared(this.next,this.stack.items[this.stack.items.length-1]);
                this.quatCreate.quatTapeLeft();
                this.stack.pop();
                this.next = this.tokenParser.next();
                break;
            default:
                Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少操作符 ");
        }
    }

    this.evaluateOrMove = function(){
        // 识别文法中的evaluateOrMove
        this.operateTwo();
        this.evaluateOrMoves();
    }

    this.evaluateOrMoves = function(){
        // 识别文法中的evaluateOrMoves
        if(this.next.value === ','){
            this.next = this.tokenParser.next();
            if(this.next.type === "IT"){
                this.stack.push(this.next.value);
                this.evaluateOrMove();
            }
            else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少标识符 ");
        }
    }
    /* 下面三个子程序用来识别if语句
     * if语句支持没有else if和没有else的情况
     * 和C相比不同的两点是 1.大括号后必须要有; 2.不支持没有大括号只有一条语句的情况
     */
/*  this.ifSub = function() {
        if (this.next.value === "(") {
            this.next = this.tokenParser.next();
            this.orExp();
            Result();
            if (this.next.value === ")") {
                if(this.sp.num === 0) {
                    this.quatCreate.quatIf();
                    ifStack.push(quat.length-1);
                }
                if(this.sp.num === 1) {
                    this.quatCreate.quatGoto();
                    this.quatCreate.quatElsif();
                    otherStack.push(quat.length-1);
                    itemStack[ifStack.length-1]++;
                }
                this.next = this.tokenParser.next();
                if(this.next.value === "{"){
                    this.sp.num = 0;
                    this.next = this.tokenParser.next();
                    this.grammarList();
                    if(this.next.value === "}"){
                        this.next = this.tokenParser.next();
                        this.ifBranch();
                    }
                    else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少} ");
                }
                else Bugs.log(this.next.row,this.next.line,"SyntaxError: if语句的格式有错误 ");
            }
            else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少) ");
        }
        else Bugs.log(this.next.row,this.next.line,"SyntaxError: if语句的格式有错误 ");
    }

    this.ifBranch = function(){
        if(this.next.value === "else"){
            this.next = this.tokenParser.next();
            this.elseSub();
        }
        else{
            this.quatCreate.quatIe();
            let receive = otherStack.pop();
            quat[receive].result = quat.length-1;
            quat[receive-1].result = quat.length-1;
            let elseiflong = itemStack.pop()-1;
            for(let i=0; i < elseiflong; i++){
                let reReceive = otherStack.pop();
                quat[reReceive-1].result = quat.length - 1;  //goto赋值
                quat[reReceive].result = receive;
                receive = reReceive;
            }
            let arch = ifStack.pop();
            quat[arch] = receive;
        }
    }

    this.elseSub = function(){
        if(this.next.value === "if"){
            this.sp.num = 1;
            this.next = this.tokenParser.next();
            this.ifSub();
        }
        else if(this.next.value === "{"){
            this.quatCreate.quatGoto();
            this.quatCreate.quatElse();
            otherStack.push(quat.length-1);
            itemStack[ifStack.length-1]++;
            this.sp.num = 0;
            this.next = this.tokenParser.next();
            this.grammarList();
            if(this.next.value === "}"){
                this.quatCreate.quatIe();
                let receive = otherStack.pop();
                quat[receive].result = quat.length-1;
                quat[receive-1].result = quat.length-1;
                let elseIflong = itemStack.pop()-1;
                for(let i=0; i < elseIflong; i++){
                    let reReceive = otherStack.pop();
                    quat[reReceive-1].result = quat.length - 1;  //goto赋值
                    quat[reReceive].result = receive;
                    receive = reReceive;
                }
                let arch = ifStack.pop();
                quat[arch] = receive;
            }
            else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少} ");
        }
        else Bugs.log(this.next.row,this.next.line,"SyntaxError: if语句的格式有错误 ");
    }
*/
    /* 这里往下都是识别表达式的子程序
     * 方法是将高优先级运算符形成的表达式整体作为低优先级运算符形成的表达式的操作数
     * 单目运算符只支持取非(!)和取负(-)
     */
    this.orExp = function(){
        this.andExp();
        this.orSub();
    }

    this.orSub = function(){
        if(this.next.value === "||"){
          // this.stack.push(this.next);
            this.next = this.tokenParser.next();
            this.andExp();
            this.orSub();
        }
    }
    this.andExp = function(){
        this.cmpExp();
        this.andSub();
    }

    this.andSub = function(){
        if(this.next.value === "&&"){
           // this.stack.push(this.next);
            this.next = this.tokenParser.next();
            this.cmpExp();
            this.andSub();
        }
    }

    this.cmpExp = function(){
        this.addsExp();
        this.cmpSub();
    }

    this.cmpSub = function(){
        if(this.next.value === "<" || this.next.value === ">" || this.next.value === "<=" ||
        this.next.value === ">=" || this.next.value === "==" || this.next.value === "!=" ){
            // this.stack.push(this.next);
            this.next = this.tokenParser.next();
            this.addsExp();
            this.cmpSub();
        }
    }

    this.addsExp = function(){
        this.divsExp();
        this.addsSub();
        if(varStack.length === 1 && operaStack.length === 0)
            this.stack.push(varStack.pop());
    }

    this.addsSub = function(){
        if(this.next.value === "+" || this.next.value === "-"){
            operaStack.push(this.next.value);
            // this.stack.push(this.next);
            this.next = this.tokenParser.next();
            this.divsExp();
            this.quatCreate.quatOperation();
            this.addsSub();
        }
    }

    this.divsExp = function(){
        this.singleExp();
        this.divsSub();
    }

    this.divsSub = function(){
        if(this.next.value === "*" || this.next.value === "/" || this.next.value === "%"){
            // this.stack.push(this.next);
            operaStack.push(this.next.value);
            this.next = this.tokenParser.next();
            this.singleExp();
            this.quatCreate.quatOperation();
            this.divsSub();
        }
    }

    this.singleExp = function(){
        if(this.next.value === "!" || this.next.value === "-"){
            // this.stack.push(this.next);
            this.next = this.tokenParser.next();
            this.singleExp();
        }
        else this.data();
    }

    this.data = function () {
        if(this.next.value === "("){
            // this.stack.push(this.next);
            this.next = this.tokenParser.next();
            this.orExp();
            //Result();
            if(this.next.value === ")"){
                //this.stack.push(this.next);
            }
            else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处缺少) ");
        }
        else this.ends();
    }

    this.ends = function(){
        if(this.next.type === "IT" || this.next.type === "CC" || this.next.type === "CT"){
            // this.stack.push(this.next);
            varStack.push(this.next.value);
            this.next = this.tokenParser.next();
        }
        else Bugs.log(this.next.row,this.next.line,"SyntaxError: 此处只能是标识符或常量 ");
    }
};


/*TokenParser = function(){
    
    //test类

    Token = function(value,type){
        this.value = value;
        this.type = type;
    }
    this.next = function(){
        let next;
        console.log(this.token[0]);
        if(this.token.length === 0)
            return "Over";
        else{
            next = this.token[0];
            this.token.shift();
        }
        return next;
    }
    this.token = [new Token("char","char"),new Token("test","IT"),new Token(",","DT"),new Token(";","DT")];
}*/

