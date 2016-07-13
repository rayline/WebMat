/**
 * Created by rayline on 2016/7/6.
 */

var variables = {};

function evalMatExpression(expression){
    /*
     evaluates an expression given from the web page into javascript evaluable expression, and replaces variables with a Map index
     RETURNS the expression with only functions but not operators!
     expression {string}
     expression definition:
     All variables with be altered into values
     a value is a expression
     expression S1, then (S1) is an expression
     expression S1, S2, then S1+S2, -S2, S1-S2, S1*S2, S1/S2 are expressions
     expression S1, func() is a function, then func(S1)/func(S1,S2) are expressions
     Only those above are expressions
     functions supported:
     plus(S1,S2)
     minus(S1,S2[optional])
     multiply(S1,S2)
     divide(S1,S2)
     inverse(S1)
     transpose(S1)
     determinant(S1)
     trace(S1)
     */
    try {
        var F = new Function("return "+evalMatExpressionToFunctionSequence(expression)+";");
        var res = F();
        if(isMatrix(res)){
            var x = res.length;
            var y = res[0].length;
            for(var i=0;i<x;i++){
                for(var j=0;j<y;j++){
                    res[i][j] = round(res[i][j]);
                }
            }
        }else{
            res = round(res);
        }
    }catch (exception){
        throw exception;
    }
    return res;
}

function evalMatExpressionFake(expression){
    //this function is the fake evaluation that avoid heavy computing to check out whether there is error in expression
    try {
        var F = new Function("return "+fakenExpression(evalMatExpressionToFunctionSequence(expression))+";");
        var res = F();
    }catch (exception){
        throw exception;
    }
    return res;
}

function fakenExpression(expression){
    if(expression==undefined) throw "Bad Expression!";
    return expression.replace(/[a-z]\(/ig,function(match){
        return match[0]+"F"+match[1];
    })
}

function evalMatExpressionToFunctionSequence(expression){
    /*
     evaluates an expression given from the web page into javascript evaluable expression, and replaces variables with their values
     RETURNS the expression with only functions but not operators!
     expression {string}
     expression definition:
     All variables with be altered into values
     a value is a expression
     expression S1, then (S1) is an expression
     expression S1, S2, then S1+S2, -S2, S1-S2, S1*S2, S1/S2 are expressions
     expression S1, func() is a function, then func(S1)/func(S1,S2) are expressions
     Only those above are expressions
     functions supported:
     plus(S1,S2)
     minus(S1,S2[optional])
     multiply(S1,S2)
     divide(S1,S2)
     inverse(S1)
     transpose(S1)
     determinant(S1)
     trace(S1)
     */
    expression = evalBrackets(expression);
    expression = replaceAll(replaceAll(expression,"<<<","("),">>>",")");//return the placeholders to brackets
    return (" "+expression).replace(/([_\)\( \],\+\-\*\/]|^)[a-z]([a-z]|[0-9])*(?!([a-z]|\())/ig,function(match){
        var v = match.substring(1);
        if(variables.hasOwnProperty("_"+v)){
            return match.charAt(0)+"variables._"+v;
        }else{
            throw "Variable " + v + " not defined!";
        }
    });
}

function evalBrackets(expression){
    //this function find brackets and evaluate them

    //turn [,] into [(),()]
    expression = replaceAll(replaceAll(replaceAll(expression, "[", "[("),",","),("),"]",")]");

    var bracketStack = [];
    for(var i=0;i<expression.length;i++){
        if(expression.charAt(i)=='('){
            bracketStack.push(i);
        }else if(expression.charAt(i)==')'){
            var front = bracketStack.pop();
            var end = i;
            //dealing with brackets for non-functions
            if(front==0||!isLetter(expression.charAt(front-1))){
                s1 = expression.substring(0,front);
                s2 = evalLevel0(expression.substring(front+1, end));
                s3 = expression.substring(end+1);
                expression = s1+s2+s3;
                i = s1.length+s2.length-1;
            }else{
                s1 = expression.substring(0,front)+"<<<";
                s2 = evalLevel0(expression.substring(front+1, end));
                s3 = ">>>"+expression.substring(end+1);
                expression = s1+s2+s3;
                i = s1.length+s2.length-1;
            }
        }
    }
    //console.log(expression);
    return evalLevel0(expression);
}

function evalLevel0(expression){
    //console.log(expression);

    //dealing with single minus at front
    if(expression.charAt(0)=='-'){
        expression = "minus("+expression.substring(1)+")";
    }

    return evalLevel1(expression);
}

function evalLevel1(expression){
    //console.log(expression);
    //this function finds and destroys + and -
    var opLine = [];
    for(var i=0;i<expression.length;i++){
        if(expression.charAt(i)=="+"){
            opLine.push([i,"+"]);
        }else if(expression.charAt(i)=="-"){
            opLine.push([i,"-"]);
        }
    }
    var res = "";
    if(opLine.length==0){
        return evalLevel2(expression);
    }else{
        for(i=opLine.length-1;i>=0;i--) {
            if (opLine[i][1] == "+") {
                res = res + "plus<<<";
            } else {
                res = res + "minus<<<";
            }
        }
        res+=evalLevel2(expression.substring(0,opLine[0][0]));
        opLine.push([expression.length,"+"]);
        for(i=0;i<opLine.length-1;i++){
            res+=','+evalLevel2(expression.substring(opLine[i][0]+1,opLine[i+1][0]))+'>>>';
        }
    }
    return res;
}

function evalLevel2(expression){
    //console.log(expression);
    //this function finds and destroys * and /
    var opLine = [];
    for(var i=0;i<expression.length;i++){
        if(expression.charAt(i)=="*"){
            opLine.push([i,"*"]);
        }else if(expression.charAt(i)=="/"){
            opLine.push([i,"/"]);
        }
    }
    var res = "";
    if(opLine.length==0){
        return expression;
    }else{
        for(i=opLine.length-1;i>=0;i--) {
            if (opLine[i][1] == "*") {
                res = res + "multiply<<<";
            } else {
                res = res + "divide<<<";
            }
        }
        res+=expression.substring(0,opLine[0][0]);
        opLine.push([expression.length,"*"]);
        for(i=0;i<opLine.length-1;i++){
            res+=','+expression.substring(opLine[i][0]+1,opLine[i+1][0])+'>>>';
        }
    }
    return res;
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function isNumeric(O){
    return((typeof O =="number"));
}

function isMatrix(O){
    //not fully judging whether a object is a matrix, but just checking whether it seems to be
    if(O!=undefined&&O.length!=undefined&& O[0]!=undefined&&O[0].length!=undefined&&O[0][0]!=undefined) return true;
}

function plus(S1, S2){
    if(isNumeric(S1)&&isNumeric(S2)){
        return S1+S2;
    }
    if(isMatrix(S1)&&isMatrix(S2)){
        return linalg.add(S1,S2);
    }
    throw "Unexpected types adding together "+JSON.stringify(S1)+" "+JSON.stringify(S2);
}

function minus(S1,S2){
    if(S2==undefined){
        if(isNumeric(S1)){
            return -S1;
        }else if(isMatrix(S1)){
            return linalg.minus(S1);
        }else{
            throw "Unexpected type of data "+JSON.stringify(S1);
        }
    }else{
        if(isNumeric(S1)&&isNumeric(S2)){
            return S1-S2;
        }else if(isMatrix(S1)&&isMatrix(S2)){
            return linalg.plus(S1,linalg.minus(S2));
        }else{
            throw "Unexpected type of data "+JSON.stringify(S1)+" "+JSON.stringify(S2);
        }
    }
}

function multiply(S1,S2){
    if(isMatrix(S1)&&isMatrix(S2)){
        if(S1[0].length!=S2.length) throw "Impossible to multiply Matrix with structure like this";
        if(settings.get("remoteEvaluate")&&S1.length*S1[0].length*S2[0].length>=100000000){
            try{
                var postRecvDta = "";
                $.ajax({
                    url:"api/calc",
                    data:JSON.stringify({
                        operation:"multi",
                        args:[S1,S2]
                    }),
                    method:"POST",
                    success:function(data){
                        postRecvDta = data;
                        console.log(data);
                    },
                    async:false,
                    datatype:"json"
                });
                return postRecvDta;
            }catch (exception){
                console.log(exception);
            }
        }
        return linalg.multi(S1,S2);
    }
    if(isNumeric(S1)&&isNumeric(S2)){
        return S1*S2;
    }
    if(isNumeric(S1)&&isMatrix(S2)){
        return linalg.scalarMulti(S2,S1);
    }
    if(isNumeric(S2)&&isMatrix(S1)){
        return linalg.scalarMulti(S1,S2);
    }
    throw "Unexpected type of data "+JSON.stringify(S1)+" "+JSON.stringify(S2);
}

function divide(S1,S2){
    if(isNumeric(S1)&&isNumeric(S2)){
        return S1/S2;
    }
    if(isMatrix(S1)&&isNumber(S2)){
        return linalg.scalarMulti(S1,1/S2);
    }
    throw "Unexpected type of data "+JSON.stringify(S1)+" "+JSON.stringify(S2);
}

function inverse(S1){
    if(!isMatrix(S1)){
        throw "Unexpected type of data "+JSON.stringify(S1);
    }
    if(S1.length!=S1[0].length){
        throw "Cannot calculate inverse of non-square matrix"
    }
    if(settings.get("remoteEvaluate")&&S1.length*S1.length*S1.length>=100000000){
        try{
            var postRecvDta;
            $.ajax({
                url:"api/calc",
                data:JSON.stringify({
                    operation:"inv",
                    args:[S1]
                }),
                method:"POST",
                success:function(data){
                    postRecvDta = data;
                },
                error:function(){
                    throw "error";
                },
                async:false,
                datatype:"json"
            });
            return postRecvDta;
        }catch (exception){
            console.log(exception);
        }
    }
    return linalg.inverse(S1);
}

function determinant(S1){
    if(!isMatrix(S1)){
        throw "Unexpected type of data "+JSON.stringify(S1);
    }
    if(S1.length!=S1[0].length){
        throw "Cannot calculate determinant of non-square matrix"
    }
    if(settings.get("remoteEvaluate")&&S1.length*S1.length*S1.length>=100000000){
        try{
            var postRecvDta;
            $.ajax({
                url:"api/calc",
                data:JSON.stringify({
                    operation:"det",
                    args:[S1]
                }),
                method:"POST",
                success:function(data){
                    postRecvDta = data;
                },
                error:function(){
                    throw "error";
                },
                async:false,
                datatype:"json"
            });
            return postRecvDta;
        }catch (exception){
            console.log(exception);
        }
    }
    return linalg.determinant(S1);
}

function transpose(S1){
    if(!isMatrix(S1)){
        throw "Unexpected type of data "+JSON.stringify(S1);
    }
    return linalg.transpose(S1);
}


function trace(S1){
    if(!isMatrix(S1)){
        throw "Unexpected type of data "+JSON.stringify(S1);
    }
    return linalg.trace(S1);
}

function det(S1){
    return determinant(S1);
}

function inv(S1){
    return inverse(S1);
}

function trans(S1){
    return transpose(S1);
}

function multiplyF(S1,S2){
    if(isMatrix(S1)&&isMatrix(S2)){
        if(S1[0].length!=S2.length) throw "Unable to multiply!";
        return linalg.newMat(S1.length, S2[0].length);
    }
    if(isNumeric(S1)&&isNumeric(S2)){
        return S1*S2;
    }
    if(isNumeric(S1)&&isMatrix(S2)){
        return S2;
    }
    if(isNumeric(S2)&&isMatrix(S1)){
        return S1;
    }
    throw "Unexpected type of data";
}

function divideF(S1,S2){
    if(isNumeric(S1)&&isNumeric(S2)){
        return 1;
    }
    if(isMatrix(S1)&&isNumber(S2)){
        return S1;
    }
    throw "Unexpected type of data";
}

function inverseF(S1){
    if(!isMatrix(S1)){
        if(S1.length!=S1[0].length) throw "Bad matrix to inverse";
        throw "Unexpected type of data";
    }
    return S1;
}

function determinantF(S1){
    if(!isMatrix(S1)){
        throw "Unexpected type of data";
    }
    return 1;
}

function transposeF(S1){
    if(!isMatrix(S1)){
        throw "Unexpected type of data";
    }
    return linalg.newMat(S1[0].length,S1.length);
}


function traceF(S1){
    if(!isMatrix(S1)){
        throw "Unexpected type of data "+JSON.stringify(S1);
    }
    return 1;
}

function detF(S1){
    return determinantF(S1);
}

function invF(S1){
    return inverseF(S1);
}

function transF(S1){
    return transposeF(S1);
}

function round(x){
    var p = settings.get("precision");
    return Math.round(x/p)*p;
}