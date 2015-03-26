var __request_code;
var __access_token_string;

function process_bookmarks ( bookmarks ) {
    document.getElementById("progress-icon").innerHTML = "<img height='50px' width='50px' src='uploading.gif'></img>"
    document.getElementById("progress-text").innerHTML = "Uploadig bookmarks to Pocket"
    console.log("Beginning import...")
    for ( var i =0; i < bookmarks.length; i++ ) {
        var bookmark = bookmarks[i];
        if ( bookmark.url ) {
            xmlhttp = make_xmlhttprequest("POST", "https://getpocket.com/v3/add", true)
            console.log( "Adding url: "+ bookmark.url );
            //chota_div = document.createElement('div')
            //chota_div.innerHTML= "Added Url:  "+ bookmark.url;
            //document.getElementById("progress").appendChild(chota_div)   
            xmlhttp.send("consumer_key="+ consumer_key +"&" + __access_token_string +"&url="+ encodeURI(bookmark.url) + "&tags=ChromeBookmarks")
        }

        if ( bookmark.children ) {
            process_bookmarks( bookmark.children );
        }
    }
    console.log("Completed import...")
}


function get_redirect_url () {
    return chrome.identity.getRedirectURL();
}

//TODO place your pocket consumer key here
function get_pocket_consumer_key () {
    return "your_consumer_key_here"
}

function make_xmlhttprequest (method, url, flag) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open(method, url, flag);
    xmlhttp.setRequestHeader( "Content-type","application/x-www-form-urlencoded" );
    return xmlhttp
}

function get_request_code (consumer_key) {
    redirect_url = get_redirect_url();
    xmlhttp = make_xmlhttprequest ('POST', 'https://getpocket.com/v3/oauth/request', true) 
    xmlhttp.onreadystatechange = function () {
        if ( xmlhttp.readyState === 4 ) {

            if (xmlhttp.status === 200){
                request_code = xmlhttp.responseText.split('=')[1];
                __request_code = request_code
                lauch_chrome_webAuthFlow_and_return_access_token(request_code);
                }
                else {
                    document.getElementById("progress-icon").innerHTML = "<img height='50px' width='50px' src='failed.png'></img>"
                    document.getElementById("progress-text").innerHTML = "Authentication failed!!"
                }
        }
    }
    xmlhttp.send("consumer_key="+ consumer_key +"&redirect_uri="+ redirect_url)

}

function get_access_token () {
    xmlhttp = make_xmlhttprequest('POST', 'https://getpocket.com/v3/oauth/authorize', true); 
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            access_token_string = xmlhttp.responseText.split('&')[0]
            __access_token_string = access_token_string
            chrome.bookmarks.getTree( process_bookmarks );

        }
    }
    xmlhttp.send( "consumer_key="+ consumer_key +"&code="+ request_code )
}

function lauch_chrome_webAuthFlow_and_return_access_token (request_code) {
    redirect_url = get_redirect_url();
    chrome.identity.launchWebAuthFlow(
        {'url': "https://getpocket.com/auth/authorize?request_token="+ request_code + "&redirect_uri="+ redirect_url, 'interactive': true},
        function(redirect_url) { 
            //Get access token
            get_access_token(consumer_key, request_code);
        });

}

function import_my_chrome_bookmarks () {
    document.getElementById("progress-icon").innerHTML = "<img height='50px' width='50px' src='authenticating.gif'></img>"
    document.getElementById("progress-text").innerHTML = "Authenticating with Poket"
    consumer_key = get_pocket_consumer_key();
    get_request_code(consumer_key);

}

window.onload = function(){
    import_my_chrome_bookmarks();
};
