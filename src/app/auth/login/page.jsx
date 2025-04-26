'use client'

import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import { Input, Button } from 'antd';
import { useEffect, useState } from "react";
import AuthFetch from "@/modules/salesApi/auth";
import Cookies from "js-cookie";
import { redirect, useRouter } from 'next/navigation'
import ApiAuth from "@/modules/api/auth";
import useNotification from "@/hooks/useNotification";

export default function Login() {

    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { notify, contextHolder } = useNotification();
  
    const handleSubmit = async () => {
      if (!username || !password) {
        notify('error', 'Error', 'Email and Password are required!');
        return;
      }
  
      try {
        setLoading(true);
  
        const response = await AuthFetch.login({ username, password });
        const data = response?.data?.data || {};
  
        if (!data?.access_token) {
          notify('error', 'Error', 'Login failed! Invalid response from server.');
          return;
        }

        const resValidateRole = await ApiAuth.validationRole({token: data.roles})
        
        const dataValidate = resValidateRole?.data || {}

        if (!dataValidate?.valid || dataValidate?.role == '') {
            notify('error', 'Error', 'Login failed! Invalid response from server.');
            return;
        }
  
        Cookies.set('x_atkn', data.access_token, {
          expires: 0.25,
          path: '/',
          secure: true,
          sameSite: 'None',
        });
  
        Cookies.set('u_ctx', data.roles, {
          expires: 0.25,
          path: '/',
          secure: true,
          sameSite: 'None',
        });

        Cookies.set('role', dataValidate.role, {
            expires: 0.25,
            path: '/',
            secure: true,
            sameSite: 'None',
          });
  
        notify('success', 'Success', 'Login successful!');
  
        // Redirect setelah login sukses
        window.location.href = `/${dataValidate.role}/dashboard`;
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Login failed! Server error, please try again later.";
        notify('error', 'Error', message);
      } finally {
        setLoading(false);
      }
    };
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    return (
        <div className="w-full h-dvh bg-gradient-to-tr to-blue-7 from-red-7 lg:to-red-7 lg:from-blue-6 lg:flex justify-end pt-12 lg:pt-0">
            <FixedHeaderBar bgColor="bg-transparent lg:hidden"/>
            <div className="w-full lg:w-1/2 h-3/12 lg:h-full lg:p-8 flex flex-col gap-4 justify-center items-center lg:justify-start lg:items-start">
                <div className="h-16">
                    <img src={'/images/karya-group-logo.webp'} alt="karya group logo" className="h-full drop-shadow"/>
                </div>
                <div className="hidden lg:flex w-full flex-1  justify-center items-center">
                    <img src="/icons/person-notes.svg" alt="person notes icon" className=" drop-shadow"/>
                </div>
            </div>
            <div className="w-full lg:w-1/2 h-9/12 lg:h-full bg-gray-3 rounded-t-2xl lg:rounded-none p-8 flex flex-col justify-between lg:justify-center items-center gap-2 lg:gap-8">
                <div className="flex flex-col justify-center items-center gap-8 w-full lg:w-2/3">
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-2xl font-semibold">Login</p>
                        <p className="text-sm">Login to my account</p>
                    </div>
                    <div className="w-full flex flex-col justify-center items-center gap-8">
                        <div className="w-full flex flex-col border-b border-blue-6">
                            <p className="text-xs text-blue-6">Email</p>
                            <Input
                            variant="borderless"
                            placeholder="My Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="w-full flex flex-col border-b border-blue-6">
                            <p className="text-xs text-blue-6">Password</p>
                            <Input
                            variant="borderless"
                            placeholder="My Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            />
                        </div>
                        <Button
                        type="primary" 
                        shape="round" 
                        block
                        onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                        {contextHolder}
                    </div>
                </div>
                <p className="text-xs text-gray-12/70">&copy; 2025 Karya Group. All rights reserved.</p>
            </div>
        </div>
    )
}