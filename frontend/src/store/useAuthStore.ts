import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";
const BASE_URL = "https://talkify-by-sp.onrender.com";

interface AuthState {
    authUser: any | null,
    isSigninup: boolean,
    isLoggingIn: boolean,
    IsUpdatingProfile: boolean,
    isCheckingAuth: boolean,
    onlineUsers: string[],
    socket: ReturnType<typeof io> | null,


    checkAuth: () => void,
    signup: (data: SignupData) => Promise<void>,
    logout: () => void,
    login: (data: LoginData) => Promise<void>,
    updateProfile: (data: UpdateProfileData) => Promise<void>,
    connectSocket: () => void,
    disconnectSocket: () => void,
    verifyEmail: (email: string, verificationCode: string) => Promise<void>
    resendVerificationCode: (email: string) => Promise<void>
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

export const useAuthStore = create<AuthState> ((set, get) => ({

    authUser: null,
    isSigninup: false,
    isLoggingIn: false,
    IsUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
            get().connectSocket();
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
            
            toast.success("Verification code sent to your email");
            console.log(res)
            window.location.href = `/verify-email?email=${encodeURIComponent(data.email)}`;
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

    verifyEmail: async (email: string, verificationCode: string) => {
        try{
            const res = await axiosInstance.put("./auth/verify-email", {
                email,
                verificationCode
            });

            // After successful verification, check auth status
            get().checkAuth();
            console.log(res);
            toast.success("Email verified successfully!");
        }
        catch(error){
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Verification failed");
            throw error;
        }
    },

    resendVerificationCode: async (email: string) => {
        try{
            await axiosInstance.post("/auth/resend-verification-code", { email });
            toast.success("New verification code sent");
        }
        catch(error){
            const err = error as AxiosError<{ message: string }>;
            toast.error(err.response?.data?.message || "Failed to resend code");
        }
    },

    logout: async () => {
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
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
            set({ authUser: res.data.loggedInUser });

            
            toast.success("Logged in successfully");
            get().connectSocket();
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
    },

    connectSocket: () => {
        const { authUser } = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            }
        });

        socket.connect();
        set({socket: socket});

        socket.on("getOnlineUsers", (usersIds: string[]) => {
            console.log("Online users received: ", usersIds); // Debug
            set({onlineUsers: usersIds})
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket?.disconnect();
    }

}));