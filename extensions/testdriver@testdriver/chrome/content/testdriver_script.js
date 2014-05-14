var mainWindow;
var auditeeBrowser;
var bHelpUpdate = false;
var tlsnLinkReady = true;
var tlsnStopReady = false;
var tlsnLinkVisitedCounter = 0;
var tlsnGetUrlsResponded = false;
var reqGetUrls;

 var linkArray;
var tlsnCipherSuiteList;

var tlsnCipherSuiteNames=["security.ssl3.rsa_aes_128_sha","security.ssl3.rsa_aes_256_sha","security.ssl3.rsa_rc4_128_md5","security.ssl3.rsa_rc4_128_sha"]

function tlsnSimulateClick(what_to_click) {
  var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  //prevent popup blocker
  Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).setBoolPref("dom.disable_open_during_load", false);
  what_to_click.dispatchEvent(event);
}

function tlsnInitTesting(){
    //get a global handle to the browser
    mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIWebNavigation)
                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                       .rootTreeItem
                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                       .getInterface(Components.interfaces.nsIDOMWindow);

    auditeeBrowser = mainWindow.gBrowser

    //ask the back end for a list of websites to visit
    reqGetUrls = new XMLHttpRequest();
    reqGetUrls.onload = responseGetUrls;
    reqGetUrls.open("HEAD", "http://127.0.0.1:27777"+"/get_websites", true);
    reqGetUrls.send();
    //wait for response
    setTimeout(responseGetUrls, 1000,0);
    return;

}
function responseGetUrls(iteration){
    if (typeof iteration == "number"){
    //give 5 secs for backend to respond
        if (iteration > 5){
            alert("responseGetUrls timed out");
            return;
        }
        if (!tlsnGetUrlsResponded) setTimeout(responseGetUrls, 1000, ++iteration)
        return;
    }

    //else: not a timeout but a response from the server
    tlsnGetUrlsResponded = true;
    var query = reqGetUrls.getResponseHeader("response");

    if (query !== "get_websites"){
        alert("Error - wrong response query header: "+query);
        return;
    }

    var tlsnUrlList = reqGetUrls.getResponseHeader("url_list");
    //alert("This:"+tlsnUrlList);
    var cipherSuiteList = reqGetUrls.getResponseHeader("cs_list");
    linkArray = tlsnUrlList.split(',');
    //alert("LA:"+linkArray)
    //alert("Link array 2"+linkArray[2]);
    //alert("Link array 7"+linkArray[7]);

    tlsnCipherSuiteList = cipherSuiteList.split(',');

    //urls received, start the connection over IRC
    var btn = content.document.getElementById("start_button");
    tlsnSimulateClick(btn);

    //wait for status bar to show readiness.
    setTimeout(respondToHelpUpdate,1000,0);
}

function respondToHelpUpdate(iteration){

    var help = document.getElementById("help").value;

    if (help.lastIndexOf("Navigat",0) !== 0){
        if (typeof iteration == "number"){
        //give 5 secs for backend to respond
            if (iteration > 40){
                alert("respondToHelpUpdate timed out");
                return;
            }
            setTimeout(respondToHelpUpdate, 1000, ++iteration);
            return;
        }
    }

    //we open all tabs, but not simultaneously (crude boolean locks
    //to force each link to wait for the previous)
    var linkArrayLength = linkArray.length ;
    for (var i=0;i<linkArrayLength;i++){
        var argsList = [linkArray[i],tlsnCipherSuiteList[i]];
        setTimeout(tlsnOpenLink,1000*i,argsList);
    }

    //another crude boolean lock will force the stop record
    //action to wait until all recordings are finished.
    setTimeout(tlsnStopRecord,1000);
}


setTimeout(tlsnInitTesting,1000);

function tlsnOpenLink(args){

    //a hack to open links synchronously
    if (tlsnLinkReady !== true){
        setTimeout(tlsnOpenLink,1000,args);
        return;
    }
    //grab the "lock"
    tlsnLinkReady = false;


    //set the cipher suite to be ONLY that in the given argument
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    var cs_int = parseInt(args[1]);
    for (var i=0;i<4;i++){
        if (i==cs_int){
            prefs.setBoolPref(tlsnCipherSuiteNames[i], true);
        }
        else {
            prefs.setBoolPref(tlsnCipherSuiteNames[i], false);
        }
    }

    //alert("With website: "+args[0]+", using cipher suite: "+args[1]);

    auditeeBrowser.selectedTab = auditeeBrowser.addTab(args[0]);
    setTimeout(tlsnRecord,6000);//TODO need to catch initial page load completion?

}

function tlsnRecord(){
    var btn = document.getElementById("button_record_enabled");
    tlsnSimulateClick(btn);
    setTimeout(respondToHelpUpdate2,1000,0);

}

function respondToHelpUpdate2(iteration){

    var help = document.getElementById("help").value;

    if (help.lastIndexOf("Navigat",0) !== 0){
        if (typeof iteration == "number"){
        //give 5 secs for backend to respond
            if (iteration > 60){
                alert("responseHelpUpdate2 timed out");
                return;
            }
            setTimeout(respondToHelpUpdate2, 1000, ++iteration);
            return;
        }
    }
    //we get here if the addon bar status says "Navigating to.."
    //which means the recording function has finished.
    tlsnLinkReady = true;
    tlsnLinkVisitedCounter++;
    if (tlsnLinkVisitedCounter == linkArray.length){
        tlsnStopReady = true;
    }

}


function tlsnStopRecord(){
    if (tlsnStopReady !== true){
        setTimeout(tlsnStopRecord,1000);
        return;
    }

    //reset prefs for file transfer
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    for (var i=0;i<4;i++){
            prefs.setBoolPref(tlsnCipherSuiteNames[i], true);
    }
    var btnStop = document.getElementById("button_stop_enabled");
    tlsnSimulateClick(btnStop);
    setTimeout(tlsnReceiveKeyboardInput,1000,0);

}

function tlsnReceiveKeyboardInput(iteration){
    var help = document.getElementById("help").value;
    if (help.lastIndexOf("Beginning the data transfer",0) !== 0){
        //give 40 secs for backend to respond
        if (iteration > 40){
                alert("tlsnReceiveKeyboardInput timed out");
                return;
         }
         setTimeout(tlsnReceiveKeyboardInput, 1000, ++iteration);
         return;
        }

    reqGetKeboardInput = new XMLHttpRequest();
    //reqGetKeboardInput.onload = responseGetKeyboardInput;
    reqGetKeboardInput.open("HEAD", "http://127.0.0.1:27777"+"/type_filepath", true);
    reqGetKeboardInput.send();
    //as of now, not bothering to wait for a response; should be fixed in case keyboard entry fails

    setTimeout(tlsnWaitForAuditCompletion, 1000,0);
    return;

}

function tlsnWaitForAuditCompletion(iteration){
    var help = document.getElementById("help").value;

    if (help.lastIndexOf("Auditing",0) !== 0){
        if (typeof iteration == "number"){
        //give 60 secs for backend to respond
            if (iteration > 60){
                alert("tlsnWaitForAuditCompletion timed out");
                return;
            }
            setTimeout(tlsnWaitForAuditCompletion, 1000, ++iteration);
            return;
        }
    }

    //the audit is fully completed. trigger the backend to do hash checks
    reqFinaliseTest = new XMLHttpRequest();
    //reqFinaliseTest.onload = responseGetKeyboardInput;
    reqFinaliseTest.open("HEAD", "http://127.0.0.1:27777"+"/end_test", true);
    reqFinaliseTest.send();
    //finished; there will be no response

}



