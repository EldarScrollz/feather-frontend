import { Outlet, ScrollRestoration } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";


export const RootLayout = () =>
{
    return (
        <>
            <Navbar />
            
            <div><Outlet /></div>
            <ScrollRestoration/> 
        </>
    );
};