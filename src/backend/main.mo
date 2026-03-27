import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Nat "mo:core/Nat";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userFavorites = Map.empty<Principal, Set.Set<Text>>();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type NonEmptyFavoritesList = {
    size : Nat;
    values : [Text];
  };

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to get or create a user's favorites set
  func getOrCreateFavoritesSet(user : Principal) : Set.Set<Text> {
    switch (userFavorites.get(user)) {
      case (null) {
        let newSet = Set.empty<Text>();
        userFavorites.add(user, newSet);
        newSet;
      };
      case (?favorites) { favorites };
    };
  };

  // Add to favorites -- only for authenticated users
  public shared ({ caller }) func addFavorite(stationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add favorites");
    };

    let favorites = getOrCreateFavoritesSet(caller);
    favorites.add(stationId);
  };

  // Remove from favorites -- only for authenticated users
  public shared ({ caller }) func removeFavorite(stationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove favorites");
    };

    let favorites = getOrCreateFavoritesSet(caller);
    favorites.remove(stationId);
  };

  // Get caller's favorites as array
  public query ({ caller }) func getCalledUserFavorites() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view favorites");
    };

    switch (userFavorites.get(caller)) {
      case (null) { [] };
      case (?favorites) { favorites.values().toArray() };
    };
  };

  type NonEmptyFavoritesListResponse = {
    #ok : NonEmptyFavoritesList;
    #noFavorites;
  };

  // Get caller's favorites as non-empty list or noFavorites
  public query ({ caller }) func getNonEmptyFavoritesList() : async NonEmptyFavoritesListResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view favorites");
    };

    switch (userFavorites.get(caller)) {
      case (null) { #noFavorites };
      case (?favorites) {
        let favoritesArray = favorites.values().toArray();
        let size = favoritesArray.size();

        if (size == 0) {
          #noFavorites;
        } else {
          #ok({
            size;
            values = favoritesArray;
          });
        };
      };
    };
  };

  type FavoriteStationIdsResponse = {
    #ok : [Text];
    #noFavorites;
  };

  // Get caller's favorite station IDs
  public shared ({ caller }) func getFavoriteStationIds() : async FavoriteStationIdsResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view favorites");
    };

    switch (userFavorites.get(caller)) {
      case (null) { #noFavorites };
      case (?favorites) {
        let favoritesArray = favorites.values().toArray();
        if (favoritesArray.size() == 0) {
          #noFavorites;
        } else {
          #ok(favoritesArray);
        };
      };
    };
  };
};
