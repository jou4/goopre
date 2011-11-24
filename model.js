function getItem(key) { return getStorage().getItem(key); }
function setItem(key, map) { return getStorage().setItem(key, map); }
function removeItem(key) { return getStorage().removeItem(key); }
function getStorage() { return window.localStorage; }

var INDEX_DATA_KEY = "INDEX";

function addSlide(data){
    var id = data.attributes.revision.split(":")[0];
    var title = data.attributes.title;
    
    setItem(id, jQuery.toJSON(data));
    
    var index = getIndexData();
    index = index.filter(function(data){
        return data.id != id;
    });
    index.push({id: id, title: title, date: (new Date()).toString()});
    setIndexData(index);
}

function removeSlide(id){
    removeItem(id);
    
    var index = getIndexData();
    index = index.filter(function(data){
        return data.id != id;
    });
    setIndexData(index);
}

function getSlide(id){
    return jQuery.evalJSON(getItem(id));
}

function getIndexData(){
    var index = getItem(INDEX_DATA_KEY);
    if(index){
        return jQuery.evalJSON(index);
    }
    return [];
}

function setIndexData(index){
    setItem(INDEX_DATA_KEY, jQuery.toJSON(index))
}
