/**
* 
*	This was utility JS, which includes validation framework and some utility functions.
* 
* @project   Function Space Code Challege
* @date      16/11/3014
* @author    Rajesh,  <rajesh.rnagireddy@gmail.com>
* 
*/


define(['dojo/query',
	'dojo/on',
	'dojo/dom',
	'dojo/dom-attr',
	'dojo/dom-class',
	'dojo/_base/array',
	'regExp',
	'messages',
	'animate',
	'dojo/domReady!'],function(query,on,dom,attr,domClass,array,regExp,messages,animate){
	var spaceUtils = {
		
		/**
		* Method called on each member click on link/button.
		* params : activeEle - The element which is clicked at time.
		* This method creates an active Link/Menu object
		**/
		setActiveObj : function(activeEle) {
			var activeObj = {	},dijitEle;
			activeObj.id =  activeEle.id;
			activeObj.activeElement =  activeEle;
			activeObj.validate = attr.get(activeEle,"data-validatePage");
			activeObj.name = attr.get(activeEle,"name");
			if(spaceUtils.isNull(activeObj.validate) || activeObj.validate == 'false') {
				activeObj.validate = false;
			} else {
				activeObj.validate = true;
			}
			activeObj.rootid =  attr.get(activeEle,"data-rootid");
			return activeObj;
		},
		
		isArray : function(object){
			if(object.length){
				return true;
			}else{
				return false;
			}
		},
		
		/**
		* Method called on each click on link/button. and return boolean as per the validation
		* params : activeObj - The obj which has configurations clicked element.
		*		   
		**/
		validate : function(activeObj) {
			if(activeObj.validate) {
				mandatoryFields = query('[data-mandatory]',activeObj.rootid);
				spaceUtils.removeErrorInputCss(mandatoryFields);
				var errorFielsIds = spaceUtils.validteFields(mandatoryFields);
				if(errorFielsIds.length>0) {
					spaceUtils.setErrorInputCss(errorFielsIds);
					return false;
				}
				/** No Error in mandatory fields **/
				else {
					return true;
				}
			}
			
			/** Not Necessary to spaceUtils **/
			else {
				return true;
			}
		},
		
		/**
		* Method called to set error input css
		* params : errorInputArray - The array of error elements to set error input css.
		*		   
		**/
		setErrorInputCss : function(errorInputArray) {
			if(spaceUtils.isArray(errorInputArray)) {
				if(errorInputArray.length>0) {
					for(var i=0; i<errorInputArray.length; i++) {		
						if(spaceUtils.isArray(errorInputArray[i])) {
							spaceUtils.removeSingleErrorInput(spaceUtils.getErrorInput(errorInputArray[i][0].errorEle));
							for(var j=0;j<errorInputArray[i].length;j++) {
								errorInputArray[i][j].errorEle = spaceUtils.getErrorInput(errorInputArray[i][j].errorEle);
								spaceUtils.setSingleErrorInput(errorInputArray[i][j])
							}
						} else {
							errorInputArray[i].errorEle = spaceUtils.getErrorInput(errorInputArray[i].errorEle);
							spaceUtils.removeSingleErrorInput(errorInputArray[i].errorEle);
							spaceUtils.setSingleErrorInput(errorInputArray[i]);
						}
					}
				}
			} else {
				errorInputArray.errorEle = spaceUtils.getErrorInput(errorInputArray.errorEle);
				spaceUtils.setSingleErrorInput(errorInputArray);
			}
		},
		
		/**
		* Method called to clear error input css
		* params : errorInputArray - The array of error elements to clear error input css.
		*		   
		**/
		removeErrorInputCss : function(errorInputArray) {
			if(errorInputArray.length>0) {
				for(var i=0; i<errorInputArray.length; i++) {
					spaceUtils.removeSingleErrorInput(spaceUtils.getErrorInput(errorInputArray[i]));
				}
			} 
			spaceUtils.hideGenericMsg();
		},
		
		/**
		* Method called to clear error input css for one single element
		* params : errorInput 
		*		   
		**/
		removeSingleErrorInput : function(errorInput) {
			if(domClass.contains(errorInput,'errorBorder')) {
				domClass.remove(errorInput,'errorBorder');
			} 
			var errorSpanId =  attr.get(errorInput,"data-errordiv");
			if(spaceUtils.isNull(errorSpanId)) {
				if(!domClass.contains(errorInput,'hide')) {
					errorInput.innerHTML = "";
					domClass.add(errorInput,'hide');						
				}
			} else {
				if(dom.byId(errorSpanId) && !domClass.contains(dom.byId(errorSpanId),'hide')) {
					dom.byId(errorSpanId).innerHTML = "";
					domClass.add(dom.byId(errorSpanId),'hide');						
				}
			}	
		},
		
		/**
		* Method called to set error input css for one single element
		* params : errorObj 
		*		   
		**/
		setSingleErrorInput : function(errorObj) {
			domClass.add(errorObj.errorEle,'errorBorder');
			var errorSpanId =  attr.get(errorObj.errorEle,"data-errordiv");
			if(domClass.contains(dom.byId(errorSpanId),'hide')) {
				domClass.remove(dom.byId(errorSpanId),'hide');
			}
			dom.byId(errorSpanId).innerHTML = dom.byId(errorSpanId).innerHTML + "<p>" + errorObj.errorMsg + "</p>";
		},
		
		/**
		* Method called to set Generic Msg, irrespective to any input.
		* params : genericMsgObj contains message to be set, id.
		*		   
		**/
		showGenericMsg : function(genericMsgObj) {
			var genericDivEle = dom.byId(genericMsgObj.id);
			if(genericDivEle) {
				genericDivEle.innerHTML = messages[genericMsgObj.msgKey];
				animate.scrollIntoView(dom.byId("main-content"),500);
			}
		},
		
		/**
		* Method called to clear Generic Msg, irrespective to any input.
		*		   
		**/
		hideGenericMsg : function() {
			var genericDivEle = dom.byId('genericMsg');
			var genericSaveEle = dom.byId('genericSaveMsg');
			if(genericDivEle && genericSaveEle) {
				genericDivEle.innerHTML = "";
				genericSaveEle.innerHTML = "";
			}
		},
		getErrorInput : function(errorInput) {
			if(spaceUtils.isNull(errorInput.tagName)) {
				return dom.byId(errorInput.id);
			} else {
				return errorInput;
			}
		},
		
		/**
		* Method called to validate fields, .
		* params : mandatoryFields contains array of elements to validate.		   
		**/
		validteFields : function(mandatoryFields) {
			var errorFielsIds = [];
			if(mandatoryFields.length>0) {
				array.forEach(mandatoryFields,function(mandatoryFields) {
					var fieldErrMsgs = [],validationList = [];
					try {
						validationList = attr.get(mandatoryFields,'data-mandatory').split(';');
					} catch(e)	{
						var list = mandatoryFields.attr('data-mandatory');
						if(!spaceUtils.isNull(list)) {
							validationList = mandatoryFields.attr('data-mandatory').split(';');
						}	
					}	
					for(var i=0;i<validationList.length;i++){
						if(validationList[i] == 'true') {
							if(mandatoryFields.tagName == 'INPUT') {
								var value = mandatoryFields.value.replace(/\s/g, '');
								if(spaceUtils.isNull(value)) {
									fieldErrMsgs.push(spaceUtils.getErrorObj(mandatoryFields,"NULLFIELD"));
									break;
								}
							}
						} 
						if(validationList[i] == 'email') {
							if(validationList[0] == 'false') {
								if(!spaceUtils.isNull(mandatoryFields.value)) {	
									if(!spaceUtils.isValidEmail(mandatoryFields.value)) {
										fieldErrMsgs.push(spaceUtils.getErrorObj(mandatoryFields,"INVALID_EMAIL"));
									}
								}
							} else {
								if(!spaceUtils.isValidEmail(mandatoryFields.value)) {
									fieldErrMsgs.push(spaceUtils.getErrorObj(mandatoryFields,"INVALID_EMAIL"));
								}	
							}							
						}
					}
					if(fieldErrMsgs.length > 0) {
						errorFielsIds.push(fieldErrMsgs);
					}
				});
				return errorFielsIds;
			} else {
				return errorFielsIds;
			}
			
		},
		getErrorObj : function(errorElement,errorDesc,radioElems) {
			var errorFeildObj = {}, errorFieldName;
			errorFeildObj.errorEle = errorElement;
			if(radioElems) {
				errorFeildObj.radioElems = radioElems;
			}	
			try {
				if(dijit.byId(errorElement.id)) {
					errorFieldName = dijit.byId(errorElement.id).name;
				} else {
					errorFieldName = attr.get(errorElement,'name');
				}	
			} catch(e)	{
				errorFieldName = attr.get(errorElement,'name');
			}
			if(errorDesc) {
				errorFeildObj.errorMsg = messages[errorFieldName][errorDesc];
			} else {
				errorFeildObj.errorMsg = '';
			}
			return errorFeildObj;
		},
		
		/**
		* Utility Method to check passed input is Null or not and returns boolean accordingly.
		* params : any value.		   
		**/
		isNull : function(check) {
			if (!check) {
				return true;
			} 
			if(typeof(check) == 'object') {
				if (check == null) {
					return true;
				} else if(check == undefined) {
					return true;
				}
			} else if(typeof(check) == 'string') {
				if (check == undefined) {
					return true;
				} else if (check == "") {
					return true;
				} 
			} else if(typeof(check) == 'array') {
				if(check.length <= 0) {
					return true;
				}
			} else {
				return false;
			}
		},
		
		/**
		* Utility Method to check passed input is email or not and returns boolean accordingly.
		* params : any value.		   
		**/
		isValidEmail : function(check) {
			if (regExp.Mail.test(check)) {

				return true;
			} else {
				return false;

			}

		},
		
		/**
		* Utility Method to clear values of passed inputs
		* params : any section to clear values of input.		   
		**/
		clearEles : function(clearSection) {
			spaceUtils.removeErrorInputCss(query('[data-mandatory]',clearSection));
			query("#" + clearSection + " input").forEach(function(ele) {
				ele.value = "";
			});
		},
		
		/**
		* Method called to perform navigation in Mobile
		**/
		perfomMobileNavigation: function () {
            if(device == "mobile" && dom.byId("loginSection").style.display == 'none') {
				var nav = dom.byId("fixedLeftNav");
				if (domClass.contains(nav, 'displayblock')) {
					animate.fadeOut(nav,1000);
					setTimeout(function() {
						domClass.remove(nav, 'displayblock');
					},1000)
				} else {
					nav.style.opacity == 0;
					domClass.add(nav, 'displayblock');
					animate.fadeIt(nav,1000);
				}
			}
		},
		
		/**
		* Method called on every resize of browser and device mode accordingly
		**/
		setDeviceMode: function () {
            var ie9 = false;
            var mozilla = true;
            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
                var ieversion = new Number(RegExp.$1);
                if (ieversion > 8) {
                    ie9 = true;
                } else {
                    ie9 = false;
                    device = 'desktop';
                }
            } else {
                ie9 = true;
            }
            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                if (window.innerWidth >= 785) {
                    device = 'desktop';
                } else {
                   device = 'mobile';
                }
            } else if (ie9 && mozilla) {
                if (window.innerWidth >= 768) {
                   device = 'desktop';
                } else {
                   device = 'mobile';
                }
            }
        },
		
		/**
		* Method called load of page to set resize event.
		**/
        resize: function () {
            var res;
            window.onresize = function () {
                if (res) {
                    clearTimeout(res)
                };
                res = setTimeout(function () {
                    spaceUtils.setDeviceMode();
					if (device == 'desktop') {
						domClass.add(dom.byId("fixedLeftNav"), 'displayblock');
                    } else {
						domClass.remove(dom.byId("fixedLeftNav"), 'displayblock');
                    }
                }, 100);
            };
        },
		
		/**
		* Utility Method called set positions for passed element and its child elements
		**/
		reArrangePostions: function (rootId, currentPoistion, neededPoistion, seperator, type) {
            var attrArray = [];
            attrArray.push("id");
			attrArray.push("data-errordiv");
			attrArray.push("data-rootid");
			attrArray.push("data-actionid");
			attrArray.push("data-slides");
            array.forEach(attrArray, function (attrNode) {
                var elements = query("#" + rootId + " [" + attrNode + type + "=" + seperator + currentPoistion + "]");
                for (var i = 0; i < elements.length; i++) {
                    var replacedVal = attr.get(elements[i], attrNode).replace(seperator + currentPoistion, seperator + neededPoistion);
                    attr.set(elements[i], attrNode, replacedVal)
                }
            });
        },
	};
return spaceUtils;
});
