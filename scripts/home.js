
/**
* 
*	This was the main js which will do all event handling and decide what action to be perform.
* 
* @project   Function Space Code Challege
* @date      16/11/3014 
* @author    Rajesh,  <rajesh.rnagireddy@gmail.com>
* 
*/

/**
* Global variable which has device information(desktop/mobile).
**/
var device;

require(['dojo/query',
		'dojo/on',
		'dojo/dom',
		'dojo/dom-attr',
		'dojo/dom-class',
		'dojo/_base/array',
		'dojo/json',
		"dojo/dom-construct",
		"dojo/date/locale",
		"spaceUtils",
		"animate",
		"dojo/NodeList-traverse",
		"dojo/NodeList-manipulate",
		'dojo/domReady!'],function(query,on,dom,attr,domClass,array,json,domConstruct,locale,spaceUtils,animate) {
	var home = {
		model:{
			
			/**
			* Obj which contains login information
			**/
			loginObj : {},
			
			/**
			* method called to set login information to loginObj
			*Params : loginData
			**/
			createLogins : function(loginData) {
				home.model.loginObj[loginData.email] = loginData;
			},
			
			/**
			* method called to set default Broad Cast Data
			**/
			createBroadcastData : function() {
				var bdata = json.parse(dom.byId("BroadcastData").innerHTML);
				array.forEach(bdata,function(msgInfo) {
					msgInfo.date = home.controller.getSysTime(parseInt(msgInfo.msgId));
				});
				home.model.broadCastData = bdata;
			},
			
			/**
			* Obj contains alphabets coordinates
			**/
			alphabates : json.parse(dom.byId("alphabets").innerHTML),
			
			/**
			* array contains Broad Cast Data information
			**/
			broadCastData : [],
			
			/**
			* integer which determinates live feed count
			**/
			liveFeedCount : 3,
			
			/**
			* Obj contains logged in person information
			**/
			activeUser : {},
			
			/**
			* method called on load of page and initialize some methods in model 
			**/
			init : function() {
				home.model.loginObj = {}
				home.model.createBroadcastData();
				home.model.createLogins({
					email : "rajesh@functionspace.org".toUpperCase(),
					password : "abc123",
					name : "Rajesh",
					role : "Resistance Leader"
				});
			}
		},
		controller: {
		
			/**
			* method called on load of page and register click events for elements.
			* This method orchestrate between validate and submit.
			**/
			onClickActionEles : function() {
				on(dom.byId("main-content"),'[data-action-ele]:click',function(event) {
					var node = event.target,activeObj;
					if(node.tagName == "SPAN" && !attr.has(node,'data-action-ele')) {
						node = node.parentNode;
					}
					activeObj = spaceUtils.setActiveObj(node);
					if(home.controller.validateActiveObj(activeObj)) {
						home.controller.submit(activeObj);
					}
					
				});
			},
			
			/**
			* method called on every click if validation passes.
			* This method filters and call necessary methods.
			* params : activeObj - The obj which has configurations clicked element.
			**/
			submit : function(activeObj) {
				switch (activeObj.name) {
					case "signIn" :
						home.model.activeUser = home.model.loginObj[loginEmail.value.toUpperCase()];
						home.view.doAnimationsForLogin(activeObj);
						home.controller.dumpBroadCastDataIntoLiveFeed();
						home.view.showOrHideNoSaveMsg();
						break;
					case "signUp" :
						home.view.processForSignUp(activeObj);
						break;
					case "sendMessage" :
						home.controller.updateMasterBroadCastObj(activeObj);
						home.controller.dumpBroadCastDataIntoLiveFeed();
						break;
					case "saveMessage" :
						home.view.processForSaveingMessage(activeObj);
						break;
					case "writeComentA" :
						home.view.processForAddingComment(activeObj);
						break;
					case "likes" :
						home.view.processForAddingLikes(activeObj);
						break;
					case "disLikes" :
						home.view.processForAddingLikes(activeObj);
						break;
					case "mobileMenu" :
						spaceUtils.perfomMobileNavigation(activeObj);
						break;
					case "logout" :
						home.view.applyMenuCss(activeObj);
						spaceUtils.perfomMobileNavigation(activeObj);
						home.view.processForLogout(activeObj);
						break;
					case "saveMsg" :
						home.view.applyMenuCss(activeObj);
						spaceUtils.perfomMobileNavigation(activeObj);
						home.controller.dumpBroadCastDataIntoLiveFeed("fromSaveMenu");
						home.view.showOrHideNoSaveMsg("fromSaveMenu");
						home.view.doAnimationsForLogin(activeObj,"fromLeftMenu");
						break;
					case "BCMsg" :
						home.view.applyMenuCss(activeObj);
						spaceUtils.perfomMobileNavigation(activeObj);
						home.controller.dumpBroadCastDataIntoLiveFeed();
						home.view.showOrHideNoSaveMsg();
						home.view.doAnimationsForLogin(activeObj,"fromLeftMenu");
						break;
					default :
						return true;
				}
			},
			
			/**
			* method called on every click do validation.
			* This method interacts with validation frame work and return boolean accordingly.
			* params : activeObj - The obj which has configurations clicked element.
			**/
			validateActiveObj : function(activeObj) {
				if(spaceUtils.validate(activeObj)) {
					switch (activeObj.name) {
						case "signIn" :
							return home.controller.validateUser();
							break;
						default :
							return true;
					}
				} else {
					return false;
				}
			},
			
			/**
			* method called on click of login button
			* This method validates entered credentials.
			* params : activeObj - The obj which has configurations clicked element.
			**/
			validateUser : function(activeObj) {
				var loginEmailEle = dom.byId("loginEmail"),loginFlag = true,
					loginPswd = dom.byId("loginPswd");
				if(spaceUtils.isNull(home.model.loginObj[loginEmailEle.value.toUpperCase()])) {
					loginFlag =  false;
					spaceUtils.setSingleErrorInput(spaceUtils.getErrorObj(loginEmailEle,"LOGIN_FAIL"));
				} else if(home.model.loginObj[loginEmailEle.value.toUpperCase()].password != loginPswd.value) {
					loginFlag =  false;
					spaceUtils.setSingleErrorInput(spaceUtils.getErrorObj(loginPswd,"LOGIN_FAIL"));
				}
				return loginFlag;
			},
			
			/**
			* method called to display live feeds
			* This method will just render all the data present in broadCastData obj.
			* params : saveFlag - This flag will be passed on save message menu click to filter saved messages
			**/
			dumpBroadCastDataIntoLiveFeed : function(saveFlag) {
				var broadCastData = home.model.broadCastData,
					blankMsgFragment = dom.byId("liveFeedContainer_n"),
					blankCommentFragment = dom.byId("comments_n"),
					lifeFeedContent = dom.byId("lifeFeedContent"),newFeed,commentFeed,commentRoot,commentIndex;
					lifeFeedContent.innerHTML = "";
				array.forEach(broadCastData,function(bdata) {
					if(spaceUtils.isNull(saveFlag) || bdata.saveFlag == "Y") {
						newFeed = blankMsgFragment.cloneNode();
						newFeed.innerHTML = blankMsgFragment.innerHTML;
						lifeFeedContent.appendChild(newFeed);
						spaceUtils.reArrangePostions(lifeFeedContent.id, "_n", "_"+bdata.msgId, "", "$");
						dom.byId("mainUser_"+bdata.msgId).innerHTML = bdata.user;
						dom.byId("msgId_"+bdata.msgId).innerHTML = bdata.msgId;
						dom.byId("msgTime_"+bdata.msgId).innerHTML = bdata.date;
						dom.byId("mainMsg_"+bdata.msgId).innerHTML = bdata.message;
						dom.byId("role_"+bdata.msgId).innerHTML = bdata.role;
						dom.byId("likes_"+bdata.msgId).innerHTML = bdata.likes;
						dom.byId("disLikes_"+bdata.msgId).innerHTML = bdata.disLikes;
						dom.byId("userPic_"+bdata.msgId).style.background = home.controller.getAlphabetUrl("capital",bdata.user.toUpperCase()[0],"-11px -12px");
						if(bdata.user == home.model.activeUser.name) {
							domClass.add(dom.byId("liveFeedContainer_"+bdata.msgId),'blueBorder');
							domClass.add(dom.byId("likeSection_"+bdata.msgId),'hide');
							
						} else {
							domClass.add(dom.byId("liveFeedContainer_"+bdata.msgId),'greyBorder');
						}
						array.forEach(bdata.comments,function(comments,index) {
							commentFeed = blankCommentFragment.cloneNode();
							commentFeed.innerHTML = blankCommentFragment.innerHTML;
							commentRoot = dom.byId("commentsData_"+bdata.msgId);
							commentRoot.appendChild(commentFeed);
							commentIndex = "_"+bdata.msgId+"|"+index;
							spaceUtils.reArrangePostions(commentRoot.id, "_n",commentIndex, "", "$");
							dom.byId("commentUser"+commentIndex).innerHTML = comments.user;
							dom.byId("commentPic"+commentIndex).style.background = home.controller.getAlphabetUrl("small",comments.user.toUpperCase()[0],"-6px -8px");
							dom.byId("commentTime"+commentIndex).innerHTML = comments.date;
							dom.byId("comment"+commentIndex).innerHTML = comments.comment;
						});
					}
				});
				spaceUtils.hideGenericMsg()
			},
			
			/**
			* method called on click of send message
			* This method update broadCastData obj.
			* params : activeObj - The obj which has configurations clicked element.
			**/
			updateMasterBroadCastObj : function(activeObj) {
				var newMsg = {},bArray = [],
					bdata = home.model.broadCastData;
				newMsg.date = home.controller.getSysTime();
				newMsg.message = dom.byId("newMsg").value;
				newMsg.user =  home.model.activeUser.name;
				newMsg.role =  home.model.activeUser.role;
				newMsg.msgId =  home.model.liveFeedCount;
				newMsg.likes =  0;
				newMsg.disLikes =  0;
				newMsg.comments = [];
				newMsg.saveFlag = "N";
				home.model.liveFeedCount++;
				bArray.push(newMsg);
				home.model.broadCastData = bArray.concat(bdata);
				spaceUtils.clearEles(activeObj.rootid);
				
			},
			
			/**
			* method called to get system time
			* params : delayInHours - if this param presents it will return date with a delay in passed hours
			**/
			getSysTime : function(delayInHours) {
				var sysdate = new Date(),date,time;
				sysdate.setFullYear(3014);
				if(delayInHours) {
					sysdate.setHours(sysdate.getHours() - delayInHours);
				}
				date = locale.format(sysdate, {
								selector: "date",
						  datePattern: "dd MMMM yyyy"
						});
				time = locale.format(sysdate, {
						selector: "date",
				  datePattern: "h:m a"
				});
				return date + " at " + time;
			},
			
			/**
			* method called to get alphabet url
			* params : type - capital/small
			*		   character - required alphabet url
			*          defaultCords - if passed character url is not available, it will set to passed defaultCords
			**/
			getAlphabetUrl : function(type,character,defaultCords) {
				var coordinates = home.model.alphabates[type][character];
				if(spaceUtils.isNull(coordinates)) {
					coordinates = defaultCords;
				}
				return "url('images/"+type+".jpg') no-repeat scroll "+coordinates+" transparent";
			},
			
			/**
			* method called on load of page and initialize 
			* 1) inti method in model
			* 2) init method in view	
			* 3) some methods in controller 
			**/
			init:function(){
				home.model.init();
				home.view.init();
				home.controller.onClickActionEles();
			},
			destroy:function(){}
			 
		},
		view: { 
			
			/**
			* method called on load of page and perform Hide/Show Comments
			**/
			initilizeSlidingDivs : function() {
				var benefitsArrows =  query("[data-slides]"),ele,slidingDiv;
				on(dom.byId("main-content"),'[data-slides]:click', function(event) {
					ele = event.target;
					slidingDiv	= dom.byId(attr.get(ele,'data-slides'));
					if(slidingDiv) {
						if(domClass.contains(ele,'minus')) {
							domClass.remove(ele,'minus');
							domClass.add(ele,'plus');
							animate.wipeOut(slidingDiv,500);
						} else {
							domClass.remove(ele,'plus');
							domClass.add(ele,'minus');
							animate.wipeIn(slidingDiv,500);
						}
					}	
				});
			},
			
			/**
			* method called to display broad cast message page
			*Params : activeObj - The obj which has configurations clicked element.
			*       fromLeftMenu - to differentiate from login button/Broad Cast Message Menu
			**/	
			doAnimationsForLogin : function(activeObj,fromLeftMenu) {
				var lifeFeedSection = dom.byId("liveFeedSection"),
					loginSection = dom.byId("loginSection"),
					lefNav = dom.byId("lefNav"),
					fixedLeftNav = dom.byId("fixedLeftNav"),
					loginEmail = dom.byId("loginEmail"),
					welcomeSection = dom.byId("welcomeSection");
				if(spaceUtils.isNull(fromLeftMenu)) {
					home.view.applyMenuCss({activeElement : dom.byId("BCMsg")})
					animate.wipeOut(loginSection,500);
					domClass.remove(liveFeedSection,"hide");
					domClass.remove(lefNav,"hide");
					setTimeout(function() {
						animate.fadeIt(lifeFeedSection,1000);
						animate.fadeIt(lefNav,1000);
						domClass.remove(welcomeSection,'hide');
						dom.byId("welUsername").innerHTML = home.model.loginObj[loginEmail.value.toUpperCase()].name;
						spaceUtils.clearEles(activeObj.rootid);
					},500)
				} else {
					lifeFeedSection.style.opacity = 0;
					animate.fadeIt(lifeFeedSection,1000);
				}
				
			},
			
			/**
			* method called to get out from the website
			*Params : activeObj - The obj which has configurations clicked element.
			**/
			processForLogout : function(activeObj) {
				var lifeFeedSection = dom.byId("liveFeedSection"),
					loginSection = dom.byId("loginSection"),
					lefNav = dom.byId("lefNav");
				animate.fadeOut(lifeFeedSection,1000);
				animate.fadeOut(lefNav,1000);
				setTimeout(function() {
					domClass.add(liveFeedSection,"hide");
					animate.wipeIn(loginSection,500);
					domClass.add(welcomeSection,'hide');
				},1000)
			},
			
			/**
			* method called to register user
			*Params : activeObj - The obj which has configurations clicked element.
			**/
			processForSignUp : function(activeObj) {
				var regPswd = dom.byId("regPswd"),
					regEmail = dom.byId("regEmail"),
					role = dom.byId("role"),
					regFname = dom.byId("regFname");
				if(spaceUtils.isNull(home.model.loginObj[regEmail.value.toUpperCase()])) {
					home.model.createLogins({
						email : regEmail.value.toUpperCase(),
						password : regPswd.value,
						name : regFname.value,
						role : role.value
					});
					spaceUtils.clearEles(activeObj.rootid);
					spaceUtils.showGenericMsg({
						msgKey : 'REGISTRATION_SUCCESSFUL',
						id : 'genericMsg'
					});
					
				} else {
					loginFlag =  false;
					spaceUtils.setSingleErrorInput(spaceUtils.getErrorObj(regEmail,"REG_FAIL"));
				}
			},
			
			/**
			* method called on load and register key up event to perform action on enter.
			**/
			registerKeyupEvents: function () {
			   on(dom.byId("main-content"),'[data-keyup]:keyup', function(event) {
					var keyUpList = attr.get(event.target, 'data-keyup').split(';');
					array.forEach(keyUpList,function(list) {
						if (list == "action") {
							if(event.keyCode == 13) { 
								dom.byId(attr.get(event.target, 'data-actionid')).click();
							}
						}
					});
				});
			},
			/**
			* method called to Apply Menu Css
			*Params : activeObj - The obj which has configurations clicked element.
			**/
			applyMenuCss : function(activeObj) {
				query('[data-menu]').forEach(function(ele) {
					domClass.remove(ele.parentNode,'currentNav');
				});
				domClass.add(activeObj.activeElement.parentNode,'currentNav');
			},
			
			/**
			* method called to set saveFlag to "Y" for the data present in broadCastData Obj.
			*Params : activeObj - The obj which has configurations clicked element.
			**/
			processForSaveingMessage : function(activeObj) {
				var index = activeObj.id.split("_")[1],
					msgId = dom.byId("msgId_"+index).innerHTML;
				array.forEach(home.model.broadCastData,function(bdata) {
					if(bdata.msgId == msgId) {
						bdata.saveFlag = "Y";
					}
				});
				spaceUtils.showGenericMsg({
					msgKey : 'SAVE_MESSAGE_SUCCESSFUL',
					id : 'genericSaveMsg'
				});
				
			},
			
			/**
			* method called to render comment for entered information.
			*Params : activeObj - The obj which has configurations clicked element.
			**/
			processForAddingComment :function(activeObj) {
				var blankCommentFragment = dom.byId("comments_n"),commentFeed,commentRoot,commentIndex,msgId = activeObj.id.split("_")[1],commentObj = {};
				commentFeed = blankCommentFragment.cloneNode();
				commentFeed.innerHTML = blankCommentFragment.innerHTML;
				commentRoot = dom.byId("commentsData_"+msgId);
				commentRoot.appendChild(commentFeed);
				commentIndex = "_"+msgId+"|"+query(".previousComments",commentRoot.id).length;
				spaceUtils.reArrangePostions(commentRoot.id, "_n",commentIndex, "", "$");
				commentObj.date = home.controller.getSysTime();
				commentObj.user = home.model.activeUser.name;
				commentObj.comment = dom.byId("addC_"+msgId).value;
				dom.byId("commentUser"+commentIndex).innerHTML = commentObj.user;
				dom.byId("commentTime"+commentIndex).innerHTML = commentObj.date;
				dom.byId("comment"+commentIndex).innerHTML = commentObj.comment;
				dom.byId("commentPic"+commentIndex).style.background = home.controller.getAlphabetUrl("small",commentObj.user.toUpperCase()[0],"-6px -8px");
				dom.byId("addC_"+msgId).value = "";
				array.forEach(home.model.broadCastData,function(bdata) {
					if(bdata.msgId == msgId) {
						bdata.comments.push(commentObj);
					}
				});
			},
			
			/**
			* method called to show/hide save section and broad cast section.
			*Params : saveFlag - To differentiate between saveMessage menu and broad cast menu
			**/
			showOrHideNoSaveMsg : function(saveFlag) {
				var lifeFeedContent = dom.byId("lifeFeedContent"),
					noSavedMsgs = dom.byId("noSavedMsgs"),
					liveFeedLabel = dom.byId("liveFeedLabel"),
					broadcastSection = dom.byId("broadcastSection")
				if(spaceUtils.isNull(saveFlag)) {
					domClass.remove(broadcastSection,'hide');
					liveFeedLabel.innerHTML = "Live Feed";
				} else {
					domClass.add(broadcastSection,'hide');
					liveFeedLabel.innerHTML = "Saved Messages";
				}
				if(spaceUtils.isNull(saveFlag) || lifeFeedContent.innerHTML != "") {
					domClass.add(noSavedMsgs,'hide');
				} else {
					domClass.remove(noSavedMsgs,'hide');
				}
			},
			
			/**
			* method called to set approved/disapproved information for specified message
			*Params : activeObj - The obj which has configurations clicked element.
			**/
			processForAddingLikes : function(activeObj) {
				var index = activeObj.id.split("_")[1],
					ele = dom.byId(activeObj.name+"_"+index);
				ele.innerHTML =  parseInt(ele.innerHTML) + 1;
				array.forEach(home.model.broadCastData,function(bdata) {
					if(bdata.msgId == index) {
						bdata[activeObj.name] = ele.innerHTML;
					}
				});
			},
			
			/**
			* method called on load of page and initialize some methods in views 
			**/
			init:function() {
				 spaceUtils.setDeviceMode();
				spaceUtils.resize();
				home.view.initilizeSlidingDivs();
				home.view.registerKeyupEvents();
			},
			destroy:function(){}
		},
		
		/**
		* method called on load of page and initialize init method in controller 
		**/
		init : function() {
			home.controller.init();
		}
	};
	home.init();
	return home;
});