# 0x00 编程规范

1. 只提交必要的文件到代码仓库，IDE提供的项目相关文件以及目录中的无关文件都不要提交，避免造成污染（可以使用 .gitignore 文件来过滤无关文件，但这个文件本身也不能提交，因为每个人的内容都可能不一样）
2. 提交时若产生冲突则一定要解决，一定不能强制推送（前期分工合作不太可能出现冲突，后期修修补补时，对某个功能的改动一定要通知到每一个人，避免多人同时修改同一个地方）
3. 提交时的日志要清楚地写明本次改动的文件以及改动的地方，方便他人检查
4. 试图修改版本库中的分支结构前一定要通知每个人，包括合并，删除分支等（可能用不到）
5. 试图完全回退版本库并提交，一定要通知到每个人
6. 如果使用了 webstorm 作为开发用 IDE，在提交代码前最好保证通过其自带的代码检查，一些特殊情况可以无视；其他 IDE 可参考下文
7. 尽量避免使用全局变量，如果使用则一定要通知到团队中的每个人，避免变量冲突，尤其是对于弱类型语言
8. 一定避免使用无意义的变量名，比如 a, b 这类
9. 一个函数应该能够被容纳在一屏中，如果需要翻页才能看全时要考虑将其拆分
10. 在函数定义处写明参数作用，参数类型（如果是弱类型语言），以及函数的大概作用；一些功能非常明显的可以不写
11. js中，谨慎使用 var 关键字，推荐使用 let 或者 const
12. js中，变量名，属性名，方法名均采用小驼峰，类名采用大驼峰（参考内置对象）

# 0x10 成果预期


- 课设前端基本要求
  - 变量说明语句、算术表达式、赋值语句必须实现；逻辑运算、if语句、while语句等选做
  - 扫描器设计实现
  - 语法分析器设计实现
  - 中间代码设计
  - 中间代码生成器实现
  

- 课设后端基本要求
  - 利用 VirtualMachine类 来配合 SymbolTable类 直接执行中间代码
  
- Web 界面基本要求
  - 提供代码编辑器，显示行号，时间且技术允许的话根据文法来加入语法高亮
  - 提供 "编译" 和 "运行" 两个按钮
    - 点击 "编译" 后执行编译逻辑，有错误则将 Bugs 记录的错误显示给用户，精确到行、列；否则生成目标代码，可准备运行
    - 点击 "运行" 后执行运行逻辑，配合 VirtualMachine类 来将每条纸带的状态动态绘制到界面显示给用户
  - 在适合的地方编写语言说明文档
  
- 开发顺利的话，利用 GitPage 将项目放到公网上

# 0x20 分支结构确定

远程仓库里有三条分支：master、develop、report

master 作为主分支，每次提交都应该是一个可以运行的成品，成品随提交进行版本迭代

develop 作为开发分支，成员提交更新均提交到该分支内，提交时应保证本地运行没问题，分支成熟后合并到主分支作为一个版本

report 用来提交报告

# 0x30 编译过程分析

> 负责开发相关类的成员，在下文对应的子段中补充对外的接口方法与成员属性（边开发边写就好），比如 lineno 表示当前行数、load 方法用于加载输入等等，方法的调用规约如果已经写在代码中，文档这里就不用写了；文件名暂定如下，主要是为了先布置一下仓库结构，后期提交时可以改，但是文档这里要同步更新

## 0x31 预处理

PreProcessor.js 文件中

对象 PreProcessor 用于完成这个功能

支持单行注释，预处理要裁掉源程序中所有的注释，如果第一行有注释，则作为图灵机的描述放在 des 中

## 0x32 词法分析

TokenParser.js 文件中

对象 TokenParser 用于完成这个功能

实现 next 接口，每次调用返回一个 Token 元组

处理一些词法分析可以捕捉的错误；记录当前行号便于语法分析器提供错误的位置

## 0x33 语法分析

SyntaxParser.js 文件中
- 实现语法分析类
    - next用来保存调用词法分析接口返回的对象
    - tokenParser用来调用词法分析的方法
    - 类中各个以文法中非终结符命名的方法对应文法中各个子程序
    - 目前几个bug都仅仅是返回error字符串，没有加入bug对象中
- 加入了init方法
    - 在编译中每次只需要调用init方法不需要重新new一个新的对象，节省资源
- 加入了错误处理
   - 调用Bugs类将错误信息插入
   - 语法分析部分可能出现的错误信息有:
       - SyntaxError: 缺少exit语句
       - SyntaxError: 此处只能是标识符或关键字
       - SyntaxError: 此处缺少;
       - SyntaxError: 此处只能是数字常量
       - SyntaxError: 此处缺少操作符
       - SyntaxError: 此处缺少}
       - SyntaxError: if语句的格式有错误
       - SyntaxError: 此处缺少) 
- 实现算数表达式的识别
   - 方法是将高优先级运算符形成的表达式整体作为低优先级运算符形成的表达式的操作数
   - 支持表达式的嵌套
   - 支持的运算以及优先级（从上到下按优先级顺序）
       - this.data()  识别 ()
       - this.singleExp()  识别取非!和取负-
       - this.divsExp() 识别 * / %
       - this.addsExp() 识别 + - 
       - this.cmpExp() 识别 > >= < <= == !=
       - this.andExp() 识别 &&        - this.orExp() 识别 ||
- if语句的识别
   - if语句
       - 不支持判断条件后只有一条语句或没有语句时不写{}的格式
       - 支持没有else和else if分支
## 0x34 语义分析

SemanticParser.js 文件中

栈类 Stack  

四元式设计

四元式 Quat对象 (operation,param1,param2,result)

赋值语句 (=，中间变量1，_ ，result)  

     tips:  1.如果是纸带赋值，则中间变量只能为1个长度的字符 
            2.param1带引号时（如 'a'）代表值，不带引号时代表变量名     

纸带左移(<-,tmp, 位数 , _ )   (tmp为纸带名)  位数在1.0版本默认为1

纸带右移(->,tmp, 位数 , _)   

exit  正常退出(jmp, _ , _ ,-1)  异常退出(jmp, _ , _ ,-2)

声明语句   获取标识符语义，填写符号表
          
     tips:   1.在声明的同时未赋值  ( = , _ , tmp , result)    tmp为char、tape等类型关键字
             2.在声明的同时进行赋值( = , param1 , tmp , result)    tmp同上
      
四元式生成器

## 0x35 四元式优化及运行环境

Optimal.js 文件用于优化四元式

Runtime.js 文件用于写运行环境

- Bugs 类
    - log 方法用于记录错误行号及信息
    - 类本身可使用 for...of 来迭代
- SymbolTable 类
    - init 方法用于初始化并加入一个代表全局作用域的表，isRuntime 参数用于区分使用环境，默认为 false
    - pushTable 方法用于加入一张表，在进入新的作用域时调用
    - popTable 方法用于删除最内层作用域的表，在离开作用域时调用
    - insertSymbol 方法用于在当前最内层作用域插入一条记录，并针对非 tape 标识符返回是否重复插入
    - getVarSymbolInfo 方法用于从最内层作用域向外查找一个 char 或 num 的符号，如果查到全局作用域还没找到则返回 undefined
    - getTapeSymbolInfo 方法用于查找是否定义过一个 tape 变量（该类型无论在哪里定义都具有全局作用域，重复定义会覆盖）

- VirtualMachine 类
    - load 方法用于加载编译阶段产生的 Quat 数组，作为之后要执行的指令集
    - step 方法用于执行 PC 指向的指令，并根据指令来切换 PC 的值
    - getNowInstruction 方法用于获取当前 PC 指向的指令，返回一个格式化后的字符串
    
- TapeState 类
    作为运行阶段的符号表中 tape 变量的 SymbolInfo.value 指向的值，记录了纸带的内部状态
    - setData 方法用于在当前指针的位置设置一个值
    - leftMove 方法用于左移指针
    - rightMove 方法用于右移指针
    
- testBench 函数
    用一个符合 1.0 版本的指令集（Quat数组）来测试并运行虚拟机，后面不需要的话可以删掉
    **注意：输出 tape 变量时用了 console.table 方法，该方法在浏览器环境和node环境的表现不同，node环境是本意，即 tapeData 是随指令变化的**

# 0x40 文法定义
文法：

    <program> -> <grammraList><over>
    <over> -> <exit><numConstant>;
    <grammarList> -> <grammr><grammarList> | 空
    <grammr> -> <char><State>; | <tape><State>;| <num><State>; | <IT><evaluateOrMove>; | <if><ifsub>
    <State> -> <Sub> | <Sub>,<State>
    <Sub> -> <IT><operateOne>
    <operateOne> -> = <orExp> | 空
    <evaluateOrMove> -> <operateTwo><evaluateOrMoves>
    <evaluateOrMoves> -> ,<IT><evaluateOrMove> | 空
    <operateTwo> -> =<orExp> | "->" | "<-"
    <orExp> -> <andExp><orSub>
    <orSub> -> <||> <andExp><orSub> | 空
    <andExp> -> <cmpExp><andSub>
    <andSub> -> <&&> <cmpExp><andSub> | 空
    <cmpExp> -> <addsExp><cmpSub>
    <cmpSub> -> <cmps><addsExp><cmpSub> | 空
    <cmps> -> < | > | <= | >= | != | ==
    <addsExp> -> <divsExp><addsSub>
    <addsSub> -> <adds><divsExp><addsSub> | 空
    <adds> -> + | -
    <divsExp> -> <singleExp><divsSub>
    <divsSub> -> <divs><singleExp><divsSub> | 空
    <divs> -> * | / | %
    <singleExp> -> <single><singleExp>| <data>
    <single> -> ! | -
    <data> -> ( <orExp> ) | <ends>
    <ends> -> <IT> | <strConstant> | <numConstant>
    <ifSub> -> ( <orExp> ) { <grammarList> } <ifBranch>
    <ifBranch> -> <else><elseSub> | 空
    <elseSub> -> <if><ifSub> | { <grammarList> }