// 1. create overlayFrame pointing to script on our debugger server domain
// 2. overlayFrame use long-polling ajax to fetch the debugging commands from debugger server
// 3. when debugging commands received, overlayFrame execute cross domain javascript codes on the
// domain of the page need to debug
// 4. after that, overlayFrame send the serializied execution results to debugger server

function getRemoteScript() {
    var remoteScript = document.getElementById('zhiping-remote-debugger');
    return remoteScript;
}

window.onload = function(){
    setTimeout(function(){
        var remote = getRemoteScript();
        var remote_src = remote.getAttribute('src') || remote.src;
        var id = remote_src.replace(/.*\?/, '');
        //TODO:get the remote host name from remote_src value, instead of hard coding
        var remote_url = 'http://172.168.30.199:10000/remote.html?' + id;
        iPanel.overlayFrame.location.href = remote_url;
        //hide overlayFrame
        iPanel.overlayFrame.resizeTo(0,0);
    },3000);
}
