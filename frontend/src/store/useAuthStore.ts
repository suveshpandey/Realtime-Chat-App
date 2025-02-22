import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { User } from "../lib/types";

interface AuthState {
    authUser: any | null,
    isSigninup: boolean,
    isLoggingIn: boolean,
    IsUpdatingProfile: boolean,
    isCheckingAuth: boolean,
    onlineUsers: User[],
    checkAuth: () => void,
    signup: (data: SignupData) => Promise<void>;
    logout: () => void,
    login: (data: LoginData) => Promise<void>,
    updateProfile: (data: UpdateProfileData) => Promise<void>
}
interface SignupData {
    email: string,
    password: string,
    username: string
}
interface LoginData {
    email: string,
    password: string
}
interface UpdateProfileData {
    profilePic: string
}

export const useAuthStore = create<AuthState> ((set) => ({
    
    authUser: null,
    isSigninup: false,
    isLoggingIn: false,
    IsUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
        }
        catch(error){
            console.log("error in checkAuth: ", error);
            set({authUser: null});
        }
        finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (data: SignupData) => {
        set({isSigninup: true});
        try{
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
        }
        catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Signup failed");
            console.log("Couldn't signup");
        }  
        finally{
            set({isSigninup: false});
        }      
    },

    logout: async () => {
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");
        }
        catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Logout failed");
            console.log("Couldn't logout");
        }  
    },

    login: async (data: LoginData) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
    
            // Fetch the latest user data
            await useAuthStore.getState().checkAuth();
    
            toast.success("Logged in successfully");
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Login failed");
            console.log("Couldn't login");
        } finally {
            set({ isLoggingIn: false });
        }
    },
    
    updateProfile: async (data: UpdateProfileData) => {
        set({IsUpdatingProfile: true});
        try{
            const res = await axiosInstance.put("auth/update-profile", data);
            set({authUser: res.data.authUser});
            toast.success("Profile updated successfully");
        }
        catch(error){
            const err = error as AxiosError<{ message: string }>;
            toast.error("Profile updation failed, internal server error");
            console.log(err.response?.data?.message );
        }
        finally{
            set({IsUpdatingProfile: false});
        }
    }
}));