import "./Navbar.scss";
import logo from "./featherLogo.svg";

import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../../redux/hooks";
import { setUserData, signOut } from "../../redux/auth/authSlice";

import { useEffect, useRef, useState } from "react";
import { Modal } from "../modal/Modal";
import { useGetSignedInUserQuery, useSignOutUserMutation } from "../../redux/auth/authApi";


export const Navbar = () => {
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const [signOutUser] = useSignOutUserMutation();

    const navbarRef = useRef<HTMLDivElement>(null);

    const [showHamMenu, setShowHamMenu] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const { data: auth, isLoading: isLoadingAuth } = useGetSignedInUserQuery();

    useEffect(() => {
        if (!isLoadingAuth) {
            if (auth) {
                dispatch(setUserData(auth));
                window.localStorage.setItem("wasUserSignedIn", "true");
            }
            else {
                window.localStorage.setItem("wasUserSignedIn", "false");
            }
        }

        const closeHamMenu = (e: MouseEvent) => {
            if (!(e.target instanceof HTMLElement)) return;
            !navbarRef.current?.contains(e.target) && setShowHamMenu(false);
        };
        document.addEventListener("click", closeHamMenu);
        return () => { document.removeEventListener("click", closeHamMenu); };
    }, [auth, isLoadingAuth, dispatch]);



    const handleSignOut = async () => {
        try {
            await signOutUser().unwrap();
            dispatch(signOut());
            window.localStorage.setItem("wasUserSignedIn", "false");
            navigate("/");
        } catch (error) {
            console.error("Could not sign out!", error);
        }
    };



    return (
        <>
            <div className="navbar-wrapper">
                <div className="navbar" ref={navbarRef}>
                    <div className="navbar__logo">
                        <Link to="/"> <img src={logo} alt="Logo" /></Link>
                    </div>

                    <nav className={showHamMenu ? "navbar__options-wrapper navbar__options-wrapper--active" : "navbar__options-wrapper"} >
                        <div className="navbar__options">
                            <Link to="/" onClick={() => { setShowHamMenu(false); }}>HOME</Link>
                            {(window.localStorage.getItem("wasUserSignedIn") === "true") ?
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