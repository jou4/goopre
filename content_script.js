function trim(str){
    return str.replace(/^\s+|\s+$/g, "");
}

function parse(str){
    var i = 0, len = str.length;
    var c;
    var nested_object = 0;
    var in_string = false;
    var str_begin = "";

    var acc = [], item = "";

    while(i < len){
        c = str[i++];

        if( ! in_string && (c == "'" || c == '"')){
            str_begin = c;
            in_string = true;
            item += '"'
            continue;
        }
        if(in_string && c == "\\"){
            if(str[i] == "'" || str[i] == '"'){
                item += "\\";
                item += str[i++];
                continue;
            }
        }
        if(in_string && c == str_begin){
            str_begin = "";
            in_string = false;
            item += '"'
            continue;
        }

        if( ! in_string && c == "{"){
            nested_object++;
        }
        if( ! in_string && c == "}"){
            nested_object--;
        }

        if(c == ","){
            if( ! in_string && nested_object == 0){
                acc.push(item);
                item = "";
                continue;
            }
        }

        if( ! in_string && c.match(/\s/)){
            continue;
        }

        item += c;
    }

    if(item.length > 0){
        acc.push(item);
    }

    var result = [];

    acc.forEach(function(e){
        if(e[0] == "{"){
            result.push(eval("(" + e + ")"));
        }
        else if(e == "roomOptions"){
            result.push({
                title: "",
                roster: "nameOnly",
                hideIcon: "true"
            });
        }
        else{
            result.push(eval(e));
        }
    });

    return result;
}



var str = document.body.innerHTML;
var tmp;

tmp = str.split("_initTeamSlideshow(");
str = trim(tmp[1]);

tmp = str.split("_stop");
str = trim(tmp[0]);

str = str.replace(/\);$/, "");

console.log(str);
chrome.extension.sendRequest(parse(str));
