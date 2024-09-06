sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    'use strict';

    return Controller.extend("hrapprovalui.controller.OfficalRightScreen", {

        onInit: function () {

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
            this.oRouter.getRoute("conversation").attachPatternMatched(this.onRouteMatched, this);
        },

        getUserInfo: function () {

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
                .then(() => {
                    // Check if data has been loaded
                    // For local testing, set mock data
                    console.log(oModel.getData());
                    if (!oModel.getData().email) {
                        oModel.setData(mock);
                    }
                    this.getView().setModel(oModel, "userInfo");
                })
                .catch(() => {
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

        onRouteMatched(oEvent) {

            this.clearChatHistory();

            const { conversationID } = oEvent.getParameter("arguments");
            this.getView().bindElement({
                path: `/Conversation(${conversationID})`,
            });

            this.loadConversationHistory(conversationID);
        },

        clearChatHistory: function () {

            const chatHistoryModel = this.getView().getModel('chatModel');
            const path = "/chatHistory";
            const chatHistories = [];
            chatHistoryModel.setProperty(path, chatHistories);
        },

        loadConversationHistory(conversationID) {
            const url = sessionStorage.getItem("isDeployedVersion")==="true"?this.getBaseURL() + `/odata/v4/chat/Conversation(${conversationID})/to_messages`:`/odata/v4/chat/Conversation(${conversationID})/to_messages`;
            //const url = this.getBaseURL() + `/odata/v4/chat/Conversation(${conversationID})/to_messages`;
            //const url = `/odata/v4/chat/Conversation(${conversationID})/to_messages`;
            var oModel = new JSONModel();
            oModel.loadData(url);
            oModel.dataLoaded()
                .then(() => {
                    this.setConversationHistory(oModel.getData());
                });
        },

        setConversationHistory(oReturn) {

            const userInfoModel = this.getView().getModel('userInfo');
            const chatModel = this.getView().getModel('chatModel');
            const path = "/chatHistory";
            const chatHistories = chatModel.getProperty(path);

            for (const returnObj of oReturn.value) {

                const backendResponse = {
                    conversationId: returnObj.cID_cID,
                    messageId: returnObj.mID,
                    message_time: new Date(returnObj.creation_time),
                    content: returnObj.content,
                    user_id: "",
                    user_role: returnObj.role === "assistant" ? "assistant " : "You",
                    icon_path: returnObj.role === "assistant" ? "sap-icon://da-2" : "",
                    initials: returnObj.role === "assistant" ? "" : userInfoModel.getProperty("/firstname").charAt(0) + userInfoModel.getProperty("/lastname").charAt(0),
                }
                chatHistories.push(backendResponse);
            }
            chatModel.setProperty(path, chatHistories);
        },

        onSendMessage: function (oEvent) {

            this.setBusy(true);
            this.setEnableTextArea(false);

            const userMessage = oEvent.getParameter("value");
            const source = oEvent.getSource();

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
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    this.setBusy(false);
                    this.setEnableTextArea(true);
                });
        },

        setBusy: function (isBusy) {

            const path = "/isBusy";
            this.getView().getModel('chatModel').setProperty(path, isBusy);
        },

        setEnableTextArea: function (isEnable) {

            const path = "/enableTextArea"
            this.getView().getModel('chatModel').setProperty(path, isEnable);
        },

        setUserQuestionInToChatMessage(userMessage) {

            const chatModel = this.getView().getModel('chatModel');
            const path = "/chatHistory";
            const chatHistories = chatModel.getProperty(path);
            const conversationID = chatHistories[0].conversationId;
            const userInfoModel = this.getView().getModel('userInfo');

            chatModel.setProperty("/conversationId", conversationID);
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

            chatHistories.push(chatHistory);
            chatModel.setProperty(path, chatHistories);
        },

        sendMessage: function (payload) {

            return new Promise((resolve, reject) => {

                $.ajax({
                    url : sessionStorage.getItem("isDeployedVersion")==="true"?this.getBaseURL() + "/odata/v4/chat/getChatRagResponse":"/odata/v4/chat/getChatRagResponse",
                    //url: this.getBaseURL() + "/odata/v4/chat/getChatRagResponse",
                    //url: "/odata/v4/chat/getChatRagResponse",
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

        setBackendResponseInToChatMessage(oReturn) {

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
    });
});