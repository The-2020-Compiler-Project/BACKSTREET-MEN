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

- 前端基本要求（如果选这个课题的话，注意还有一个“自选一个感兴趣的与编译原理有关的问题”）
  - 变量说明语句、算术表达式、赋值语句必须实现；逻辑运算、if语句、while语句等选做
  - 扫描器设计实现
  - 语法分析器设计实现
  - 中间代码设计
  - 中间代码生成器实现
  
- 后端基本要求
  - 利用 VirtualMachine类 来配合 SymbolTable类 直接执行中间代码

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

对象 SyntaxParser 用于完成这个功能

实现 getLrList 进行分析得到LR分析表

实现 getSentence 读取 Token 序列，每次返回一个完整语句(一个Token数组)

getSentence 能够处理变量声明，赋值，表达式 (优先做) if for while 语句(按照顺序更新)

处理一些简单的语法错误并记录行号。

## 0x34 语义分析

SemanticParser.js 文件中

栈类 Stack  

四元式设计

四元式 Quat对象 (operation,param1,param2,result)

赋值语句 (=，中间变量1，_ ，result)  (如果是纸带赋值，则中间变量只能为1个长度的字符)

纸带左移(<-,tmp,_,_)   (tmp为纸带名)

纸带右移(->,tmp,_,_)   

exit  正常退出(jmp,_,_,-1)  异常退出(jmp,_,_,-2)

声明语句   获取标识符语义，填写符号表

四元式生成器

## 0x35 四元式优化及运行环境

Optimal.js 文件用于优化四元式

Runtime.js 文件用于写运行环境

- Bugs 类
    - log 方法用于记录错误行号及信息
    - 类本身可使用 for...of 来迭代
- SymbolTable 类
    - init 方法用于初始化并加入一个代表全局作用域的表
    - pushTable 方法用于加入一张表，在进入新的作用域时调用
    - popTable 方法用于删除最内层作用域的表，在离开作用域时调用
    - insertSymbol 方法用于在当前最内层作用域插入一条记录
    - getSymbolInfo 方法用于从最内层作用域向外查找一个符号，如果查到全局作用域还没找到则返回 undefined
- VirtualMachine 类
    - 接口待定

# 0x40 文法定义

