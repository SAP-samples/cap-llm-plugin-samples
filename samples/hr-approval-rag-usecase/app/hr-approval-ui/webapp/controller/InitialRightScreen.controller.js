sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], function(Controller, JSONModel) {
    'use strict';
    
    return Controller.extend("hrapprovalui.controller.InitialRightScreen", {

        onInit: function(){

            // Set Chat Model
            const chatModel = new JSONModel();
            chatModel.setData({
                conversationId: "",
                messageId: "",
                message_time: "",
                user_id: "",
                user_query: '',
                chatHistory: [],
                isBusy: false,
                enableTextArea: true,
            });
            this.getView().setModel(chatModel, 'chatModel');

            // Set User Info Model
            this.getUserInfo();

            this.oOwnerComponent = this.getOwnerComponent();
            this.oRouter = this.oOwnerComponent.getRouter();
            this.oRouter.getRoute("home").attachPatternMatched(this.onRouteMatched, this);
        },

        getUserInfo: function(){
            
            const url = this.getBaseURL() + "/user-api/currentUser";
            var oModel = new JSONModel();
            var mock = {
                firstname: "Dummy",
                lastname: "User",
                email: "dummy.user@com",
                name: "dummy.user@com",
                displayName: "Dummy User (dummy.user@com)"
            }; 
            oModel.loadData(url);
            oModel.dataLoaded()
            .then(()=>{
                //check if data has been loaded
                //for local testing, set mock data
                console.log(oModel.getData());
                if (!oModel.getData().email) {
                    oModel.setData(mock);
                }
                this.getView().setModel(oModel, "userInfo");
            })
            .catch(()=>{               
                oModel.setData(mock);
                this.getView().setModel(oModel, "userInfo");
            });
        },

        getBaseURL: function () {

            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);

            return appModulePath;
        }, 

        onRouteMatched(oEvent){

            this.clearChatHistory();
        },

        clearChatHistory: function(){

            const chatHistoryModel = this.getView().getModel('chatModel');
            const path = "/chatHistory";
            const chatHistories = [];
            chatHistoryModel.setProperty(path, chatHistories);
        },

        onSendMessage: function(oEvent){

            this.setBusy(true);
            this.setEnableTextArea(false);

            const userMessage = oEvent.getParameter("value");
            const source = oEvent.getSource();
            const oRouter = this.getOwnerComponent().getRouter();

            this.setUserQuestionInToChatMessage(userMessage);
        
            const chatModel = this.getView().getModel('chatModel');
            const conversationId = chatModel.getProperty("/conversationId");
            const payload = JSON.stringify({
                conversationId: conversationId,
                messageId: chatModel.getProperty("/messageId"),
                message_time: chatModel.getProperty("/message_time"),
                user_id: chatModel.getProperty("/user_id"),
                user_query: chatModel.getProperty("/user_query"),
            });

            this.sendMessage(payload)
            .then((oReturn) => {
                this.setBackendResponseInToChatMessage(oReturn);
                setTimeout(() => {
                    oRouter.navTo("conversation", {
                        conversationID: conversationId
                    });
                }, 1000);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                this.setBusy(false);
                this.setEnableTextArea(true);
            });
        },

        sendMessage: function(payload){

            return new Promise((resolve, reject) => {

                $.ajax({
                    url: this.getBaseURL() + "/odata/v4/chat/getChatRagResponse",
                    type: 'POST',
                    contentType: 'application/json',
                    async: true,
                    data: payload,
                    success: function (body, status, response) {
                        console.log(response);
                        if (response.status === 200 || response.status === 201) {
                            resolve(response.responseJSON);
                        } else {
                            reject(response.responseJSON)
                        }
                    },
                    error: function (response, status) {
                        if (response) {
                            if (response.responseJSON) {
                                const msg = response.responseJSON.message || response.responseJSON.status_msg;
                                reject(msg);
                            } else {
                                reject(response.responseText);
                            }
                        } else {
                            reject(status);
                        }
                    }
                })
            });
        },

        setBackendResponseInToChatMessage(oReturn){

            const chatModel = this.getView().getModel('chatModel');
            const conversationId = chatModel.getProperty("/conversationId");
            const backendResponse = {
                conversationId: conversationId,
                messageId: self.crypto.randomUUID(),
                message_time: new Date(oReturn.messageTime),
                content: oReturn.content,
                user_id: "",
                user_role: oReturn.role,
                icon_path: "sap-icon://da-2",
                initials: "",
            }

            const path = "/chatHistory";
            const chatHistories = chatModel.getProperty(path);
            chatHistories.push(backendResponse);
            chatModel.setProperty(path, chatHistories);
        },

        setBusy: function(isBusy){

            const path = "/isBusy";
            this.getView().getModel('chatModel').setProperty(path, isBusy);
        },

        setEnableTextArea: function(isEnable){

            const path = "/enableTextArea"
            this.getView().getModel('chatModel').setProperty(path, isEnable);
        },

        setUserQuestionInToChatMessage(userMessage){

            const chatModel = this.getView().getModel('chatModel');
            const userInfoModel = this.getView().getModel('userInfo');
            chatModel.setProperty("/conversationId", self.crypto.randomUUID());
            chatModel.setProperty("/messageId", self.crypto.randomUUID());
            chatModel.setProperty("/message_time", new Date().toISOString());
            chatModel.setProperty("/user_query", userMessage);
            chatModel.setProperty("/user_id", userInfoModel.getProperty("/email"));

            const chatHistory = {
                conversationId: chatModel.getProperty("/conversationId"),
                messageId: chatModel.getProperty("/messageId"),
                message_time: new Date(chatModel.getProperty("/message_time")),
                content: userMessage,
                user_id: chatModel.getProperty("/user_id"),
                user_role: "You",
                icon_path: "",
                initials: userInfoModel.getProperty("/firstname").charAt(0) + userInfoModel.getProperty("/lastname").charAt(0),
            }

            const path = "/chatHistory";
            const chatHistories = chatModel.getProperty(path);
            chatHistories.push(chatHistory);
            chatModel.setProperty(path, chatHistories);
        },

        onListUpdateFinished: function(oEvent){
            const items = oEvent.getSource().getItems();
            if (items.length === 0) {
              return;
            }
            items[items.length - 1].focus();
        },
    });
});