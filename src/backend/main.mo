import Map "mo:core/Map";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Message = {
    id : Nat;
    content : Text;
    timestamp : Int;
    role : Text;
  };

  module Message {
    public func compareByTimestamp(msg1 : Message, msg2 : Message) : Order.Order {
      Int.compare(msg1.timestamp, msg2.timestamp);
    };
  };

  public type Conversation = {
    id : Nat;
    title : Text;
    messages : [Message];
    createdAt : Int;
  };

  module Conversation {
    public func compareById(conv1 : Conversation, conv2 : Conversation) : Order.Order {
      Nat.compare(conv1.id, conv2.id);
    };
  };

  public type UserProfile = {
    username : Text;
    email : Text;
    displayName : Text;
    createdDate : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userCredentials = Map.empty<Text, Text>();
  let usernameToPrincipal = Map.empty<Text, Principal>();
  let userConversations = Map.empty<Principal, [Conversation]>();
  let guestConversations = Map.empty<Text, [Conversation]>();

  var conversationIdCounter : Nat = 0;
  var messageIdCounter : Nat = 0;

  let ADMIN_USERNAME = "omawasthi07122006";
  let ADMIN_PASSWORD = "7122006";

  public shared ({ caller }) func signUp(username : Text, password : Text, email : Text, displayName : Text) : async Bool {
    switch (userCredentials.get(username)) {
      case (?_) { Runtime.trap("Username already taken") };
      case (null) {};
    };

    if (password.size() < 4) {
      Runtime.trap("Password must be at least 4 characters long");
    };

    userCredentials.add(username, password);
    usernameToPrincipal.add(username, caller);

    let profile : UserProfile = {
      username = username;
      email = email;
      displayName = displayName;
      createdDate = Time.now();
    };
    userProfiles.add(caller, profile);
    userConversations.add(caller, []);

    let isAdmin = username == ADMIN_USERNAME and password == ADMIN_PASSWORD;
    if (isAdmin) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
    } else {
      accessControlState.userRoles.add(caller, #user);
    };

    true;
  };

  public query func login(username : Text, password : Text) : async Bool {
    switch (userCredentials.get(username)) {
      case (null) { false };
      case (?storedPassword) { storedPassword == password };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getProfile(username : Text) : async UserProfile {
    switch (usernameToPrincipal.get(username)) {
      case (null) { Runtime.trap("User not found") };
      case (?userPrincipal) {
        if (caller != userPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
        };
        switch (userProfiles.get(userPrincipal)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) { profile };
        };
      };
    };
  };

  public shared ({ caller }) func createConversation(title : Text) : async Conversation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create conversations");
    };

    let conversationId = conversationIdCounter;
    conversationIdCounter += 1;

    let conversation : Conversation = {
      id = conversationId;
      title = title;
      messages = [];
      createdAt = Time.now();
    };

    let currentConversations = switch (userConversations.get(caller)) {
      case (null) { [] };
      case (?convs) { convs };
    };

    let updatedConversations = currentConversations.concat([conversation]);
    userConversations.add(caller, updatedConversations);

    conversation;
  };

  public shared ({ caller }) func sendMessage(conversationId : Nat, content : Text, role : Text) : async Message {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let conversations = switch (userConversations.get(caller)) {
      case (null) { Runtime.trap("No conversations found for user") };
      case (?convs) { convs };
    };

    switch (conversations.find<Conversation>(func(c) { c.id == conversationId })) {
      case (null) { Runtime.trap("Conversation not found or access denied") };
      case (?_) {
        let messageId = messageIdCounter;
        messageIdCounter += 1;

        let message : Message = {
          id = messageId;
          content = content;
          timestamp = Time.now();
          role = role;
        };

        let updatedConversations = conversations.map(
          func(conv) {
            if (conv.id == conversationId) {
              {
                id = conv.id;
                title = conv.title;
                messages = conv.messages.concat([message]);
                createdAt = conv.createdAt;
              };
            } else {
              conv;
            };
          }
        );

        userConversations.add(caller, updatedConversations);
        message;
      };
    };
  };

  public query ({ caller }) func getConversations() : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    switch (userConversations.get(caller)) {
      case (null) { [] };
      case (?convs) { convs };
    };
  };

  public query ({ caller }) func getConversation(conversationId : Nat) : async Conversation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    let conversations = switch (userConversations.get(caller)) {
      case (null) { Runtime.trap("No conversations found") };
      case (?convs) { convs };
    };

    switch (conversations.find<Conversation>(func(c) { c.id == conversationId })) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conv) { conv };
    };
  };

  public query ({ caller }) func getMessages(conversationId : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let conversations = switch (userConversations.get(caller)) {
      case (null) { Runtime.trap("No conversations found") };
      case (?convs) { convs };
    };

    switch (conversations.find<Conversation>(func(c) { c.id == conversationId })) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conv) { conv.messages };
    };
  };

  // --- Guest functions ---

  public shared func createGuestConversation(sessionId : Text, title : Text) : async Conversation {
    let conversationId = conversationIdCounter;
    conversationIdCounter += 1;

    let conversation : Conversation = {
      id = conversationId;
      title = title;
      messages = [];
      createdAt = Time.now();
    };

    let current = switch (guestConversations.get(sessionId)) {
      case (null) { [] };
      case (?convs) { convs };
    };

    guestConversations.add(sessionId, current.concat([conversation]));
    conversation;
  };

  public shared func sendGuestMessage(sessionId : Text, conversationId : Nat, content : Text, role : Text) : async Message {
    let conversations = switch (guestConversations.get(sessionId)) {
      case (null) { Runtime.trap("No guest conversations found") };
      case (?convs) { convs };
    };

    switch (conversations.find<Conversation>(func(c) { c.id == conversationId })) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?_) {
        let messageId = messageIdCounter;
        messageIdCounter += 1;

        let message : Message = {
          id = messageId;
          content = content;
          timestamp = Time.now();
          role = role;
        };

        let updated = conversations.map(
          func(conv) {
            if (conv.id == conversationId) {
              {
                id = conv.id;
                title = conv.title;
                messages = conv.messages.concat([message]);
                createdAt = conv.createdAt;
              };
            } else { conv };
          }
        );

        guestConversations.add(sessionId, updated);
        message;
      };
    };
  };

  public query func getGuestConversations(sessionId : Text) : async [Conversation] {
    switch (guestConversations.get(sessionId)) {
      case (null) { [] };
      case (?convs) { convs };
    };
  };

  public query func getGuestMessages(sessionId : Text, conversationId : Nat) : async [Message] {
    let conversations = switch (guestConversations.get(sessionId)) {
      case (null) { [] };
      case (?convs) { convs };
    };

    switch (conversations.find<Conversation>(func(c) { c.id == conversationId })) {
      case (null) { [] };
      case (?conv) { conv.messages };
    };
  };

  // --- Admin functions ---

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all users");
    };

    userProfiles.values().toArray();
  };

  public query ({ caller }) func getAllConversations() : async [(Principal, [Conversation])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all conversations");
    };

    userConversations.entries().toArray();
  };

  public query ({ caller }) func getUserConversations(user : Principal) : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access other users' conversations");
    };

    switch (userConversations.get(user)) {
      case (null) { [] };
      case (?convs) { convs };
    };
  };

  public query ({ caller }) func getUserConversation(user : Principal, conversationId : Nat) : async Conversation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access other users' conversations");
    };

    let conversations = switch (userConversations.get(user)) {
      case (null) { Runtime.trap("No conversations found for user") };
      case (?convs) { convs };
    };

    switch (conversations.find<Conversation>(func(c) { c.id == conversationId })) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conv) { conv };
    };
  };

  public shared func systemDescription() : async Text {
    "Om.ai - ChatGPT-like application with role-based access control. Users can register, login, manage conversations, and send messages. Guest users can chat without an account. Admin has special privileges to access all users and conversations. Developed by Om Awasthi, 2024.";
  };

  // ---- NVIDIA NIM AI ----

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared func callDeepSeek(userMessage : Text) : async Text {
    let apiKey = "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";
    let url = "https://integrate.api.nvidia.com/v1/chat/completions";
    let systemMessage = "You are Om, a helpful AI assistant on Om.ai platform. You answer in the same language the user writes in (Hindi or English). Be concise, accurate, and friendly. For coding questions, provide clean code examples.";

    let body = "{\"model\":\"meta/llama-3.1-8b-instruct\",\"messages\":[{\"role\":\"system\",\"content\":\"" # systemMessage # "\"},{\"role\":\"user\",\"content\":\"" # userMessage # "\"}],\"max_tokens\":1024}";

    let headers = [
      {
        name = "Authorization";
        value = "Bearer " # apiKey;
      },
      {
        name = "Content-Type";
        value = "application/json";
      },
    ];

    let response = await OutCall.httpPostRequest(url, headers, body, transform);
    if (response.size() == 0) {
      Runtime.trap("Failed to get response from OutCall");
    };
    response;
  };
};
