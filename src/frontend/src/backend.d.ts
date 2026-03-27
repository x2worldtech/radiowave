import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NonEmptyFavoritesList {
    size: bigint;
    values: Array<string>;
}
export type FavoriteStationIdsResponse = {
    __kind__: "ok";
    ok: Array<string>;
} | {
    __kind__: "noFavorites";
    noFavorites: null;
};
export type NonEmptyFavoritesListResponse = {
    __kind__: "ok";
    ok: NonEmptyFavoritesList;
} | {
    __kind__: "noFavorites";
    noFavorites: null;
};
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFavorite(stationId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCalledUserFavorites(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavoriteStationIds(): Promise<FavoriteStationIdsResponse>;
    getNonEmptyFavoritesList(): Promise<NonEmptyFavoritesListResponse>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFavorite(stationId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
