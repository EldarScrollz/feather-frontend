import "./Navbar.scss";
import logo from "./featherLogo.svg";

import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchPosts } from "../../redux/slices/postsSlice";
import { selectIsAuth, signOut } from "../../redux/slices/authSlice";

import { useEffect, useRef, useState } from "react";
import { Modal } from "../modal/Modal";


export const Navbar = () =>
{
    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const isUserSignedIn = useAppSelector(selectIsAuth);
    const navbarRef = useRef<HTMLDivElement>(null);

    const [showHamMenu, setShowHamMenu] = useState(false);

    const [showModal, setShowModal] = useState(false);



    // Close hamburger menu when clicking outside of it
    useEffect(() =>
    {
        const closeHamMenu = (e: MouseEvent) => { !navbarRef.current?.contains(e.target as HTMLElement) && setShowHamMenu(false); };
        document.addEventListener("click", closeHamMenu);
        return () => { document.removeEventListener("click", closeHamMenu); };
    }, []);



    const handleSignOut = () => 
    {
        // dispatch(signOut()); window.localStorage.removeItem("accessToken");
        // todo: should remove accessToken on the server.
        navigate("/");
    };



    return (
        <>
            <div className="navbar-wrapper">
                <div className="navbar" ref={navbarRef}>
                    <div className="navbar__logo">
                        <Link to="/" onClick={() => dispatch(fetchPosts())}> <img src={logo} alt="Logo" /></Link>
                    </div>

                    <nav className={showHamMenu ? "navbar__options-wrapper navbar__options-wrapper--active" : "navbar__options-wrapper"} >
                        <div className="navbar__options">
                            <Link to="/" onClick={() => { setShowHamMenu(false); dispatch(fetchPosts()); }}>HOME</Link>
                            {isUserSignedIn ?
                                <>
                                    <Link to="/create-post" onClick={() => setShowHamMenu(false)}>CREATE POST</Link>
                                    <Link to="/user-profile" onClick={() => setShowHamMenu(false)}>PROFILE</Link>
                                    <button onClick={() => setShowModal(true)}>SIGN OUT</button>
                                </>
                                :
                                <>
                                    <Link to="/sign-in" onClick={() => setShowHamMenu(false)}>SIGN IN</Link>
                                    <Link to="/sign-up" onClick={() => setShowHamMenu(false)}>SIGN UP</Link>
                                </>
                            }
                        </div>
                    </nav>

                    <button className="navbar__hamburger-menu" onClick={() => { setShowHamMenu(!showHamMenu); }}>
                        <span className="navbar__hamburger-menu-bar"></span>
                        <span className="navbar__hamburger-menu-bar"></span>
                        <span className="navbar__hamburger-menu-bar"></span>
                    </button>
                </div>
            </div>

            {showModal && <Modal text={"Sign out?"} setShowModal={setShowModal} performAction={() => handleSignOut()} />}
        </>
    );
};