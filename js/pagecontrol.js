/**
 * Created by rayline on 2016/7/7.
 */

var maxID = 0;
var lineCnt = 0;

function varNameSpeellCheck(s){
    return !!s.match(/^[a-z]([a-z]|[0-9])*$/i);
}

function varNameDuplicateCheck(s){
    return !variables.hasOwnProperty("_" + s);
}

function newLine(cnt){
    if(cnt==undefined) cnt = 1;
    for(var i=0;i<cnt;i++){
        lineCnt++;
        var a = $("#input-line-0").clone();
        var id = maxID;
        id++;
        maxID = id;
        if(id!=1)$(a).attr("id","input-line-"+id).appendTo("#lines-container").slideDown(100);else{
            $(a).attr("id","input-line-"+id).appendTo("#lines-container").show();
        }
        deleteButtonDisplayCheck();
    }
}

function deleteLine(b){
    if($(b).parent().parent().children().children().children().children(".variable-name").attr("disabled")=="disabled"){
        var vname = $(b).parent().parent().children().children().children().children(".variable-name").val();
    }else{
        vname = undefined;
    }
    $(b).parent().parent().slideUp(300, function(){
        $(b).parent().parent().remove();
    });
    deleteVar(vname);
    lineCnt--;
    deleteButtonDisplayCheck();
}

function deleteButtonDisplayCheck(){
    if(lineCnt==1){
        $(".delete").fadeOut(100);
    }else{
        $(".delete").show();
    }
}

function varNameChangeHandler(t){
    if($(t).val()==""){
        $(t).parent().removeClass("has-error").removeClass("has-success");
        return;
    }
    if($(t).parent().parent().parent().parent().attr("id")=="input-line-"+maxID){
        newLine();
    }
    if(varNameSpeellCheck($(t).val())&&varNameDuplicateCheck($(t).val())){
        $(t).parent().removeClass("has-error").addClass("has-success");
    }else{
        $(t).parent().removeClass("has-success").addClass("has-error");
    }
}


function calculate(t){
    $(t).attr("disabled","disabled");
    if($(t).parent().parent().children().children(".expression").val()==''){
        return;
    }
    var vname = $(t).parent().parent().children().children(".variable-name").val();
    if(vname!=""&&!varNameSpeellCheck(vname)&&varNameDuplicateCheck(vname)&&!$(t).parent().parent().children().children(".variable-name").parent().attr("disabled")=="disabled"){
        err("Invalid variable name!");
    }
    var res;
    var v = $(t).parent().parent().children().children(".expression").val();
    try{
        if(justNumber(v)){
            res = parseFloat(v);
        }else if(justMatrix(v)){
            res = JSON.parse(v);
        }else{
            res = evalMatExpression(v);
        }
    }catch(exception){
        $(t).removeAttr("disabled");
        $(t).parent().parent().children().children(".expression").parent().removeClass("has-success").removeClass("has-warning").addClass("has-error");
        $(t).parent().parent().children().children(".expression").val("Math error!");
        return;
    }
    $(t).parent().parent().children().children(".expression").val(JSON.stringify(res)).parent().removeClass("has-error").removeClass("has-warning").addClass("has-success");
    if(vname!=""){
        assign(vname, res);
        $(t).parent().parent().children().children(".variable-name").attr("disabled","").attr("title","Not allowed to change assigned variable names.");
    }
    $(t).removeAttr("disabled");
}

function assign(name, v){
    Object.defineProperty(variables, '_'+name, {
        configurable:true,
        enumerable:true,
        value:v
    });
}

function deleteVar(name){
    var F = new Function("delete variables._"+name+";");
    F();
}

function getVar(name){
    var F = new Function("return variables._"+name+";");
    return F();
}

function err(s){
    //TODO:error reporting
    alert(s);
}

function openMatrixView(t){
    var x,y;
    var varBox = $(t).parent().parent().children().children(".variable-name");
    if($(varBox).attr("disabled")=="disabled") {
        var v = getVar($(varBox).val());
    }else{
        try{
            v = evalMatExpression($(t).parent().parent().children().children(".expression").val());
        }catch (exception){
            err(exception);
            v = {};
        }
    }
        if(isMatrix(v)){
            x = v.length;
            y = v[0].length;
            drawMatrix(x,y);
            $("#rows").val(x.toString());
            $("#cols").val(y.toString());
            for(var i=0;i<x;i++){
                for(var j=0;j<y;j++){
                    $("#matrix-table-cell-"+i+"-"+j).val(v[i][j].toString());
                }
            }
        }else if(isNumeric(v)){
            //err("Assigning any matrix to this numeric variable will cause its loss!");
        }
    $(".hope-for-value").removeClass("hope-for-value");
    $(t).parent().parent().children().children(".expression").addClass("hope-for-value");
    $("#matrixView").modal('show');
}

function drawMatrix(x,y){
    x = parseInt(x);
    y = parseInt(y);
    if(isNaN(x)||isNaN(y)){
        return;
    }
    for(var i=0;i<x;i++){
        if($('#matrix-table-'+i).length==0)$("#matrix-table").append("<tr id='matrix-table-"+i+"'></tr>");
        for(var j=0;j<y;j++){
            if($('#matrix-table-'+i+'-'+j).length==0)$("#matrix-table-"+i).append("<td id='matrix-table-"+i+"-"+j+"' style='padding: 0' >"+"<input type='text' class='form-control matrix-table-cell' onchange='cellExpressionChangeHandler(this)' onblur='cellExpressionChangeHandler(this);loseAdvisor(this)' onfocus='getAdvisor(this)' id='matrix-table-cell-"+i+"-"+j+"'>"+"</td>");
        }
        var a = $('#matrix-table-'+i+'-'+y);
        while(a.length!=0){
            var b = a.next();
            a.remove();
            a = b;
        }
    }
    a = $('#matrix-table-'+x);
    while(a.length!=0){
        b = a.next();
        a.remove();
        a = b;
    }
    $('#matrixView').modal('handleUpdate');
}

function matrixResizeHandler(){
    drawMatrix($("#rows").val(),$("#cols").val());
}

function setMatrixToExpression(t){
    var mtable = $("#matrix-table");
    var x = mtable.children().children().length;
    var y = mtable.children().children().first().children().length;
    var mat = linalg.newMat(x,y);
    for(var i=0;i<x;i++){
        for(var j=0;j<y;j++){
            var v = $("#matrix-table-cell-"+i+"-"+j).val();
            if(v==""){
                mat[i][j]=0;
            } else {
                try{
                    mat[i][j] = parseFloat($("#matrix-table-cell-"+i+"-"+j).val());
                }catch (exception){
                    err("Invalid expression at row:"+i+" column:"+j);
                    return;
                }
            }
        }
    }
    var tar = $(".hope-for-value");
    $(tar).val(JSON.stringify(mat));
    expressionChangeHandler($(tar));
    $(tar).removeClass("hope-for-value");
    $("#matrixView").modal('hide');
}

function validExpression(v){
    //fake
    try{
        evalMatExpressionFake(v);
    }catch(exception){
        return false;
    }
    return true;
}

function justNumber(v){
    if(v==undefined) return false;
    if(isNumeric(v)) return true;
    if(v.match==undefined) return false;
    return !!v.match(/^(-{0,1}[0-9]+\.[0-9]+|-{0,1}[0-9]+)(|e(\+|-)[0-9]+)$/);
}

function justMatrix(v){
    //fake
    if(v==undefined) return false;
    if(v.match==undefined) return false;
    return !!v.match(/^\[( *\[ *(-{0,1}[0-9]+\.[0-9]+|-{0,1}[0-9]+)(|e(\+|-)[0-9]+) *(, *(-{0,1}[0-9]+\.[0-9]+|-{0,1}[0-9]+)(|e(\+|-)[0-9]+) *)*\]) *(, *(\[ *(-{0,1}[0-9]+\.[0-9]+|-{0,1}[0-9]+)(|e(\+|-)[0-9]+) *(, *(-{0,1}[0-9]+\.[0-9]+|-{0,1}[0-9]+)(|e(\+|-)[0-9]+) *)*\]) *)*\]$/);
}

function expressionNewLineChecker(t){
    if($(t).parent().parent().parent().parent().attr("id")=="input-line-"+maxID){
        newLine();
    }
}

function expressionChangeHandler(t){
    var v = $(t).val();
    if(v==""){
        $(t).parent().removeClass("has-error").removeClass("has-success").removeClass("has-warning");
        return;
    }
    expressionNewLineChecker(t);
    var vname = $(t).parent().parent().children().children(".variable-name").val();
    if(justMatrix(v)||justNumber(v)||validExpression(v)){
        $(t).parent().addClass("has-warning");
        if(settings.get("easyEvaluate")==true&&vname!=""&&varNameSpeellCheck(vname)&&(justNumber(v)||justMatrix(v))){
            assign(vname, JSON.parse(v));
            $(t).parent().parent().children().children(".variable-name").attr("disabled","").attr("title","Not allowed to change assigned variable names.");
            $(t).parent().removeClass("has-warning");
        }
        $(t).parent().removeClass("has-error").addClass("has-success");
    }else{
        $(t).parent().removeClass("has-success").addClass("has-error");
    }
}

function cellExpressionChangeHandler(t){
    var v = $(t).val();
    if(v==""){
        $(t).parent().removeClass("has-error").removeClass("has-success");
        return;
    }
    if(justMatrix(v)||justNumber(v)||validExpression(v)){
        $(t).parent().removeClass("has-error").addClass("has-success");
        v = evalMatExpression(v);
        $(t).val(v);
        if(justNumber(v)){
            $(t).parent().removeClass("has-error").addClass("has-success");
        }else{
            $(t).parent().removeClass("has-success").addClass("has-error");
        }
    }else{
        $(t).parent().removeClass("has-success").addClass("has-error");
    }
}

function getAdvisor(t){
    var o = $(t).parent().offset();
    var x = o.left;
    var y = o.top;
    var width = $(t).parent().width();
    var height = $(t).parent().height();
    if(x-width<0){
        $("#col-num-advisor").animate({
            left: x,
            top:y-height,
            width:width,
            height:height,
            opacity:0.5
        },200).text($(t).attr("id").replace('matrix-table-cell-',"").replace('-',","));
        return;
    }
    $("#col-num-advisor").animate({
        left: x,
        top:y-height,
        width:width,
        height:height,
        opacity:0.5
    },200).text(parseInt($(t).attr("id").replace(/matrix-table-cell-.*-/,""))+1);
    $("#row-num-advisor").animate({
        left: x-width,
        top:y,
        width:width,
        height:height,
        opacity:0.5
    },200).text(parseInt($(t).attr("id").replace("matrix-table-cell-","").replace(/-.*/,""))+1);
}

function loseAdvisor(t){
    if($(document.activeElement).hasClass("matrix-table-cell")) return;
    $("#col-num-advisor").animate({
        left: 0,
        top:0,
        width:0,
        height:0,
        opacity:0
    },200);
    $("#row-num-advisor").animate({
        left: 0,
        top:0,
        width:0,
        height:0,
        opacity:0
    },200);
}

function settingCheckBoxChangeHandler(t){
    settings.set($(t).attr("data-setting"), t.checked);
    Cookies.set('settings:'+$(t).attr("data-setting"), t.checked);
}

function openFileUpload(t){
    $(".hope-for-value").removeClass("hope-for-value");
    $(t).parent().parent().children().children(".expression").addClass("hope-for-value");
    $("#file-upload").modal('show');
}

function settingInputChangeHandler(t){
    settings.set($(t).attr("data-setting"), $(t).val());
    Cookies.set('settings:'+$(t).attr("data-setting"), $(t).val());
}

//settings
var settings = new Map;

//file upload
var fileContent = "";
function fileUploadChangeHandler(t){
    var file = t.files[0];
    if(file){
        $("#btn-set-file").attr("disabled","disabled").attr("title", "Reading file, please wait");
        getFileAsText(file);
    }
}

function getFileAsText(readFile) {

    var reader = new FileReader();

    // Handle progress, success, and errors
    reader.onload = fileLoaded;
    reader.onerror = fileErrorHandler;

    // Read file into memory as UTF-8
    reader.readAsText(readFile, "UTF-8");

}

function setFiletoExpression(){
    var target = $(".hope-for-value");
    target.val(fileContent);
    expressionChangeHandler(target);
}

function fileErrorHandler(e){
    err(e.target.error.name);
}

function fileLoaded(e){
    fileContent = e.target.result;
    $("#btn-set-file").removeAttr("disabled").removeAttr("title");
}

function addLineTutor(pos, name, expression){
    var t = $(pos);
    $(t).children().children().children().children(".expression").val(expression);
    $(t).children().children().children().children(".variable-name").val(name);
    expressionChangeHandler($(t).children().children().children().children(".expression"));
}

$(document).ready(function(){
    matrixResizeHandler();
    newLine();
    $(".advisor").mouseenter(function(event){
        $(this).animate({opacity:0},200);
    }).mouseleave(function(){
        $(this).animate({opacity:0.5},200);
    });

    var easyEvaluate = Cookies.get("settings:"+"easyEvaluate");
    var remoteEvaluate = Cookies.get("settings:"+"remoteEvaluate");
    var precision = Cookies.get("settings:"+"precision");
    if(easyEvaluate!=undefined) {
        easyEvaluate = JSON.parse(easyEvaluate);
        settings.set("easyEvaluate", easyEvaluate);
        $("#checkbox-easy-evaluate")[0].checked = easyEvaluate;
    }else {
        settingCheckBoxChangeHandler($("#checkbox-easy-evaluate")[0]);
    }
    if(remoteEvaluate!=undefined) {
        remoteEvaluate = JSON.parse(remoteEvaluate);
        settings.set("remoteEvaluate",remoteEvaluate);
        $("#checkbox-remote-evalutate")[0].checked = remoteEvaluate;
    }else {
        settingCheckBoxChangeHandler($("#checkbox-remote-evalutate")[0]);
    }
    if(precision!=undefined){
        precision = parseFloat(precision);
        settings.set("precision", precision);
        $("#input-setting-precision").val(precision.toString());
    }else{
        settingInputChangeHandler($("#input-setting-precision"));
    }

    console.info("Happy to see you here\nIt is a wise choice to use the console to calculate huge matrix\n" +
        "We only recommand you to use the following functions, and they are enough\n" +
        "assign(name, value) assigns a value to the variable\n" +
        "getVar(name) returns the value of the variable\n" +
        "evalMatExpression(expressoin) evaluates the value of the expression given and returns it\n" +
        "We have to say sorry for unable to build a GUI that strong, but we hope the console helps");

    newLine(3);
    addLineTutor("#input-line-1","ExA","[[1,2],[3,4]]");
    addLineTutor("#input-line-2","ExB","[[5,6],[7,8]]");
    addLineTutor("#input-line-3","Exc","det(ExA*(ExB+trans(ExA)))-trace(inv(ExA))");

    deleteButtonDisplayCheck();
});