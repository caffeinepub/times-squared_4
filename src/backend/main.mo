import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Article type
  public type Article = {
    id : Nat;
    title : Text;
    author : Text;
    publicationDate : Text;
    heroImageBlobId : ?Text;
    heroImageBlobId2 : ?Text;
    bodyContent : Text;
    excerpt : Text;
    isPublished : Bool;
    createdAt : Int;
  };

  // Article store
  let articles = Map.empty<Nat, Article>();

  // Custom Errors
  module Error {
    public let unauthorized = "Unauthorized";
    public let notFound = "Article not found";
    public let internal = "Internal error";
  };

  var articleIdCounter = 0;

  module Article {
    public func compare(article1 : Article, article2 : Article) : Order.Order {
      Int.compare(article2.createdAt, article1.createdAt);
    };
  };

  func generateExcerpt(text : Text) : Text {
    if (text.size() <= 200) {
      return text;
    };
    let iter = text.chars();
    let reversedChars = List.empty<Char>();
    reversedChars.addAll(iter);
    let limitedChars = reversedChars.toArray().sliceToArray(0, 200);
    Text.fromArray(limitedChars);
  };

  func requireAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
  };

  func sortArticlesDescending(articleList : List.List<Article>) : [Article] {
    articleList.toArray().sort();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Users only");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Own profile or admin only");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Users only");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createArticle(
    title : Text,
    author : Text,
    publicationDate : Text,
    heroImageBlobId : ?Text,
    heroImageBlobId2 : ?Text,
    bodyContent : Text,
  ) : async { #ok : Nat; #err : Text } {
    requireAdmin(caller);

    let newArticle = {
      id = articleIdCounter;
      title;
      author;
      publicationDate;
      heroImageBlobId;
      heroImageBlobId2;
      bodyContent;
      excerpt = generateExcerpt(bodyContent);
      isPublished = false;
      createdAt = Time.now();
    };

    articles.add(articleIdCounter, newArticle);
    articleIdCounter += 1;

    #ok(articleIdCounter - 1);
  };

  public shared ({ caller }) func updateArticle(
    id : Nat,
    title : Text,
    author : Text,
    publicationDate : Text,
    heroImageBlobId : ?Text,
    heroImageBlobId2 : ?Text,
    bodyContent : Text,
  ) : async { #ok; #err : Text } {
    requireAdmin(caller);

    switch (articles.get(id)) {
      case (null) { #err(Error.notFound) };
      case (?existingArticle) {
        let updatedArticle = {
          existingArticle with
          title;
          author;
          publicationDate;
          heroImageBlobId;
          heroImageBlobId2;
          bodyContent;
          excerpt = generateExcerpt(bodyContent);
        };
        articles.add(id, updatedArticle);
        #ok;
      };
    };
  };

  public shared ({ caller }) func publishArticle(id : Nat) : async { #ok; #err : Text } {
    requireAdmin(caller);

    switch (articles.get(id)) {
      case (null) { #err(Error.notFound) };
      case (?existingArticle) {
        let updatedArticle = {
          existingArticle with
          isPublished = true;
        };
        articles.add(id, updatedArticle);
        #ok;
      };
    };
  };

  public shared ({ caller }) func unpublishArticle(id : Nat) : async { #ok; #err : Text } {
    requireAdmin(caller);

    switch (articles.get(id)) {
      case (null) { #err(Error.notFound) };
      case (?existingArticle) {
        let updatedArticle = {
          existingArticle with
          isPublished = false;
        };
        articles.add(id, updatedArticle);
        #ok;
      };
    };
  };

  public shared ({ caller }) func deleteArticle(id : Nat) : async { #ok; #err : Text } {
    requireAdmin(caller);

    if (not articles.containsKey(id)) {
      return #err(Error.notFound);
    };

    articles.remove(id);
    #ok;
  };

  public query func getPublishedArticles() : async [Article] {
    let publishedList = List.empty<Article>();
    let publishedArticles = articles.values().filter(func(article) { article.isPublished });
    publishedList.addAll(publishedArticles);
    sortArticlesDescending(publishedList);
  };

  public query ({ caller }) func getAllArticles() : async [Article] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return [];
    };

    let allList = List.empty<Article>();
    let allArticles = articles.values();
    allList.addAll(allArticles);
    sortArticlesDescending(allList);
  };

  public query ({ caller }) func getArticleById(id : Nat) : async ?Article {
    switch (articles.get(id)) {
      case (null) { null };
      case (?article) {
        if (article.isPublished or AccessControl.isAdmin(accessControlState, caller)) {
          ?article;
        } else {
          null;
        };
      };
    };
  };
};
