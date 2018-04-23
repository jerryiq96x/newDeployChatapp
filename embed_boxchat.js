window.onload = function()
{
    var mCount = 0;
    var cCount = 0;
    var createClientID = '';
    var ctIdentity = document.getElementById('client-identity').getAttribute('data-t-client-identity');
    var clientCookies = (getCookie('_t_client'))?JSON.parse(getCookie('_t_client')):[];
    // var clientConnect = new WebSocket('ws://wschatapdoantotnghiephq.herokuapp.com/box');
    var clientConnect = new WebSocket('ws://127.0.0.1:1337/box');
    clientConnect.onopen = function(){
        console.log('client is created');
        var obj = {
            detectSite: {
                site: window.location.hostname,
                ctId: ctIdentity
            }
        };
        clientConnect.send(JSON.stringify(obj));
        
        
    }
    clientConnect.onerror = function(error){
		console.log(error);
    }
    
    clientConnect.onmessage = function(message){
        try{
            var json = JSON.parse(message.data);
        }
        catch(e){
            console.log('Data type do not correct => ', json);
            return;
        }
        if(json.type === 'message')
        {
            if(!clientCookies._to)
            {
                var ckie = {
                    identity: createClientID,
                    _to: json.data.to
                };
                clientCookies = createCookie('_t_client',JSON.stringify(ckie),365);                
            }
            if(json.data.positionType==='m'){
				cCount=0;
				mCount+=1;
			}
			else{
				mCount=0;
				cCount+=1;
			}
            clientAddMessage(json.data.text,json.data.positionType,mCount,cCount);
        }
        else if(json.type === 'getMessBack'){
            if(json.data.positionType==='m'){
				cCount=0;
				mCount+=1;
			}
			else{
				mCount=0;
				cCount+=1;
			}
            clientAddMessage(json.data.text,json.data.positionType,mCount,cCount);
        }
        else if(json.type === 'DetectConnectStatus')
        {
            var status = (json.onAir)?'Online':'Offline';
            document.getElementsByClassName('t-chat-header')[0].className = 't-chat-header t-chat-'+status;
            document.getElementsByClassName('ch-button')[0].className = 'ch-button ch-button-'+status;
            document.getElementsByClassName('ch-title')[0].innerHTML = '';
            document.getElementsByClassName('ch-title')[0].innerHTML = status;
        }
        else if(json.type==='siteDeteted'){
            // detect if this site is correct
            if(json.data.length>0){
                createHTMLBox();                
                if(json.data[0].Status!=='use')
                {
                    var objDiv = document.getElementsByClassName("t-chat-body")[0];
                    objDiv.className = 'stop-service';
                    objDiv.appendChild(document.createTextNode('Website đang bị tạm ngừng cung cấp dịch vụ'));
                    document.getElementsByClassName('t-chat-typing')[0].remove();
                    return;
                }
                if(clientCookies.identity){
                    createClientID = clientCookies.identity;
                    var takeMess = {
                        getListMessage:{
                            clId: createClientID,
                            host: clientCookies._to
                        }
                    };
                    clientConnect.send(JSON.stringify(takeMess));
                }
                else{
                    createClientID = 'CL'+(new Date()).getTime();
                    var ckie = {
                        identity: createClientID,
                        _to: ''
                    };
                    clientCookies = createCookie('_t_client',JSON.stringify(ckie),365);
                }
                // createClientID = clientCookies.identity || 'CL'+(new Date()).getTime();
                var obj = {
                    createClient: {
                        type: 'client',
                        clId: createClientID,
                        ctId: ctIdentity
                    }
                };
                clientConnect.send(JSON.stringify(obj));

                //
                document.getElementById('typingHere').onkeydown = function(e){
                    if(e.keyCode === 13)
                    {
                        console.log(clientCookies);
                        var msg = this.value;
                        var obj = {
                            mess: msg,
                            positionType: 'c',
                            status: 'notread',
                            from: clientCookies.identity || createClientID,
                            to: clientCookies._to || '',
                            who: clientCookies.identity || createClientID,
                            customer: ctIdentity
                        };
                        if(!msg) return;
                        clientConnect.send(JSON.stringify(obj));
                        this.value = '';
                    }
                }
                // if(document.getElementById('typingHere'))
                window.onbeforeunload = function(){
                    var clientCookies = JSON.parse(getCookie('_t_client'));
                    var obj = {
                        spliceClient: {
                            type: 'client',
                            idSplice: clientCookies.identity,
                            customer: ctIdentity
                        }
                    };
                    clientConnect.send(JSON.stringify(obj));
                }
            }//end detect
        }// message type
    }//connect function
}


function processStyleOutBox(here){
    here.style.display = 'none';
    var outBox = document.getElementById('outBox');
    outBox.style.display = 'block';
}
function closeBox(){
    document.getElementById('outBox').style.display = 'none';
    document.getElementById('talkBox').style.display = 'block';
}
function clientAddMessage(msg,positionType,mCount,cCount){
    var p = (positionType==='c')?'right':'left';
    var cbMessageLine = document.createElement('DIV');
        cbMessageLine.className = 'cb-message-line';
    
    var cbLineLeft = document.createElement('div');
        cbLineLeft.className = 'cb-line-'+p;
    var cbMessageText = document.createElement('div');
        cbMessageText.className = 'cb-message-text cb-type-'+p;
        
    var divMessText = document.createElement('div');
        divMessText.appendChild(document.createTextNode(msg));
    
    var cbMessageTime = document.createElement('span');
        cbMessageTime.className = 'cb-message-time time-type-'+p;
        cbMessageTime.appendChild(document.createTextNode('11:20'));

        
        cbMessageText.appendChild(cbMessageTime);
        cbMessageText.appendChild(divMessText);

    cbLineLeft.appendChild(cbMessageText);
    // cbLineLeft.appendChild(cbMessageTime);
    cbMessageLine.appendChild(cbLineLeft);
    document.getElementsByClassName('t-chat-body')[0].appendChild(cbMessageLine);
    var lineRight = document.getElementsByClassName('cb-type-right');
    var lineLeft = document.getElementsByClassName('cb-type-left');
    var classText = 'cb-message-text cb-type-'+p;
    if(cCount===1)
    {
        lineRight[lineRight.length-1].className = classText+' one-border-'+p;
    }
    else if(cCount===2)
    {
        lineRight[lineRight.length-2].className = classText+' first-border-'+p;
        lineRight[lineRight.length-1].className = classText+' last-border-'+p;
    }
    else if(cCount>2){
        lineRight[lineRight.length-2].className = classText+' mid-border-'+p;
        lineRight[lineRight.length-1].className = classText+' last-border-'+p;
    }
    if(mCount===1)
    {
        lineLeft[lineLeft.length-1].className = classText+' one-border-'+p;
    }
    else if(mCount===2)
    {
        lineLeft[lineLeft.length-2].className = classText+' first-border-'+p;
        lineLeft[lineLeft.length-1].className = classText+' last-border-'+p;
    }
    else if(mCount>2){
        lineLeft[lineLeft.length-2].className = classText+' mid-border-'+p;
        lineLeft[lineLeft.length-1].className = classText+' last-border-'+p;
    }
    var objDiv = document.getElementsByClassName("t-chat-body")[0];
    objDiv.scrollTop = objDiv.scrollHeight;
}

function createHTMLBox()
{
    var createParentDiv = document.createElement('DIV');
    var createParentDivText = document.createTextNode('Trò chuyện');
    createParentDiv.appendChild(createParentDivText);
    createParentDiv.className = 'parent-div';
    createParentDiv.id = 'talkBox';
    var bodyTag = document.getElementsByTagName('BODY');

    //create style tag
    var parentDivStyleTag = document.createElement('style');
    parentDivStyleTag.style = 'text/css';
    var styleList = `
        .parent-div{
            display: block;
            color: white;
            position: fixed;
            z-index: 1050;
            width: 80px;
            background-color: #e43030;
            left: 40px;
            bottom: 15px;
            text-align: center;
            border-radius: 50%;
            padding: 10px;
            border: 7px double white;
            cursor: pointer;
        }
        .parent-div:hover{
            background-color: #312a2a;
            transition: 0.3s all;
            color: white;
            border: 7px double #e43030;
            border-radius: 50%;
        }
    `;
    
    
    //chat main box
    var createChatBox = document.createElement('div');
        createChatBox.className = 'chat-out-box';
        createChatBox.id = 'outBox';

        //div header
    var divChatHeader = document.createElement('div');
        divChatHeader.className = 't-chat-header';
    var divHeaderTitle = document.createElement('div');
        divHeaderTitle.className = 'ch-title';
        // divHeaderTitle.appendChild(document.createElement('b').appendChild(document.createTextNode('O')));
    var divHeaderButton = document.createElement('div');
        divHeaderButton.className = 'ch-button';
    var closeButton = document.createElement('button');
        closeButton.appendChild(document.createTextNode('×'));
        closeButton.id = 'closeBox';
        divHeaderButton.appendChild(closeButton);
        divChatHeader.appendChild(divHeaderTitle);
        divChatHeader.appendChild(divHeaderButton);

        //div body
    var divChatBody = document.createElement('div');
        divChatBody.className = 't-chat-body';

        //div typing area
    var divTypingArea = document.createElement('div');
        divTypingArea.className = 't-chat-typing';

    var ctGroupButton = document.createElement('div');
        ctGroupButton.className = 'ct-group-button';
    var ctActionBtn = document.createElement('div');
        ctActionBtn.className = 'ct-action-btn';
    var buttonBar1 = document.createElement('hr');
        buttonBar1.className = 'ct-bar';
    var buttonBar2 = document.createElement('hr');
        buttonBar2.className = 'ct-bar';
    var buttonBar3 = document.createElement('hr');
        buttonBar3.className = 'ct-bar';
        ctActionBtn.appendChild(buttonBar1);
        ctActionBtn.appendChild(buttonBar2);
        ctActionBtn.appendChild(buttonBar3);
        ctGroupButton.appendChild(ctActionBtn);

    var ctTypingArea = document.createElement('div');
        ctTypingArea.className = 'ct-typing-area';
    var textArea = document.createElement('input');
        textArea.setAttribute('maxlength','5000');
        textArea.setAttribute('placeholder','Gửi tin nhắn....');
        textArea.id = 'typingHere';
        ctTypingArea.appendChild(textArea);

        divTypingArea.appendChild(ctGroupButton);
        divTypingArea.appendChild(ctTypingArea);
    //add to main box
    createChatBox.appendChild(divChatHeader);
    createChatBox.appendChild(divChatBody);
    createChatBox.appendChild(divTypingArea);

    //style chat box
    styleList += `
        .chat-out-box{
            position: fixed;
            z-index: 1050;
            display: none;
            width: 300px;
            height: 430px;
            left: 40px;
            bottom: 15px;
            background: #ffffff;
            box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
            border-radius: 10px;
            border-bottom-left-radius: 0px;
        }
        .stop-service{
            text-align: center;
        }
        .t-chat-header{
            
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .t-chat-Offline{
            background-color: #b51f1f;
        }
        .t-chat-Online{
            background-color: #1fb538;
        }
        .ch-title{
            color: white;
            font-weight: bold;
            text-align: center;
            width: 265px;
            padding-top: 10px;
            padding-bottom: 10px;
            float: left;
        }
        .ch-button{
            text-align: right;
        }
        .ch-button-Offline button{
            border-top-right-radius: 10px;
            background: #b51f1f;
            color: white;
            border: 1px;
            font-size: 14pt;
            padding: 7px;
            width: 35px;
        }
        .ch-button-Online button{
            border-top-right-radius: 10px;
            background: #1fb538;
            color: white;
            border: 1px;
            font-size: 14pt;
            padding: 7px;
            width: 35px;
        }
        .ch-button-Online button:hover{
            background: #076617;
        }
        .ch-button-Offline button:hover{
            background: #660707;
        }
        
        .t-chat-body{
            margin: 8px;
            height: 315px;
            overflow-y: auto;
            scroll-behavior: smooth;
        }
        .cb-message-text{
			color: white;
			width: fit-content;
			padding: 6px;			
			border-radius: 15px;
			max-width: 229px;
			word-wrap: break-word;
			font-size: 11pt;
			position: relative;
			
		}
		.cb-message-text:hover > .cb-message-time{
			display: block;
			
		}
		.cb-message-time{
			color: #5c5c5c;
			font-size: 9pt;
			position: absolute;
			top: 3px;
			padding: 5px;
			background: #252828;
			color: white;
			border-radius: 3px;
			display: none;
		}
		.time-type-left{
			right: -38px;			
			border-bottom-left-radius: 50%;
    		border-top-left-radius: 50%;
		}
		.time-type-right{
			left: -38px;
			border-bottom-right-radius: 50%;
    		border-top-right-radius: 50%;
		}
        .cb-line-right{
            float: right;
            clear: both;
            margin-bottom: 1px;
        }
        .cb-line-left{
            clear: both;
            margin-bottom: 1px;
        }
        .cb-type-left{
            background: #e6e6e6;	
            
            color: rgb(22, 22, 22);
        }
        .cb-type-right{
            background: #0ba224;			
            
        }
        .t-chat-typing{
            border-top: 2px solid #cfcfcf;
            padding-top: 5px;
        }
        .ct-group-button{
            width: 50px;
            padding: 15px;
            padding-top: 10px;
            float: left;
            clear: both;
        }
        .ct-bar{
            border: 3px solid #006e99;
            width: 20px;
            margin-bottom: 3px;
            margin-top: 3px;
        }
        .ct-action-btn{
            cursor: pointer;
        }
        #typingHere{
			margin-left: 7px;
			resize: none;
			width: 230px;
			border: none;
			font-size: 11pt;
		}
		#typingHere::placeholder{
			padding-top: 5px;
			font-size: 10pt;
			font-style: italic;
			color: #9b9b9b;
        }
        .one-border-right{
            border-top-right-radius: 5px;
            margin-bottom: 10px
          }
          .one-border-left{
            border-top-left-radius: 5px;
            margin-bottom: 10px
          }
          .first-border-right{
            /*border-top-right-radius: 20px;*/
            border-bottom-right-radius: 5px;
          }
          .mid-border-right{
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
          }
          .last-border-right{
            border-top-right-radius: 5px;
            /*border-bottom-right-radius: 20px;*/
            margin-bottom: 10px
          }
          .first-border-left{
            border-bottom-left-radius: 5px;
          }
          .mid-border-left{
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
          }
          .last-border-left{
            border-top-left-radius: 5px;
            margin-bottom: 10px
          }
    `;
    //add to html
    parentDivStyleTag.appendChild(document.createTextNode(styleList));
    bodyTag[0].appendChild(createParentDiv);
    bodyTag[0].appendChild(parentDivStyleTag);
    bodyTag[0].appendChild(createChatBox);

    //event
    document.getElementById('talkBox').onclick = function(){        
        processStyleOutBox(this);
        var objDiv = document.getElementsByClassName("t-chat-body")[0];
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    //click close button
    document.getElementById('closeBox').onclick = ()=>{
        closeBox();
    }

    var content = document.getElementsByClassName('t-chat-body');
    if(!window.WebSocket)
    {
        content[0].appendChild(document.createTextNode('Trình duyệt không được hỗ trợ. Vui lòng chuyển sang dùng Chrome'));
        document.getElementById('typingHere').setAttribute('disabled');
        return;
    }
}

//helper function
var createCookie = function(name, value, days) {
    var expires; 
    if (days) {
        var date = new Date(); 
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); 
        expires = "; expires=" + date.toGMTString(); 
    } else {
        expires = ""; 
    } 
    document.cookie = name + "=" + value + expires + "; path=/";

    var jsondt = getCookie(name);
    return JSON.parse(jsondt) || [];
}; 
var getCookie = function(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "="); 
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1; 
            c_end = document.cookie.indexOf(";", c_start); 
            if (c_end == -1) {
                c_end = document.cookie.length; 
            } 
            return unescape(document.cookie.substring(c_start, c_end)); 
        } 
    } 
    return ""; 
};
function delete_cookie( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getJSONP(url, success) {    
    var ud = '_' + +new Date,
        script = document.createElement('script'),
        head = document.getElementsByTagName('head')[0] 
                || document.documentElement;

    window[ud] = function(data) {
        head.removeChild(script);
        success && success(data);
    };

    script.src = url.replace('callback=?', 'callback=' + ud);
    head.appendChild(script);
    
}