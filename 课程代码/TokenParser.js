let KW = ["char","tape","num"];       //关键字数组
let DT = ['-','>','<','='];     //界符数组
let returnNum=0;                //记录返回的值
let value = "";                     //存放token序列
let type = "";                       //显示单词类型
let test = ['a','_','b','8',' ','c','h','a','r','_','8'];              //用于测试的字符串变量
let location = 0;               //用于记录当前扫描的位置



//Token类
function Token(value,type) {              //用于给语法分析返回数据
    this.value = value;
    this.type = type;
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

    this.row = new Number();        //记录当前行数，用于错误收集

    this.str = new Array();

    this.load =function(str) {   //用于接收预处理后的字符串的方法
        this.str = str;
    }

    this.next = function () {   //用于返回给语法分析的方法
        if(location !== this.str.length){
            returnNum = 0;              //将returnNum置为0
            value = "";
            type = "";

            this.judgeKW();

            this.value1 = new Token(value,type);

            if(returnNum!==1){
                this.judgeCT();
                this.value1 = new Token(value,type);
                if(returnNum!==2){
                    this.judgeIT();
                    this.value1 = new Token(value,type);
                }
            }
            return this.value1;
        }
        else
            return "Over!";
    }


    this.judgeKW = function() {  //进行关键字的判断

        while(this.str[location] ===' '|| this.str[location]==='\t'){
            location++;
        }

        while(this.str[location]==='\n'){   //行数加一
            this.row++;
            location++;
        }

        if((this.str[location]>= 'a' && this.str[location]<= 'z' ) || (this.str[location]>= 'A' && this.str[location]<= 'Z') ){

            let arr = [];
            let k = 0;//arr的下标
                while(((this.str[location]>='0' && this.str[location]<='9')||this.str[location]==='_'||(this.str[location]>= 'a' && this.str[location]<= 'z' ) || (this.str[location]>= 'A' && this.str[location]<= 'Z')) &&(this.str[location] !== ' ' && location !== this.str.length)){
                    arr[k] = this.str[location];
                    value = arr.join('');       //将arr的内容以字符串的形式保存到value中
                    location++;
                    k++;
                }

            for(let keyword of KW) {
                if (value === keyword) {
                    returnNum = 1;        //为关键字，返回值为1
                    type = value;
                }
            }
                if(returnNum!==1){
                    location = location-k;  //不是关键字，因此要将location的值变为进入该函数之前的值

                }

        }


        this.judgeCT = function () {

            if((this.str[location]>='0' && this.str[location]<='9')||this.str[location]==='.'){

                let arr = [];
                let k = 0;//arr数组的下标
                while (((this.str[location]>='0' && this.str[location]<='9')||this.str[location]==='.'||this.str[location]==='-'||this.str[location]==='+'|| this.str[location]==='E'||this.str[location]==='e')&&(this.str[location] !== ' ' && location !== this.str.length)){

                      arr[k] = this.str[location];
                      value = arr.join('');     //将arr的内容以字符串的形式保存到value中
                      location++;
                      k++;
                }

                let num = this.initNumAutoMachine();

                if(num.judge(value)===true){
                    type="CT";
                    returnNum=2;    //为数字常量，返回值为2
                }
                else{
                    let bug = new Bugs();                    //出现数字错误 要进入Bug类中
                    bug.msgs = ["该数字常量有错误！"];
                    bug.log(this.row,msgs);

                }
            }

        }

    }


    this.judgeIT = function () {    //判断标识符的函数
        //console.log(location);
        if(this.str[location]==='_'||(this.str[location]>='a' && this.str[location]<='z')||(this.str[location]>= 'A' && this.str[location]<= 'Z') ){

            let arr = [];
            let k = 0;
            while (((this.str[location]>='0' && this.str[location]<='9')||this.str[location]==='_'||(this.str[location]>='a' && this.str[location]<='z')||(this.str[location]>= 'A' && this.str[location]<= 'Z'))&&(this.str[location]!==' '&&location!==this.str.length)){

                arr[k] = this.str[location];
                value = arr.join('');       //将arr的内容以字符串的形式保存到value中
                location++;
                k++;
            }
            let it = this.initITAutoMachine();
            if(it.judge(value)===true){
                type = "IT";
                returnNum = 3; //返回的数值为3代表为标识符
            }
            else{
                location = location-k;
            }
        }
    }


    this.initNumAutoMachine = function(){       //识别数字的自动机,返回一个AutoMachine类的数据
        let num = new AutoMachine();
        num.makePair(0, '.', 3 );
        num.makePair(1, '.', 2);

        for(let j=0;j<10;j++){
            let temp = j.toString();
            num.makePair(0,temp,1);
            num.makePair(1,temp,2);
            num.makePair(2,temp,2);
            num.makePair(3,temp,2);
            num.makePair(4,temp,6);
            num.makePair(5,temp,6);
            num.makePair(6,temp,6);
        }
        num.makePair(2,'E',4);
        num.makePair(2,'e',4);
        num.makePair(4,'+',5);
        num.makePair(4,'-',5);

        num.setEndState(2,6);

        return num;
    }


    this.initITAutoMachine = function () {
        let it = new AutoMachine();
        it.makePair(0,'-',2);
        it.makePair(1,'_',2);
        let arr = [];               //用于存放a-z的数组
        for(let j=0;j<26;j++){
            let alpha = String.fromCharCode(65+j);  //String的方法转化为字母A-Z
            arr.push(alpha);
        }
        for(let j = 0;j<26;j++){
            let alpha = String.fromCharCode(97+j);//转化为a-z
            arr.push(alpha);
        }
        for(let j = 0;j<arr.length;j++){
            it.makePair(0,arr[j],1);
            it.makePair(1,arr[j],1);
            it.makePair(2,arr[j],2);
        }
        for(let j=0;j<9;j++){
            let temp = j.toString();
            it.makePair(1,temp,1);
            it.makePair(2,temp,2);
        }
        it.setEndState(1,2);
        return it;
    }
}
let p = new TokenParser();      //建立一个空对象
p.load(test);
p.next();
p.next();
p.next();
