//Token类
function Token(value,type,row,line) {              //用于给语法分析返回数据
    this.value = value;
    this.type = type;
    this.row = row;
    this.line = line;
}

//State类
function State() {
    this.state = new Map();
    this.setJmpRul = function (char , nextState) {
        this.state.set(char,nextState); //将char与下一个状态关联
    }

    this.jmpTo = function (char) {
        return this.state.get(char);    //提取与char对应的下一个状态
    }
}

//AutoMachine类
function AutoMachine() {
    this.endState = new Set();      //用于存放终结状态
    this.state = new Map();

    this.makePair = function (curState , char , nextState) {     //将char与nextState绑定
        if(this.state.has(curState)===false)
            this.state.set(curState, new State());

        if(this.state.has(nextState)===false)
            this.state.set(nextState, new State());

        this.state.get(curState).setJmpRul(char , nextState);   //将char与nextState绑定
    }

    this.setEndState = function (...indexes) {                      //添加终结状态
        for(let index of indexes){
            this.endState.add(index);
        }
    }

    this.judge = function (data) {                                  //判断数据是否正确，返回值为bool型的
        let curState = 0;

        try{
            for(let char of data){
                curState = this.state.get(curState).jmpTo(char);
            }
        }catch (TypeError) {
            return false;

        }
        return this.endState.has(curState);
    }
}


//TokenParser类
function TokenParser() {
    this.init = function (str) {
        this.location = 0;               //用于记录当前扫描的位置
        this.row = 1;                    //记录当前行数，用于错误收集
        this.line = 0;                   //记录当前列数
        this.load(str);


    }

    this.KW = ["char","tape","num","exit","if",];       //关键字数组
    this.str = new Array();
    this.DT = ['->','<-','=',';','-','<','(',')','>','!','{','}','*','/','+=','-=','*=','/='];     //界符数组


    this.load =function(str) {   //用于接收预处理后的数组的方法
        this.str = str;
    }

    this.next = function () {   //用于返回给语法分析的方法
        if(this.location !== this.str.length){

            this.value = "";
            this.type = "";
            this.returnNum = 0;              //可以根据该值来判断是否需要对该单词继续分析
            this.error = "SytnaxError:It has been unmeaning";   //用于声明字符常量少引号的错误
            this.judgeKW();
            if(this.returnNum === 1){               //如果等于1说明是关键字

                return new Token(this.value,this.type,this.row,this.line);
            }
            else if(this.returnNum === - 2){
                return new Token("Over!", "Over!", this.row, this.line);                               //如果等于-2说明换行符是在最后
            }

            this.judgeIT();
            if(this.returnNum === 2){               //如果等于2说明是标识符

                return new Token(this.value,this.type,this.row,this.line);
            }

            this.judgeNumCT();

            if(this.returnNum === 3){               //如果等于3说明是数字常量

                return new Token(this.value,this.type,this.row,this.line);
            }

            this.judgeCharCT();

            if(this.returnNum === 4){               //如果等于4说明是字符常量

                return new Token(this.value,this.type,this.row,this.line);
            }
            else if(this.returnNum === -1){         //如果等于-1说明少了个单引号，则抛出异常

                //throw new SyntaxError('The Character Constant misses a semicolon');

                return this.error;
            }
            this.judgeStringCT();

            if(this.returnNum === 5){               //如果等于5说明事字符串常量

                return new Token(this.value,this.type,this.row,this.line);
            }
            else if(this.returnNum === -1){         //如果等于-1说明少了一个双引号，则抛出异常
                //throw new SyntaxError('The String Constant misses a semicolon');

                return this.error;
            }
            this.judgeDT();
            if(this.returnNum === 6){               //如果等于6则说明是界符

                return new Token(this.value,this.type,this.row,this.line);

            }
        }
        if(this.returnNum!==-1){
            this.location++;
            this.value = "Over!";

            return new Token(this.value,this.type,this.row,this.line);;
        }

    }


    this.judgeKW = function() {  //进行关键字的判断
        while (this.str[this.location] === ' ' || this.str[this.location] === '\t') {

            this.location++;
            if(this.location === this.str.length){  //如果空格或者\t符在最后
                this.returnNum = -2;
            }
        }

        while (this.str[this.location] === '\n') {   //行数加一

            this.row++;         //遇到换行，行数加1
            this.location++;
            this.line = 0;      //遇到换行列数等于1
            if(this.location === this.str.length){      //如果换行符在最后
                this.returnNum = -2;
            }
        }

        if ((this.str[this.location] >= 'a' && this.str[this.location] <= 'z') || (this.str[this.location] >= 'A' && this.str[this.location] <= 'Z')) {

            let arr = [];   //建立一个空数组

            let k = 0;//arr的下标

            while (((this.str[this.location] >= '0' && this.str[this.location] <= '9') || this.str[this.location] === '_' || (this.str[this.location] >= 'a' && this.str[this.location] <= 'z') || (this.str[this.location] >= 'A' && this.str[this.location] <= 'Z')) && (this.str[this.location] !== ' ' && this.location !== this.str.length)) {
                arr[k] = this.str[this.location];
                this.location++;
                k++;

            }
            this.value = arr.join('');       //将arr的内容以字符串的形式保存到this.value中
            for (let keyword of this.KW) {
                if (this.value === keyword) {
                    this. returnNum = 1;        //为关键字，返回值为1
                    this.type = this.value;
                    this.line ++;               //列数加一
                }
            }

            if (this.returnNum !== 1) {         //不是关键字

                this.location = this.location - k;  //不是关键字，因此要将location的值变为进入该函数之前的值
            }
        }
    }


        this.judgeNumCT = function () {            //判断数字类型常量的函数

            if((this.str[this.location]>='0' && this.str[this.location]<='9')||this.str[this.location]==='.'){

                let arr = [];
                let k = 0;//arr数组的下标
                while (((this.str[this.location]>='0' && this.str[this.location]<='9')||this.str[this.location]==='.'||this.str[this.location]==='-'||this.str[this.location]==='+'|| this.str[this.location]==='E'||this.str[this.location]==='e')&&(this.str[this.location] !== ' ' && this.location !== this.str.length)){

                      arr[k] = this.str[this.location];
                      this.location++;
                      k++;
                }
                this.value = arr.join('');     //将arr的内容以字符串的形式保存到value中

                this.num = this.initNumAutoMachine();

                if(this.num.judge(this.value)===true){
                    this.type="CT";
                    this.line ++;
                    this.returnNum = 3;             //该单词为数字
                }
                else{
                    this.type="CT";
                    this.line++;
                    this.returnNum = 3;
                    Bugs.log(this.row,this.line,"该数字常量有错误呦-");             //出现数字错误 要进入Bug类中
                }
            }
        }


        this.judgeCharCT = function () {       //判断字符常量
        let result = true;

        if(this.str[this.location]==="'") {     //判断第一个符号是否为'

            let arr = [];
            arr.push(this.str[this.location++]);    //将单引号插入到arr中

            while(this.str[this.location]!=="'"&&this.location!==this.str.length){
                if(arr.length===1){             //当arr中只有一个字符的时候，设置该判断的目的是判断字符中\是否有效
                    if(this.str[this.location]==="\\"){

                        this.location++;
                        arr.push(this.str[this.location++]);//将\后面的字符插入arr中
                            if(this.str[this.location]==="'"){      //判断是否可以结束该字符的判断
                                arr.push("'");
                                this.location++;
                                this.value = arr.join('');
                                this.type = "CC";
                                this.line ++;
                                this.returnNum = 4;
                                return ;
                            }

                    }
                    else{                       //当第一个字符不是\时，区别就是\不插入arr中，若不是\则插入arr中
                        arr.push(this.str[this.location++]);
                        if(this.str[this.location]==="'"){

                            arr.push("'");
                            this.location++;
                            this.value = arr.join('');
                            this.type = "CC";
                            this.line ++;
                            this.returnNum = 4;
                            return ;
                        }
                    }
                }

                else{               //当arr中字符数量大于1时，即对之后的字符进行抛弃
                    result = false;
                    this.location++;
                    this.returnNum = -1;    //判定到数组的结尾仍然没有引号
                    if(this.str[this.location]==="'"){  //判断是否判断完毕
                        arr.push("'");
                        this.location ++;
                        this.value = arr.join('');
                        this.type = "CC";
                        this.line ++;
                        this.returnNum = 4;
                        return ;
                    }

                }
            }

            if(result === false){
                Warnings.log(this.row,this.line,"字符常量长度出现了问题");
            }

            if(this.returnNum === -1){

                Bugs.log(this.row,this.line,"您输入的字符常量少了一个引号");
                return;
            }
        }
    }

    this.judgeStringCT = function () {      //判断字符串常量

        if(this.str[this.location]==='"'){      //进入该判断的条件，首个字符是双引号
            this.location++;
            let arr = [];
            arr.push('"');                      //将双引号push到arr中

            while(this.location!==this.str.length&&this.str[this.location]!=='"'){      //一直读，直到扫描的位置到了数组的最后或者读到了双引号为止
                arr.push(this.str[this.location++]);
            }
            if(this.str[this.location]==='"'){  //判断从while中退出来是什么原因，如果是读到了双引号，则说明读到了字符串常量
                arr.push('"');
                this.location++;
                this.value = arr.join('');
                this.type = "CS";
                this.line++;
                this.returnNum = 5;
            }
            else{                               //已经读到了代码的最后也没有读到双引号，则报错，编译停止
                Bugs.log(this.row,this.line,"您输入的字符串常量少了一个分号");
                return ;
            }
        }
    }


        this.judgeIT = function () {    //判断标识符的函数

            if (this.str[this.location] === '_' || (this.str[this.location] >= 'a' && this.str[this.location] <= 'z') || (this.str[this.location] >= 'A' && this.str[this.location] <= 'Z')) {

                let arr = [];
                let k = 0;

                while (((this.str[this.location] >= '0' && this.str[this.location] <= '9') || this.str[this.location] === '_' || (this.str[this.location] >= 'a' && this.str[this.location] <= 'z') || (this.str[this.location] >= 'A' && this.str[this.location] <= 'Z')) && (this.str[this.location] !== ' ' && this.location !== this.str.length)) {

                    arr[k++] = this.str[this.location++];

                }
                this.value = arr.join('');       //将arr的内容以字符串的形式保存到value中
                this.it = this.initITAutoMachine();//调用自动机，这里用一个成员属性来调用，节省了资源

                if (this.it.judge(this.value) === true) {       //如果判断成功，该it是标识符，则对相应的量进行赋值
                    this.type = "IT";
                    this.line++;
                    this.returnNum = 2;             //识别标识符成功，returnNum值为4
                }
                else {                          //如果没有识别成功，则返回到扫描前的位置
                    this.location = this.location - k;
                }

            }

        }


        this.judgeDT = function () {        //识别DT数组中的界符

            let arr = [];
            let k = 0;       //arr的下标
            arr[k++] = this.str[this.location]; //将当前字符赋给arr

            if(((this.str[this.location]==='-'||this.str[this.location]==='<')&&this.str[this.location+1]==='-')||((this.str[this.location]==='-')&&this.str[this.location+1]==='>')||(this.str[this.location]==='+'&&this.str[this.location+1]==='+')){   //判断是否为--或者是<-

                this.location++;
                arr[k++] = this.str[this.location++];   //没有越界，则将第二个字符赋给arr
                this.value = arr.join('');          //将arr赋给value
            }
            else {
                this.value = arr.join('');              //将arr赋给value
                this.location++;                        //将当前扫描的地方加一

            }

            for(let dt of this.DT){                     //遍历数组

                if(this.value === dt){                  //判断是否在DT数组中
                    this.returnNum = 6;                 //为界符，returnNum置为5
                    this.type = "DT";
                    this.line++;
                    break;                              //若发现在DT数组中则不必继续搜索
                }
            }

            if(this.returnNum!==6){
               Bugs.log(this.row,this.line,"您输入的界符有错误");
            }

        }



        this.initNumAutoMachine = function () {       //识别数字的自动机,返回一个AutoMachine类的数据
            let num = new AutoMachine();
            num.makePair(0, '.', 3);
            num.makePair(1, '.', 2);

            for (let j = 0; j < 10; j++) {      //根据状态转换图进行相应的绑定
                let temp = j.toString();
                num.makePair(0, temp, 1);
                num.makePair(1, temp, 2);
                num.makePair(2, temp, 2);
                num.makePair(3, temp, 2);
                num.makePair(4, temp, 6);
                num.makePair(5, temp, 6);
                num.makePair(6, temp, 6);
            }
            num.makePair(2, 'E', 4);
            num.makePair(2, 'e', 4);
            num.makePair(4, '+', 5);
            num.makePair(4, '-', 5);

            num.setEndState(1, 2, 6);       //将1、2、6状态设为终止状态

            return num;
        }


       this.initITAutoMachine = function () {
            let it = new AutoMachine();

            it.makePair(0, '-', 2);
            it.makePair(1, '_', 2);

            let arr = [];               //用于存放a-z的数组

           for (let j = 0; j < 26; j++) {
                let alpha = String.fromCharCode(65 + j);  //String的方法转化为字母A-Z
                arr.push(alpha);
            }

            for (let j = 0; j < 26; j++) {
                let alpha = String.fromCharCode(97 + j);//转化为a-z
                arr.push(alpha);
            }

            for (let j = 0; j < arr.length; j++) {
                it.makePair(0, arr[j], 1);
                it.makePair(1, arr[j], 1);
                it.makePair(2, arr[j], 2);
            }

            for (let j = 0; j < 9; j++) {
                let temp = j.toString();
                it.makePair(1, temp, 1);
                it.makePair(2, temp, 2);
            }

            it.setEndState(1, 2);
            return it;
        }

}
let p = new TokenParser();      //建立一个空对象
p.init();
while (p.location <= p.str.length){
    p.next();
}